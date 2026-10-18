package com.lawntracker.ui.components

import android.content.Context
import android.graphics.BitmapFactory
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import com.lawntracker.state.WeatherAppCondition

data class WeatherImagesObject(
    val code: Int,
    val descDay: String,
    val descNight: String,
    val iconCode: Int,
) {
    val dayAssetPath: String get() = "weather_icons/64x64/day/$iconCode.png"
    val nightAssetPath: String get() = "weather_icons/64x64/night/$iconCode.png"
}

data class ResolvedWeatherImage(
    val assetPath: String,
    val desc: String,
)

val WEATHER_IMAGES: List<WeatherImagesObject> = listOf(
    WeatherImagesObject(code = 0, descDay = "Sunny", descNight = "Clear", iconCode = 113),
    WeatherImagesObject(code = 1, descDay = "Partly cloudy", descNight = "Partly cloudy", iconCode = 116),
    WeatherImagesObject(code = 2, descDay = "Cloudy", descNight = "Cloudy", iconCode = 119),
    WeatherImagesObject(code = 3, descDay = "Overcast", descNight = "Overcast", iconCode = 122),
    WeatherImagesObject(code = 45, descDay = "Fog", descNight = "Fog", iconCode = 248),
    WeatherImagesObject(code = 48, descDay = "Freezing fog", descNight = "Freezing fog", iconCode = 260),
    WeatherImagesObject(code = 51, descDay = "Patchy light drizzle", descNight = "Patchy light drizzle", iconCode = 263),
    WeatherImagesObject(code = 53, descDay = "Light drizzle", descNight = "Light drizzle", iconCode = 266),
    WeatherImagesObject(code = 56, descDay = "Freezing drizzle", descNight = "Freezing drizzle", iconCode = 281),
    WeatherImagesObject(code = 57, descDay = "Heavy freezing drizzle", descNight = "Heavy freezing drizzle", iconCode = 284),
    WeatherImagesObject(code = 55, descDay = "Patchy light rain", descNight = "Patchy light rain", iconCode = 293),
    WeatherImagesObject(code = 61, descDay = "Light rain", descNight = "Light rain", iconCode = 296),
    WeatherImagesObject(code = 63, descDay = "Moderate rain", descNight = "Moderate rain", iconCode = 302),
    WeatherImagesObject(code = 65, descDay = "Heavy rain", descNight = "Heavy rain", iconCode = 308),
    WeatherImagesObject(code = 66, descDay = "Light freezing rain", descNight = "Light freezing rain", iconCode = 311),
    WeatherImagesObject(code = 67, descDay = "Moderate or heavy freezing rain", descNight = "Moderate or heavy freezing rain", iconCode = 314),
    WeatherImagesObject(code = 71, descDay = "Light snow", descNight = "Light snow", iconCode = 326),
    WeatherImagesObject(code = 73, descDay = "Moderate snow", descNight = "Moderate snow", iconCode = 332),
    WeatherImagesObject(code = 75, descDay = "Heavy snow", descNight = "Heavy snow", iconCode = 338),
    WeatherImagesObject(code = 77, descDay = "Ice pellets", descNight = "Ice pellets", iconCode = 350),
    WeatherImagesObject(code = 80, descDay = "Light rain shower", descNight = "Light rain shower", iconCode = 353),
    WeatherImagesObject(code = 81, descDay = "Moderate rain shower", descNight = "Moderate rain shower", iconCode = 356),
    WeatherImagesObject(code = 82, descDay = "Heavy rain shower", descNight = "Heavy rain shower", iconCode = 359),
    WeatherImagesObject(code = 85, descDay = "Light snow showers", descNight = "Light snow showers", iconCode = 368),
    WeatherImagesObject(code = 86, descDay = "Moderate or heavy snow showers", descNight = "Moderate or heavy snow showers", iconCode = 371),
    WeatherImagesObject(code = 95, descDay = "Moderate or heavy rain with thunder", descNight = "Moderate or heavy rain with thunder", iconCode = 389),
    WeatherImagesObject(code = 96, descDay = "Patchy light snow with thunder", descNight = "Patchy light snow with thunder", iconCode = 392),
    WeatherImagesObject(code = 99, descDay = "Moderate or heavy snow with thunder", descNight = "Moderate or heavy snow with thunder", iconCode = 395),
)

fun getWeatherImagesObject(condition: WeatherAppCondition): ResolvedWeatherImage? {
    val weatherImageSrc = WEATHER_IMAGES.find { x -> x.code == condition.code } ?: return null
    return if (condition.isDay) {
        ResolvedWeatherImage(assetPath = weatherImageSrc.dayAssetPath, desc = weatherImageSrc.descDay)
    } else {
        ResolvedWeatherImage(assetPath = weatherImageSrc.nightAssetPath, desc = weatherImageSrc.descNight)
    }
}

fun loadAssetBitmap(context: Context, assetPath: String): ImageBitmap? =
    com.github.michaelbull.result.runCatching {
        context.assets.open(assetPath).use { stream ->
            BitmapFactory.decodeStream(stream)?.asImageBitmap()
        }
    }.let { if (it.isOk) it.value else null }

@Composable
fun rememberAssetImageBitmap(assetPath: String): ImageBitmap? {
    val context = LocalContext.current
    return remember(assetPath) { loadAssetBitmap(context, assetPath) }
}
