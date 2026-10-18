package com.lawntracker

import com.github.michaelbull.result.Ok
import com.lawntracker.api.InvariantStatus
import com.lawntracker.api.WeatherApiForecast
import com.lawntracker.api.WeatherApiLocations
import com.lawntracker.api.WeatherUpdate
import com.lawntracker.api.addWeather
import com.lawntracker.api.addWeatherArrayToLocations
import com.lawntracker.api.apiWeatherToAppWeather
import com.lawntracker.api.checkWeatherInvariants
import com.lawntracker.api.convertUnits
import com.lawntracker.api.openMeteoJson
import com.lawntracker.api.prettyPrintLocationDescription
import com.lawntracker.knowledge.calcGddTotal
import com.lawntracker.state.AddCalendarTrackerInput
import com.lawntracker.state.AddGddTrackerInput
import com.lawntracker.state.AddTimedTrackerInput
import com.lawntracker.state.CalendarTracker
import com.lawntracker.state.ContextStatus
import com.lawntracker.state.FunctionlessStateContext
import com.lawntracker.state.GddAlgorithm
import com.lawntracker.state.GddTracker
import com.lawntracker.state.Location
import com.lawntracker.state.StateAction
import com.lawntracker.state.TimedTracker
import com.lawntracker.state.TrackerStatus
import com.lawntracker.state.TrackerStatusCheck
import com.lawntracker.state.UnitOfMeasure
import com.lawntracker.state.Weather
import com.lawntracker.state.WeatherAppCondition
import com.lawntracker.state.WeatherAppDay
import com.lawntracker.state.WeatherDayType
import com.lawntracker.state.WeatherLoadStatus
import com.lawntracker.state.WeatherStatus
import com.lawntracker.state.cancelSnoozeTracker
import com.lawntracker.state.defaultSettings
import com.lawntracker.state.newNotificationStatus
import com.lawntracker.state.newTracker
import com.lawntracker.state.reducer
import com.lawntracker.state.resetTracker
import com.lawntracker.state.resumeTracker
import com.lawntracker.state.snoozeTracker
import com.lawntracker.state.stopTracker
import com.lawntracker.state.trackerStatus
import com.lawntracker.state.validateAddTrackerInput
import com.lawntracker.ui.components.gddplot.PlotWeatherType
import com.lawntracker.ui.components.gddplot.getGddEstimate
import com.lawntracker.ui.components.gddplot.getGraphPlot
import com.lawntracker.ui.components.gddplot.getTrackerGddArray
import com.lawntracker.worker.DEFAULT_BACKGROUND_TASK_MANAGER
import com.lawntracker.worker.checkIfNotificationsDue
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class LawnTrackerTests {

    @Test
    fun testOpenMeteoWeatherDeserializationAndTransformation() {
        val sampleJson = """
            {
              "latitude": -31.95,
              "longitude": 115.86,
              "generationtime_ms": 0.45,
              "utc_offset_seconds": 28800,
              "timezone": "Australia/Perth",
              "timezone_abbreviation": "AWST",
              "elevation": 16.0,
              "current_units": {
                "time": "unixtime",
                "interval": "seconds",
                "temperature_2m": "°C",
                "is_day": "",
                "weather_code": "wmo code"
              },
              "current": {
                "time": 1700000000,
                "interval": 900,
                "temperature_2m": 24.5,
                "is_day": 1,
                "weather_code": 0
              },
              "daily_units": {
                "time": "unixtime",
                "temperature_2m_max": "°C",
                "temperature_2m_min": "°C"
              },
              "daily": {
                "time": [1699920000, 1700006400, 1700092800],
                "temperature_2m_max": [26.0, 28.0, 30.0],
                "temperature_2m_min": [14.0, 16.0, 18.0]
              }
            }
        """.trimIndent()

        val forecast = openMeteoJson.decodeFromString<WeatherApiForecast>(sampleJson)
        assertTrue(forecast.current.is_day)
        assertEquals(24.5, forecast.current.temperature_2m)
        assertEquals(3, forecast.daily.time.size)

        val appWeather = apiWeatherToAppWeather(forecast, UnitOfMeasure.Metric)
        assertEquals(3, appWeather.weatherArray.size)
        assertEquals(WeatherDayType.Historical, appWeather.weatherArray[0].weatherType)
        assertEquals(WeatherDayType.Forecasted, appWeather.weatherArray[1].weatherType)
        assertEquals(WeatherDayType.Forecasted, appWeather.weatherArray[2].weatherType)

        val inv = checkWeatherInvariants(appWeather)
        assertEquals(InvariantStatus.Ok, inv.status)

        val converted = convertUnits(appWeather, UnitOfMeasure.Imperial)
        assertEquals(UnitOfMeasure.Imperial, converted.temperatureUnit)
        assertEquals(celsiusToFahrenheit(26.0), converted.weatherArray[0].maxTemp, 0.001)
    }

    @Test
    fun testOpenMeteoLocationsDeserializationCoercesEmptyResults() {
        val emptyResponse = """{"generationtime_ms":0.2}"""
        val locations = openMeteoJson.decodeFromString<WeatherApiLocations>(emptyResponse)
        assertTrue(locations.results.isEmpty())

        val populatedJson = """
            {
              "results": [
                {
                  "id": 2063523,
                  "name": "Perth",
                  "latitude": -31.95224,
                  "longitude": 115.8614,
                  "feature_code": "PPLA",
                  "country": "Australia",
                  "admin1": "Western Australia"
                }
              ],
              "generationtime_ms": 0.18203259
            }
        """.trimIndent()
        val parsed = openMeteoJson.decodeFromString<WeatherApiLocations>(populatedJson)
        assertEquals(1, parsed.results.size)
        assertEquals("Western Australia, Australia", prettyPrintLocationDescription(parsed.results[0]))
    }

    @Test
    fun testGddCalculationsAndTotal() {
        assertEquals(10.0, calcGdd(10.0, 30.0, 10.0, GddAlgorithm.VariantA), 0.001)
        assertEquals(0.0, calcGdd(0.0, 10.0, 10.0, GddAlgorithm.VariantA), 0.001)
        assertEquals(7.5, calcGdd(5.0, 25.0, 10.0, GddAlgorithm.VariantB), 0.001)

        val day0 = startOfDayUnixMs(1700000000000L)
        val day1 = addDaysUnixMs(day0, 1)
        val day2 = addDaysUnixMs(day0, 2)

        val location = Location(
            apiId = 100,
            name = "Test City",
            latitude = 0.0,
            longitude = 0.0,
            country = "AU",
            admin1 = "WA",
            weatherStatus = WeatherStatus(lastRefreshedUnixMs = day2, status = WeatherLoadStatus.Loaded),
            weather = Weather(
                currentCondition = WeatherAppCondition(code = 0, isDay = true, temp = 22.0),
                temperatureUnit = UnitOfMeasure.Metric,
                weatherArray = listOf(
                    WeatherAppDay(dateUnixMs = day0, weatherType = WeatherDayType.Historical, minTemp = 15.0, maxTemp = 25.0),
                    WeatherAppDay(dateUnixMs = day1, weatherType = WeatherDayType.Historical, minTemp = 15.0, maxTemp = 25.0),
                    WeatherAppDay(dateUnixMs = day2, weatherType = WeatherDayType.Forecasted, minTemp = 20.0, maxTemp = 30.0),
                ),
            ),
        )

        val tracker = GddTracker(
            uuid = "t-1",
            name = "PGR",
            description = "Primo Maxx",
            start_date_unix_ms = day0,
            target_gdd = 25.0,
            base_temp = 10.0,
            locationId = 100,
            trackerStatus = TrackerStatus.Running,
            lastSnoozedUnixMs = null,
            notificationStatus = newNotificationStatus(),
        )

        val res = calcGddTotal(tracker, listOf(location), GddAlgorithm.VariantA)
        assertEquals(Ok(20), res)

        val gddArr = getTrackerGddArray(tracker, listOf(location), GddAlgorithm.VariantA)
        assertNotNull(gddArr)
        assertTrue(gddArr.size > 3)

        val estimate = getGddEstimate(gddArr, 25.0)
        assertNotNull(estimate)
        assertEquals(PlotWeatherType.Forecasted, estimate.estimateType)
        assertEquals(day2, estimate.estimateDateUnixMs)

        val plot = getGraphPlot(gddArr)
        assertEquals(gddArr.size, plot.items.size)
        assertEquals(2, plot.forecastStartIndex)
        assertEquals(3, plot.estimateStartIndex)
    }

    @Test
    fun testValidationAndTrackerStateTransitions() {
        val day0 = startOfDayUnixMs(1700000000000L)
        val loc = Location(
            apiId = 1,
            name = "Perth",
            latitude = -31.95,
            longitude = 115.86,
            country = "Australia",
            admin1 = "WA",
            weather = null,
            weatherStatus = WeatherStatus(lastRefreshedUnixMs = null, status = WeatherLoadStatus.Initialised),
        )

        val invalidInput = AddGddTrackerInput(
            name = "",
            description = "Test",
            start_date_unix_ms = day0,
            target_gdd = "abc",
            base_temp = "10.0",
            locationId = 1,
        )
        assertTrue(validateAddTrackerInput(invalidInput, listOf(loc), nowUnixMs = day0).isErr)

        val validInput = AddGddTrackerInput(
            name = "PGR Application",
            description = "Monthly PGR",
            start_date_unix_ms = day0,
            target_gdd = "200",
            base_temp = "10.0",
            locationId = 1,
        )
        val validated = validateAddTrackerInput(validInput, listOf(loc), nowUnixMs = day0)
        assertTrue(validated.isOk)

        val tracker = newTracker(validated.value)
        assertEquals(TrackerStatus.Running, tracker.trackerStatus)

        val snoozed = snoozeTracker(tracker) as GddTracker
        assertNotNull(snoozed.lastSnoozedUnixMs)

        val unsnoozed = cancelSnoozeTracker(snoozed) as GddTracker
        assertNull(unsnoozed.lastSnoozedUnixMs)

        val stopped = stopTracker(unsnoozed)
        assertEquals(TrackerStatus.Stopped, stopped.trackerStatus)

        val resumed = resumeTracker(stopped)
        assertEquals(TrackerStatus.Running, resumed.trackerStatus)

        val reset = resetTracker(resumed) as GddTracker
        assertEquals(TrackerStatus.Running, reset.trackerStatus)

        var state = FunctionlessStateContext(status = ContextStatus.Loaded, trackers = emptyList(), locations = listOf(loc))
        state = reducer(state, StateAction.AddTracker(tracker))
        assertEquals(1, state.trackers.size)

        val addedUuid = state.trackers[0].uuid
        state = reducer(state, StateAction.StopTrackerId(addedUuid))
        assertEquals(TrackerStatus.Stopped, state.trackers[0].trackerStatus)

        state = reducer(state, StateAction.DeleteTrackerId(addedUuid))
        assertTrue(state.trackers.isEmpty())
    }

    @Test
    fun testTimedAndCalendarTrackerStatus() {
        val nowMs = startOfDayUnixMs(1700000000000L)
        val pastStart = addDaysUnixMs(nowMs, -10)

        val timedInput = AddTimedTrackerInput(
            name = "Fert",
            description = "Liquid iron",
            start_date_unix_ms = pastStart,
            duration_days = "7",
        )
        val validTimed = validateAddTrackerInput(timedInput, emptyList(), nowUnixMs = nowMs).value
        val timedTracker = newTracker(validTimed) as TimedTracker

        val status = trackerStatus(timedTracker, nowMs, emptyList(), GddAlgorithm.VariantA)
        assertTrue(status is TrackerStatusCheck.TargetReached)

        val calInput = AddCalendarTrackerInput(
            name = "Reno",
            description = "Spring reno",
            target_date_unix_ms = addDaysUnixMs(nowMs, 5),
        )
        val validCal = validateAddTrackerInput(calInput, emptyList(), nowUnixMs = nowMs).value
        val calTracker = newTracker(validCal) as CalendarTracker
        val calStatus = trackerStatus(calTracker, nowMs, emptyList(), GddAlgorithm.VariantA)
        assertTrue(calStatus is TrackerStatusCheck.Running)
    }

    @Test
    fun testAddWeatherMergesHistoryAndForecast() {
        val day0 = startOfDayUnixMs(1700000000000L)
        val day1 = addDaysUnixMs(day0, 1)
        val day2 = addDaysUnixMs(day0, 2)

        val oldWeather = Weather(
            currentCondition = WeatherAppCondition(code = 0, isDay = true, temp = 20.0),
            temperatureUnit = UnitOfMeasure.Metric,
            weatherArray = listOf(
                WeatherAppDay(dateUnixMs = day0, weatherType = WeatherDayType.Historical, minTemp = 10.0, maxTemp = 20.0),
                WeatherAppDay(dateUnixMs = day1, weatherType = WeatherDayType.Forecasted, minTemp = 11.0, maxTemp = 21.0),
            ),
        )
        val newWeather = Weather(
            currentCondition = WeatherAppCondition(code = 1, isDay = false, temp = 18.0),
            temperatureUnit = UnitOfMeasure.Metric,
            weatherArray = listOf(
                WeatherAppDay(dateUnixMs = day1, weatherType = WeatherDayType.Historical, minTemp = 12.0, maxTemp = 22.0),
                WeatherAppDay(dateUnixMs = day2, weatherType = WeatherDayType.Forecasted, minTemp = 13.0, maxTemp = 23.0),
            ),
        )
        val merged = addWeather(oldWeather, newWeather)
        assertEquals(3, merged.weatherArray.size)
        assertEquals(12.0, merged.weatherArray[1].minTemp)

        val loc = Location(
            apiId = 42,
            name = "Loc",
            latitude = 0.0,
            longitude = 0.0,
            country = null,
            admin1 = null,
            weather = oldWeather,
            weatherStatus = WeatherStatus(lastRefreshedUnixMs = day0, status = WeatherLoadStatus.Loaded),
        )
        val updatedLocs = addWeatherArrayToLocations(
            listOf(loc),
            listOf(WeatherUpdate(weather = newWeather, locationId = 42)),
        )
        assertEquals(3, updatedLocs[0].weather?.weatherArray?.size)
    }

    @Test
    fun testBackgroundTaskManagerNotificationDueCheck() {
        val settings = defaultSettings().copy(earliestNotificationTimeHrs = 0)
        val initialBtm = DEFAULT_BACKGROUND_TASK_MANAGER
        val (afterFirstCheck, due1) = checkIfNotificationsDue(settings, initialBtm)
        assertTrue(due1)
        assertEquals(1, afterFirstCheck.recentTimesCheckedUnixMs.size)
        assertEquals(1, afterFirstCheck.recentTimesNotificationDueUnixMs.size)

        val (afterSecondCheckSameDay, due2) = checkIfNotificationsDue(settings, afterFirstCheck)
        assertFalse(due2)
        assertEquals(2, afterSecondCheckSameDay.recentTimesCheckedUnixMs.size)
        assertEquals(1, afterSecondCheckSameDay.recentTimesNotificationDueUnixMs.size)
    }

    @Test
    fun testDatePickerTimezoneAndFormatFixedAndSchemaVersion() {
        val perthTz = kotlinx.datetime.TimeZone.of("Australia/Perth")
        val nyTz = kotlinx.datetime.TimeZone.of("America/New_York")
        val sampleEpochMs = 1729224000000L

        for (tz in listOf(perthTz, nyTz, kotlinx.datetime.TimeZone.UTC)) {
            val expectedLocalStart = startOfDayUnixMs(sampleEpochMs, tz)
            val utcPickerMs = localMsToUtcDateMillis(expectedLocalStart, tz)
            val roundTripLocalStart = utcDateMillisToLocalStartOfDayMs(utcPickerMs, tz)
            assertEquals(expectedLocalStart, roundTripLocalStart)
            assertEquals(
                formatLocaleDateString(expectedLocalStart, tz),
                formatLocaleDateString(roundTripLocalStart, tz),
            )
        }

        assertEquals("0.0001", formatFixed(0.0001, 4))
        assertEquals("100000000.00", formatFixed(100000000.0, 2))
        assertEquals("NaN", formatFixed(Double.NaN, 2))

        val day0 = startOfDayUnixMs(sampleEpochMs)
        val plot = getGraphPlot(
            listOf(
                com.lawntracker.ui.components.gddplot.DailyGddAcc(
                    gdd = 12.5,
                    gddAcc = 12.5,
                    dateUnixMs = day0,
                    weatherType = PlotWeatherType.Historical,
                ),
            ),
        )
        assertEquals(formatShortDayMonth(day0, padDay = false), plot.items[0].label)

        val encodedSettings = com.lawntracker.state.storageJson.encodeToString(defaultSettings())
        assertTrue(encodedSettings.contains("\"apiVersion\":\"0.1\""))
    }
}
