package com.lawntracker.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CloudQueue
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.GpsFixed
import androidx.compose.material.icons.filled.Hotel
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material.icons.filled.Today
import androidx.compose.material3.AssistChip
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.lawntracker.addDaysUnixMs
import com.lawntracker.differenceInCalendarDays
import com.lawntracker.formatLocaleDateString
import com.lawntracker.startOfDayUnixMs
import com.lawntracker.state.Location
import com.lawntracker.state.Settings
import com.lawntracker.state.Tracker
import com.lawntracker.ui.components.trackercard.AppIcon
import com.lawntracker.ui.components.trackercard.CalloutStatus
import com.lawntracker.ui.components.trackercard.LeftCalloutProps
import com.lawntracker.ui.components.trackercard.trackerPropsToCardProps
import kotlinx.datetime.Clock

fun mapIconToVector(icon: AppIcon): ImageVector =
    when (icon) {
        AppIcon.CalendarClock -> Icons.Default.Event
        AppIcon.ClockStart -> Icons.Default.AccessTime
        AppIcon.WeatherCloudyClock -> Icons.Default.CloudQueue
        AppIcon.MapMarker -> Icons.Default.Place
        AppIcon.Target -> Icons.Default.GpsFixed
        AppIcon.CalendarStart -> Icons.Default.Today
        AppIcon.CalendarEnd -> Icons.Default.Event
        AppIcon.CalendarMultiple -> Icons.Default.DateRange
        AppIcon.ChartTimeline -> Icons.Default.Timeline
        AppIcon.Delete -> Icons.Default.Delete
        AppIcon.Play -> Icons.Default.PlayArrow
        AppIcon.RotateLeft -> Icons.AutoMirrored.Filled.Undo
        AppIcon.Stop -> Icons.Default.Stop
    }

@Composable
fun LeftCallout(props: LeftCalloutProps) {
    val bgColor = if (props.status == null) {
        props.backgroundColor ?: Color.Transparent
    } else {
        Color.Transparent
    }
    val boxModifier = Modifier
        .size(40.dp)
        .background(
            color = bgColor,
            shape = RoundedCornerShape(6.dp),
        )
    Box(
        modifier = boxModifier,
        contentAlignment = Alignment.Center,
    ) {
        when (props.status) {
            CalloutStatus.Refreshing -> CircularProgressIndicator(
                modifier = Modifier.size(24.dp),
                strokeWidth = 2.dp,
            )
            CalloutStatus.Initialised -> {}
            CalloutStatus.Stopped -> Icon(
                imageVector = Icons.Default.Stop,
                contentDescription = "Stopped",
                modifier = Modifier.size(40.dp),
            )
            null -> Text(
                text = props.text ?: "",
                style = MaterialTheme.typography.bodyLarge,
                textAlign = TextAlign.Center,
            )
        }
    }
}

@Composable
fun TrackerCard(
    item: Tracker,
    settings: Settings,
    locations: List<Location>,
    onDelete: () -> Unit,
    onReset: () -> Unit,
    onStop: () -> Unit,
    onResume: () -> Unit,
    onCancelSnooze: () -> Unit,
    onNavigateViewTracker: (String) -> Unit,
) {
    val props = trackerPropsToCardProps(
        tracker = item,
        settings = settings,
        locations = locations,
        onDelete = onDelete,
        onReset = onReset,
        onStop = onStop,
        onResume = onResume,
        onNavigateViewTracker = onNavigateViewTracker,
    )
    val nowMs = Clock.System.now().toEpochMilliseconds()
    val snoozedMs = item.lastSnoozedUnixMs
    val snoozeUntilDateUnixMs = if (snoozedMs != null && differenceInCalendarDays(nowMs, snoozedMs) == 0) {
        addDaysUnixMs(startOfDayUnixMs(snoozedMs), 1)
    } else {
        null
    }

    ElevatedCard(
        onClick = {
            println("Pressed card")
            props.onPress()
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
                if (props.leftCalloutProps != null) {
                    LeftCallout(props.leftCalloutProps)
                    Spacer(modifier = Modifier.width(12.dp))
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = props.heading,
                        style = MaterialTheme.typography.titleLarge,
                    )
                    if (props.subheading.isNotEmpty()) {
                        Text(
                            text = props.subheading,
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                }
                Icon(
                    imageVector = mapIconToVector(props.rightIcon),
                    contentDescription = props.rightIcon.name,
                    modifier = Modifier
                        .padding(end = 10.dp)
                        .size(40.dp),
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                props.lines.forEach { l ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = mapIconToVector(l.icon),
                            contentDescription = l.title,
                            modifier = Modifier.size(20.dp),
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${l.title}: ${l.text}",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                }
                if (snoozeUntilDateUnixMs != null) {
                    AssistChip(
                        onClick = {},
                        label = {
                            Text("Snoozed until ${formatLocaleDateString(snoozeUntilDateUnixMs)}")
                        },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Hotel,
                                contentDescription = "Snoozed",
                                modifier = Modifier.size(18.dp),
                            )
                        },
                        trailingIcon = {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Cancel snooze",
                                modifier = Modifier
                                    .size(18.dp)
                                    .clickable { onCancelSnooze() },
                            )
                        },
                    )
                }
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                horizontalArrangement = Arrangement.End,
            ) {
                props.actions.forEach { a ->
                    TextButton(onClick = a.callback) {
                        Icon(
                            imageVector = mapIconToVector(a.icon),
                            contentDescription = a.name,
                            modifier = Modifier.size(18.dp),
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(a.name)
                    }
                }
            }
        }
    }
}
