package com.lawntracker.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Public
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.lawntracker.celsiusToFahrenheit
import com.lawntracker.fahrenheitToCelsius
import com.lawntracker.formatDateString
import com.lawntracker.formatFixed
import com.lawntracker.state.Location
import com.lawntracker.state.Settings
import com.lawntracker.state.UnitOfMeasure
import com.lawntracker.state.WeatherLoadStatus
import com.lawntracker.state.prettyPrintLocation
import com.lawntracker.state.unitOfMeasureAbbreviate

@Composable
fun WeatherLeftCallout(
    status: WeatherLoadStatus,
    temperature: Double?,
    unitOfMeasure: UnitOfMeasure?,
) {
    Box(
        modifier = Modifier.size(40.dp),
        contentAlignment = Alignment.Center,
    ) {
        when (status) {
            WeatherLoadStatus.Refreshing -> CircularProgressIndicator(
                modifier = Modifier.size(24.dp),
                strokeWidth = 2.dp,
            )
            WeatherLoadStatus.Initialised -> {}
            else -> {
                val tempText = if (temperature != null) formatFixed(temperature, 1) else ""
                val unitText = if (unitOfMeasure != null) "°${unitOfMeasureAbbreviate(unitOfMeasure)}" else "°"
                Text(
                    text = "$tempText\n$unitText",
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = TextAlign.Center,
                )
            }
        }
    }
}

@Composable
fun LocationsCard(
    location: Location,
    settings: Settings,
    onDelete: () -> Unit,
    onNavigateViewLocation: (Location) -> Unit,
) {
    val weather = location.weather
    val weatherImages = weather?.let { getWeatherImagesObject(it.currentCondition) }
    val temperatureConverter: (Double) -> Double =
        if (settings.unit_of_measure == UnitOfMeasure.Imperial) ::celsiusToFahrenheit else ::fahrenheitToCelsius
    val convertedTemperature = if (weather != null) {
        if (weather.temperatureUnit != settings.unit_of_measure) {
            temperatureConverter(weather.currentCondition.temp)
        } else {
            weather.currentCondition.temp
        }
    } else {
        null
    }
    val loggingStartUnixMs = weather?.weatherArray?.firstOrNull()?.dateUnixMs

    ElevatedCard(
        onClick = {
            println("Pressed location card")
            onNavigateViewLocation(location)
        },
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                WeatherLeftCallout(
                    status = location.weatherStatus.status,
                    temperature = convertedTemperature,
                    unitOfMeasure = if (weather != null) settings.unit_of_measure else null,
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = prettyPrintLocation(location),
                        style = MaterialTheme.typography.titleLarge,
                    )
                    if (weatherImages != null) {
                        Text(
                            text = weatherImages.desc,
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                }
                if (weatherImages != null) {
                    val bitmap = rememberAssetImageBitmap(weatherImages.assetPath)
                    if (bitmap != null) {
                        Image(
                            bitmap = bitmap,
                            contentDescription = weatherImages.desc,
                            modifier = Modifier.size(48.dp),
                        )
                    }
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Public,
                        contentDescription = "Latitude",
                        modifier = Modifier.size(20.dp),
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Latitude: ${formatFixed(location.latitude, 4)}",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Explore,
                        contentDescription = "Longitude",
                        modifier = Modifier.size(20.dp),
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Longitude: ${formatFixed(location.longitude, 4)}",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.DateRange,
                        contentDescription = "Logging start",
                        modifier = Modifier.size(20.dp),
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Logging start: ${if (loggingStartUnixMs != null) formatDateString(loggingStartUnixMs) else ""}",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                horizontalArrangement = Arrangement.End,
            ) {
                TextButton(onClick = onDelete) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete",
                        modifier = Modifier.size(18.dp),
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Delete")
                }
            }
        }
    }
}
