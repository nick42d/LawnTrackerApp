package com.lawntracker.api

import com.lawntracker.celsiusToFahrenheit
import com.lawntracker.fahrenheitToCelsius
import com.lawntracker.startOfDayUnixMs
import com.lawntracker.state.UnitOfMeasure
import com.lawntracker.state.Weather
import com.lawntracker.state.WeatherAppCondition
import com.lawntracker.state.WeatherAppDay
import com.lawntracker.state.WeatherDayType
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder

enum class ApiTemperatureUnit(val apiParam: String) {
    Celsius("celsius"),
    Farenheit("farenheit"),
}

object IntBinaryBooleanSerializer : KSerializer<Boolean> {
    override val descriptor: SerialDescriptor =
        PrimitiveSerialDescriptor("IntBinaryBoolean", PrimitiveKind.INT)

    override fun deserialize(decoder: Decoder): Boolean =
        decoder.decodeInt() == 1

    override fun serialize(encoder: Encoder, value: Boolean) {
        encoder.encodeInt(if (value) 1 else 0)
    }
}

@Serializable
data class WeatherApiLocation(
    val id: Int,
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val feature_code: String,
    val timezone: String? = null,
    val elevation: Double? = null,
    val country_code: String? = null,
    val country: String? = null,
    val country_id: Int? = null,
    val population: Long? = null,
    val postcodes: List<String>? = null,
    val admin1: String? = null,
    val admin2: String? = null,
    val admin3: String? = null,
    val admin4: String? = null,
    val admin1_id: Int? = null,
    val admin2_id: Int? = null,
    val admin3_id: Int? = null,
    val admin4_id: Int? = null,
)

@Serializable
data class WeatherApiLocations(
    val results: List<WeatherApiLocation> = emptyList(),
)

@Serializable
data class WeatherApiCurrentUnits(
    val time: String,
    val interval: String,
    val temperature_2m: String,
    val is_day: String,
    val weather_code: String,
)

@Serializable
data class WeatherApiCurrent(
    val time: Long,
    val interval: Int,
    val temperature_2m: Double,
    @Serializable(with = IntBinaryBooleanSerializer::class)
    val is_day: Boolean,
    val weather_code: Int,
)

@Serializable
data class WeatherApiDailyUnits(
    val time: String,
    val temperature_2m_max: String,
    val temperature_2m_min: String,
)

@Serializable
data class WeatherApiDaily(
    val time: List<Long>,
    val temperature_2m_max: List<Double>,
    val temperature_2m_min: List<Double>,
)

@Serializable
data class WeatherApiForecast(
    val latitude: Double,
    val longitude: Double,
    val generationtime_ms: Double,
    val utc_offset_seconds: Int,
    val timezone: String,
    val timezone_abbreviation: String,
    val elevation: Double,
    val current_units: WeatherApiCurrentUnits,
    val current: WeatherApiCurrent,
    val daily_units: WeatherApiDailyUnits,
    val daily: WeatherApiDaily,
)

fun appUnitOfMeasureToApiTemperatureUnit(unit: UnitOfMeasure): ApiTemperatureUnit =
    if (unit == UnitOfMeasure.Metric) ApiTemperatureUnit.Celsius else ApiTemperatureUnit.Farenheit

fun apiWeatherToAppWeather(
    apiWeather: WeatherApiForecast,
    temperatureUnit: UnitOfMeasure,
): Weather {
    val curDay = startOfDayUnixMs(apiWeather.current.time * 1000L)
    val weatherArray = apiWeather.daily.time.mapIndexed { i, t ->
        val thisDay = startOfDayUnixMs(t * 1000L)
        WeatherAppDay(
            dateUnixMs = thisDay,
            weatherType = if (thisDay >= curDay) WeatherDayType.Forecasted else WeatherDayType.Historical,
            maxTemp = apiWeather.daily.temperature_2m_max[i],
            minTemp = apiWeather.daily.temperature_2m_min[i],
        )
    }
    return Weather(
        currentCondition = WeatherAppCondition(
            code = apiWeather.current.weather_code,
            isDay = apiWeather.current.is_day,
            temp = apiWeather.current.temperature_2m,
        ),
        weatherArray = weatherArray,
        temperatureUnit = temperatureUnit,
    )
}

enum class InvariantStatus {
    Initial,
    Ok,
    Failed,
}

data class WeatherInvariantCheck(
    val status: InvariantStatus,
    val lastDateUnixMs: Long?,
)

fun checkWeatherInvariants(weather: Weather): WeatherInvariantCheck =
    weather.weatherArray.fold(
        WeatherInvariantCheck(status = InvariantStatus.Initial, lastDateUnixMs = null),
    ) { acc, e ->
        if (acc.status == InvariantStatus.Failed) {
            WeatherInvariantCheck(
                status = InvariantStatus.Failed,
                lastDateUnixMs = acc.lastDateUnixMs,
            )
        } else if (acc.status == InvariantStatus.Initial || acc.lastDateUnixMs == null) {
            WeatherInvariantCheck(status = InvariantStatus.Ok, lastDateUnixMs = e.dateUnixMs)
        } else {
            val prevDate = startOfDayUnixMs(acc.lastDateUnixMs)
            val nextDate = startOfDayUnixMs(e.dateUnixMs)
            if (nextDate > prevDate) {
                WeatherInvariantCheck(status = InvariantStatus.Ok, lastDateUnixMs = nextDate)
            } else {
                WeatherInvariantCheck(status = InvariantStatus.Failed, lastDateUnixMs = nextDate)
            }
        }
    }

fun convertUnits(weather: Weather, newUnit: UnitOfMeasure): Weather {
    if (weather.temperatureUnit == newUnit) return weather
    val converter: (Double) -> Double =
        if (newUnit == UnitOfMeasure.Imperial) ::celsiusToFahrenheit else ::fahrenheitToCelsius
    val newWeatherArray = weather.weatherArray.map { w ->
        WeatherAppDay(
            maxTemp = converter(w.maxTemp),
            minTemp = converter(w.minTemp),
            weatherType = w.weatherType,
            dateUnixMs = w.dateUnixMs,
        )
    }
    return Weather(
        currentCondition = weather.currentCondition,
        weatherArray = newWeatherArray,
        temperatureUnit = newUnit,
    )
}

fun prettyPrintLocationDescription(l: WeatherApiLocation): String {
    if (!l.admin1.isNullOrEmpty() && !l.country.isNullOrEmpty()) return "${l.admin1}, ${l.country}"
    if (!l.country.isNullOrEmpty()) return l.country
    if (!l.admin1.isNullOrEmpty()) return l.admin1
    return ""
}
