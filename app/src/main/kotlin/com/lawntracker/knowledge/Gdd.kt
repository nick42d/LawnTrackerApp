package com.lawntracker.knowledge

import com.github.michaelbull.result.Err
import com.github.michaelbull.result.Ok
import com.github.michaelbull.result.Result
import com.lawntracker.calcGdd
import com.lawntracker.state.GddAlgorithm
import com.lawntracker.state.GddTracker
import com.lawntracker.state.Location
import com.lawntracker.state.LocationError
import com.lawntracker.state.WeatherDayType
import com.lawntracker.state.WeatherLoadStatus
import kotlin.math.roundToInt

fun calcGddTotal(
    item: GddTracker,
    locations: List<Location>,
    algorithm: GddAlgorithm,
): Result<Int, LocationError> {
    val itemsLocation = locations.find { loc -> loc.apiId == item.locationId }
        ?: return Err(LocationError.MissingLocation("Location not found"))
    val weather = itemsLocation.weather
        ?: return Err(LocationError.MissingWeather("Weather was undefined"))

    val dailyGddsFilter = weather.weatherArray.filter { day ->
        day.dateUnixMs >= item.start_date_unix_ms &&
            day.weatherType == WeatherDayType.Historical
    }
    val total = dailyGddsFilter.sumOf { day ->
        calcGdd(day.minTemp, day.maxTemp, item.base_temp, algorithm)
    }
    return Ok(total.roundToInt())
}

fun isWeatherRefreshing(
    item: GddTracker,
    locations: List<Location>,
): Result<Boolean, LocationError> {
    val itemsLocation = locations.find { loc -> loc.apiId == item.locationId }
        ?: return Err(LocationError.MissingLocation("Location not found"))
    return Ok(itemsLocation.weatherStatus.status == WeatherLoadStatus.Refreshing)
}

fun isWeatherInitialized(
    item: GddTracker,
    locations: List<Location>,
): Result<Boolean, LocationError> {
    val itemsLocation = locations.find { loc -> loc.apiId == item.locationId }
        ?: return Err(LocationError.MissingLocation("Location not found"))
    return Ok(itemsLocation.weatherStatus.status == WeatherLoadStatus.Initialised)
}
