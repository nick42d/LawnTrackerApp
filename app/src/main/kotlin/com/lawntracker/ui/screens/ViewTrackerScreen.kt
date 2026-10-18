package com.lawntracker.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lawntracker.addDaysUnixMs
import com.lawntracker.api.checkWeatherInvariants
import com.lawntracker.differenceInCalendarDays
import com.lawntracker.formatLocaleDateString
import com.lawntracker.state.CalendarTracker
import com.lawntracker.state.GddTracker
import com.lawntracker.state.Location
import com.lawntracker.state.Settings
import com.lawntracker.state.TimedTracker
import com.lawntracker.state.Tracker
import com.lawntracker.ui.components.GddDataTable
import com.lawntracker.ui.components.GddPlot
import com.lawntracker.ui.components.TrackerPropsView
import com.lawntracker.ui.components.gddplot.getGraphPlot
import com.lawntracker.ui.components.gddplot.getTrackerGddArray
import kotlinx.datetime.Clock

@Composable
fun ViewTrackerScreen(
    item: Tracker?,
    locations: List<Location>,
    settings: Settings,
) {
    locations.forEach { l ->
        val w = l.weather
        if (w != null) {
            checkWeatherInvariants(w)
        }
    }

    val gddArray = if (item is GddTracker) {
        getTrackerGddArray(item, locations, settings.algorithm)
    } else {
        null
    }
    val plotData = gddArray?.let { getGraphPlot(it) }
    val nowMs = Clock.System.now().toEpochMilliseconds()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    ) {
        if (item != null) {
            TrackerPropsView(tracker = item, locations = locations)
        }
        if (item is GddTracker && gddArray != null && plotData != null) {
            Column(verticalArrangement = Arrangement.spacedBy(30.dp)) {
                GddPlot(data = plotData, targetGdd = item.target_gdd)
                GddDataTable(gddArray = gddArray)
            }
        }
        if (item is CalendarTracker) {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                ) {
                    Text("Parameter", style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
                    Text("Current value", style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
                }
                HorizontalDivider()
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                ) {
                    Text("Days to target", style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                    Text(
                        text = differenceInCalendarDays(item.target_date_unix_ms, nowMs).toString(),
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.weight(1f),
                    )
                }
                HorizontalDivider()
            }
        }
        if (item is TimedTracker) {
            val targetDateMs = addDaysUnixMs(item.start_date_unix_ms, item.duration_days)
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                ) {
                    Text("Parameter", style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
                    Text("Current value", style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
                }
                HorizontalDivider()
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                ) {
                    Text("Days to target", style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                    Text(
                        text = differenceInCalendarDays(targetDateMs, nowMs).toString(),
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.weight(1f),
                    )
                }
                HorizontalDivider()
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                ) {
                    Text("Target date", style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                    Text(
                        text = formatLocaleDateString(targetDateMs),
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.weight(1f),
                    )
                }
                HorizontalDivider()
            }
        }
    }
}
