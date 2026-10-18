package com.lawntracker.api

import com.github.michaelbull.result.coroutines.runSuspendCatching
import com.github.michaelbull.result.get
import com.github.michaelbull.result.onFailure
import com.lawntracker.API_LOCATIONS_LANGUAGE
import com.lawntracker.API_LOCATIONS_URL
import com.lawntracker.API_UNIT_OF_MEASURE
import com.lawntracker.API_WEATHER_CURRENT_PARAMS
import com.lawntracker.API_WEATHER_DAILY_PARAMS
import com.lawntracker.API_WEATHER_URL
import com.lawntracker.MAX_FORECAST_DAYS
import com.lawntracker.MAX_HISTORY_DAYS
import com.lawntracker.celsiusToFahrenheit
import com.lawntracker.fahrenheitToCelsius
import com.lawntracker.state.Location
import com.lawntracker.state.UnitOfMeasure
import com.lawntracker.state.Weather
import com.lawntracker.state.WeatherAppDay
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.serialization.json.Json

val openMeteoJson = Json {
    ignoreUnknownKeys = true
    coerceInputValues = true
}

val httpClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(openMeteoJson)
    }
}

suspend fun fetchLocations(
    locName: String,
    results: Int,
): WeatherApiLocations? =
    runSuspendCatching {
        httpClient.get(API_LOCATIONS_URL) {
            parameter("name", locName)
            parameter("count", results)
            parameter("language", API_LOCATIONS_LANGUAGE)
            parameter("format", "json")
        }.body<WeatherApiLocations>()
    }.onFailure { e ->
        println("Error fetching locations: ${e.message}")
    }.get()

suspend fun fetchWeather(
    latitude: Double,
    longitude: Double,
    pastDays: Int,
    forecastDays: Int,
    unitOfMeasure: UnitOfMeasure,
): Weather? =
    runSuspendCatching {
        val temperatureUnit = appUnitOfMeasureToApiTemperatureUnit(unitOfMeasure)
        val forecast = httpClient.get(API_WEATHER_URL) {
            parameter("latitude", latitude)
            parameter("longitude", longitude)
            parameter("daily", API_WEATHER_DAILY_PARAMS.joinToString(","))
            parameter("current", API_WEATHER_CURRENT_PARAMS.joinToString(","))
            parameter("timeformat", "unixtime")
            parameter("timezone", "auto")
            parameter("past_days", pastDays)
            parameter("forecast_days", forecastDays)
            parameter("temperature_unit", temperatureUnit.apiParam)
            parameter("format", "json")
        }.body<WeatherApiForecast>()
        apiWeatherToAppWeather(forecast, unitOfMeasure)
    }.onFailure { e ->
        println("Error fetching weather: ${e.message}")
    }.get()

data class WeatherUpdate(
    val weather: Weather?,
    val locationId: Int,
)

suspend fun fetchLocationsWeather(locations: List<Location>): List<WeatherUpdate> =
    coroutineScope {
        locations.map { location ->
            async {
                WeatherUpdate(
                    weather = fetchWeather(
                        latitude = location.latitude,
                        longitude = location.longitude,
                        pastDays = MAX_HISTORY_DAYS,
                        forecastDays = MAX_FORECAST_DAYS,
                        unitOfMeasure = API_UNIT_OF_MEASURE,
                    ),
                    locationId = location.apiId,
                )
            }
        }.awaitAll()
    }

fun addWeatherArrayToLocations(
    locations: List<Location>,
    weatherArray: List<WeatherUpdate>,
): List<Location> =
    locations.map { l ->
        val weather = weatherArray.find { w -> l.apiId == w.locationId }
        if (weather != null) {
            println("Found matching location for returned weather: ${l.name}")
            addWeatherToLocation(l, weather.weather)
        } else {
            l
        }
    }

fun addWeatherToLocation(
    location: Location,
    newWeather: Weather?,
): Location {
    if (newWeather == null) return location
    val existingWeather = location.weather ?: return location.copy(weather = newWeather)
    return location.copy(weather = addWeather(existingWeather, newWeather))
}

fun convertWeatherUnits(
    weather: WeatherAppDay,
    newUnit: UnitOfMeasure,
): WeatherAppDay {
    val converter: (Double) -> Double =
        if (newUnit == UnitOfMeasure.Metric) ::fahrenheitToCelsius else ::celsiusToFahrenheit
    return WeatherAppDay(
        dateUnixMs = weather.dateUnixMs,
        weatherType = weather.weatherType,
        minTemp = converter(weather.minTemp),
        maxTemp = converter(weather.maxTemp),
    )
}

fun addWeather(weather: Weather, newWeather: Weather): Weather {
    val isUnitChange = weather.temperatureUnit != newWeather.temperatureUnit
    val newMinDay = newWeather.weatherArray.fold(Long.MAX_VALUE) { acc, cur ->
        minOf(acc, cur.dateUnixMs)
    }
    val filteredDays = weather.weatherArray
        .filter { cur -> cur.dateUnixMs < newMinDay }
        .map { w ->
            if (isUnitChange) convertWeatherUnits(w, newWeather.temperatureUnit) else w
        }
    val combinedDays = filteredDays + newWeather.weatherArray
    return Weather(
        currentCondition = newWeather.currentCondition,
        temperatureUnit = newWeather.temperatureUnit,
        weatherArray = combinedDays,
    )
}
