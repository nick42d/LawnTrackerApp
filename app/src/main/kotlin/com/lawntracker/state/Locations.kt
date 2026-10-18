package com.lawntracker.state

import kotlinx.serialization.Serializable

@Serializable
data class WeatherAppCondition(
    val code: Int,
    val temp: Double,
    val isDay: Boolean,
)

@Serializable
enum class WeatherLoadStatus {
    Initialised,
    Refreshing,
    Loaded,
    Error,
}

@Serializable
data class WeatherStatus(
    val lastRefreshedUnixMs: Long? = null,
    val status: WeatherLoadStatus,
)

@Serializable
enum class WeatherDayType {
    Historical,
    Forecasted,
}

@Serializable
data class WeatherAppDay(
    val dateUnixMs: Long,
    val weatherType: WeatherDayType,
    val maxTemp: Double,
    val minTemp: Double,
)

@Serializable
data class Weather(
    val currentCondition: WeatherAppCondition,
    val weatherArray: List<WeatherAppDay>,
    val temperatureUnit: UnitOfMeasure,
)

@Serializable
data class Location(
    val name: String,
    val apiId: Int,
    val latitude: Double,
    val longitude: Double,
    val country: String? = null,
    val admin1: String? = null,
    val weather: Weather? = null,
    val weatherStatus: WeatherStatus,
)

@Serializable
data class Locations(
    val apiVersion: SchemaVersion = SchemaVersion.V0_1,
    val locations: List<Location>,
)

fun newWeatherStatus(): WeatherStatus =
    WeatherStatus(
        lastRefreshedUnixMs = null,
        status = WeatherLoadStatus.Initialised,
    )

sealed interface LocationError {
    val message: String

    data class Timeout(override val message: String) : LocationError
    data class MissingDays(override val message: String) : LocationError
    data class MissingLocation(override val message: String) : LocationError
    data class MissingWeather(override val message: String) : LocationError
}

fun prettyPrintLocation(l: Location): String =
    if (!l.country.isNullOrEmpty()) "${l.name}, ${l.country}" else l.name
