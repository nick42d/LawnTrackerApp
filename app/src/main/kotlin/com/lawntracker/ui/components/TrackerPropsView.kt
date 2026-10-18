package com.lawntracker.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.ListItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import com.lawntracker.formatDateString
import com.lawntracker.formatFixed
import com.lawntracker.formatLocaleDateString
import com.lawntracker.state.CalendarTracker
import com.lawntracker.state.GddTracker
import com.lawntracker.state.Location
import com.lawntracker.state.TimedTracker
import com.lawntracker.state.Tracker
import com.lawntracker.state.getTrackerType

@Composable
fun TrackerPropsView(
    tracker: Tracker,
    locations: List<Location>,
) {
    fun getLocationText(locationId: Int): String =
        locations.find { l -> l.apiId == locationId }?.name ?: "Error"

    Column {
        ListItem(
            headlineContent = { Text("Tracker type") },
            supportingContent = { Text(getTrackerType(tracker)) },
        )
        ListItem(
            headlineContent = { Text("Name") },
            supportingContent = { Text(tracker.name) },
        )
        ListItem(
            headlineContent = { Text("Description") },
            supportingContent = { Text(tracker.description) },
        )
        when (tracker) {
            is GddTracker -> {
                ListItem(
                    headlineContent = { Text("Location") },
                    supportingContent = { Text(getLocationText(tracker.locationId)) },
                )
                ListItem(
                    headlineContent = { Text("Start date") },
                    supportingContent = { Text(formatLocaleDateString(tracker.start_date_unix_ms)) },
                )
                ListItem(
                    headlineContent = { Text("Target") },
                    supportingContent = { Text(formatFixed(tracker.target_gdd, 0)) },
                )
            }
            is CalendarTracker -> {
                ListItem(
                    headlineContent = { Text("Target date") },
                    supportingContent = { Text(formatDateString(tracker.target_date_unix_ms)) },
                )
            }
            is TimedTracker -> {
                ListItem(
                    headlineContent = { Text("Start date") },
                    supportingContent = { Text(formatLocaleDateString(tracker.start_date_unix_ms)) },
                )
                ListItem(
                    headlineContent = { Text("Target duration") },
                    supportingContent = { Text("${tracker.duration_days} days") },
                )
            }
        }
        ListItem(
            headlineContent = { Text("Tracker status") },
            supportingContent = { Text(tracker.trackerStatus.name) },
        )
    }
}
