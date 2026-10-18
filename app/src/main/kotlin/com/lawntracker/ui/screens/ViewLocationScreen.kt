package com.lawntracker.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lawntracker.formatFixed
import com.lawntracker.formatLocaleDateString
import com.lawntracker.formatLocaleDateTimeString
import com.lawntracker.state.Location
import com.lawntracker.ui.components.MapLibrePinMap

@Composable
fun ViewLocationScreen(item: Location) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    ) {
        ListItem(
            headlineContent = { Text("Name") },
            supportingContent = { Text(item.name) },
        )
        ListItem(
            headlineContent = { Text("Country") },
            supportingContent = { Text(item.country ?: "") },
        )
        ListItem(
            headlineContent = { Text("Latitude") },
            supportingContent = { Text(formatFixed(item.latitude, 4)) },
        )
        ListItem(
            headlineContent = { Text("Longitude") },
            supportingContent = { Text(formatFixed(item.longitude, 4)) },
        )
        ListItem(
            headlineContent = { Text("Status") },
            supportingContent = { Text(item.weatherStatus.status.name) },
        )
        ListItem(
            headlineContent = { Text("Last refreshed") },
            supportingContent = {
                Text(
                    item.weatherStatus.lastRefreshedUnixMs?.let { formatLocaleDateTimeString(it) }
                        ?: "Never",
                )
            },
        )

        MapLibrePinMap(
            longitude = item.longitude,
            latitude = item.latitude,
            zoomLevel = 2.0,
            showPin = true,
            modifier = Modifier
                .align(Alignment.CenterHorizontally)
                .fillMaxWidth(0.95f)
                .height(300.dp),
        )

        val weather = item.weather
        if (weather != null) {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                ) {
                    Text("Day", style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
                    Text("Max", style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
                    Text("Min", style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
                    Text("Type", style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
                }
                HorizontalDivider()
                weather.weatherArray.forEach { w ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                    ) {
                        Text(
                            text = formatLocaleDateString(w.dateUnixMs),
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.weight(1f),
                        )
                        Text(
                            text = w.maxTemp.toString(),
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.weight(1f),
                        )
                        Text(
                            text = w.minTemp.toString(),
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.weight(1f),
                        )
                        Text(
                            text = w.weatherType.name,
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.weight(1f),
                        )
                    }
                    HorizontalDivider()
                }
            }
        }
    }
}
