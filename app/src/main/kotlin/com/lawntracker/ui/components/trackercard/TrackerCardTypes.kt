package com.lawntracker.ui.components.trackercard

import androidx.compose.ui.graphics.Color
import com.lawntracker.addDaysUnixMs
import com.lawntracker.differenceInCalendarDays
import com.lawntracker.formatDateString
import com.lawntracker.formatFixed
import com.github.michaelbull.result.get
import com.lawntracker.knowledge.calcGddTotal
import com.lawntracker.knowledge.isWeatherInitialized
import com.lawntracker.knowledge.isWeatherRefreshing
import com.lawntracker.state.CalendarTracker
import com.lawntracker.state.GddTracker
import com.lawntracker.state.Location
import com.lawntracker.state.Settings
import com.lawntracker.state.TimedTracker
import com.lawntracker.state.Tracker
import com.lawntracker.state.TrackerStatus
import com.lawntracker.ui.components.gddplot.getGddEstimate
import com.lawntracker.ui.components.gddplot.getTrackerGddArray
import kotlinx.datetime.Clock
import kotlin.math.abs

enum class AppIcon {
    CalendarClock,
    ClockStart,
    WeatherCloudyClock,
    MapMarker,
    Target,
    CalendarStart,
    CalendarEnd,
    CalendarMultiple,
    ChartTimeline,
    Delete,
    Play,
    RotateLeft,
    Stop,
}

enum class CalloutStatus {
    Refreshing,
    Stopped,
    Initialised,
}

data class LeftCalloutProps(
    val status: CalloutStatus? = null,
    val text: String? = null,
    val backgroundColor: Color? = null,
)

data class TrackerCardLineProps(
    val icon: AppIcon,
    val title: String,
    val text: String,
)

data class TrackerCardActionProps(
    val icon: AppIcon,
    val name: String,
    val callback: () -> Unit,
)

data class TrackerCardProps(
    val heading: String,
    val subheading: String,
    val leftCalloutProps: LeftCalloutProps? = null,
    val rightIcon: AppIcon,
    val lines: List<TrackerCardLineProps>,
    val actions: List<TrackerCardActionProps>,
    val onPress: () -> Unit,
)

fun formatDaysRem(daysRem: Int): String =
    "T${if (daysRem >= 0) "-" else "+"}${abs(daysRem)}"

private val CALLOUT_RED = Color(0xFFFF0000)
private val CALLOUT_ORANGE = Color(0xFFFFA500)

fun getGddTrackerCalloutColor(
    warningThresholdPerc: Double,
    cur: Double,
    target: Double,
): Color? {
    if (target <= 0.0) return CALLOUT_RED
    val progress = cur / target
    return when {
        progress >= 1.0 -> CALLOUT_RED
        progress >= warningThresholdPerc -> CALLOUT_ORANGE
        else -> null
    }
}

fun getCalendarTrackerCalloutColor(
    warningThresholdDays: Int,
    daysRem: Int,
): Color? =
    when {
        daysRem <= 0 -> CALLOUT_RED
        daysRem <= warningThresholdDays -> CALLOUT_ORANGE
        else -> null
    }

fun getTimedTrackerCalloutColor(
    warningThresholdPerc: Double,
    cur: Int,
    target: Int,
): Color? {
    if (target <= 0) return CALLOUT_RED
    val daysTowardsTarget = (target - cur).toDouble()
    val progress = daysTowardsTarget / target.toDouble()
    return when {
        progress >= 1.0 -> CALLOUT_RED
        progress >= warningThresholdPerc -> CALLOUT_ORANGE
        else -> null
    }
}

fun toGddTrackerCardProps(
    gddTracker: GddTracker,
    settings: Settings,
    locations: List<Location>,
    onDelete: () -> Unit,
    onReset: () -> Unit,
    onStop: () -> Unit,
    onResume: () -> Unit,
    onNavigateViewTracker: (String) -> Unit,
): TrackerCardProps {
    val actualGddOutcome = calcGddTotal(gddTracker, locations, settings.algorithm)
    val weatherIsRefreshing = isWeatherRefreshing(gddTracker, locations)
    val weatherIsInitialised = isWeatherInitialized(gddTracker, locations)
    val gddTrackerArray = getTrackerGddArray(
        gddTracker,
        locations,
        settings.algorithm,
    )
    val estimateTemp = if (gddTrackerArray != null) {
        getGddEstimate(gddTrackerArray, gddTracker.target_gdd)
    } else {
        null
    }
    val estimateTempString = if (estimateTemp != null) {
        formatDateString(estimateTemp.estimateDateUnixMs)
    } else {
        ""
    }
    val leftCalloutStatus = when {
        gddTracker.trackerStatus == TrackerStatus.Stopped -> CalloutStatus.Stopped
        weatherIsRefreshing.get() == true -> CalloutStatus.Refreshing
        weatherIsInitialised.get() == true -> CalloutStatus.Initialised
        else -> null
    }
    val actualGddVal = actualGddOutcome.get()?.toDouble() ?: Double.NaN
    val leftCalloutColor = if (!actualGddVal.isNaN()) {
        getGddTrackerCalloutColor(
            settings.warning_threshold_perc,
            actualGddVal,
            gddTracker.target_gdd,
        )
    } else {
        null
    }
    val leftCalloutText = actualGddOutcome.get()?.toString() ?: ""
    val leftCalloutProps = LeftCalloutProps(
        text = leftCalloutText,
        status = leftCalloutStatus,
        backgroundColor = leftCalloutColor,
    )
    val actions = buildList {
        add(TrackerCardActionProps(icon = AppIcon.Delete, name = "Delete", callback = onDelete))
        if (gddTracker.trackerStatus == TrackerStatus.Stopped) {
            add(TrackerCardActionProps(icon = AppIcon.Play, name = "Resume", callback = onResume))
        } else {
            add(TrackerCardActionProps(icon = AppIcon.RotateLeft, name = "Reset", callback = onReset))
            add(TrackerCardActionProps(icon = AppIcon.Stop, name = "Stop", callback = onStop))
        }
    }
    val locationName = locations.find { l -> l.apiId == gddTracker.locationId }?.name
    return TrackerCardProps(
        heading = gddTracker.name,
        subheading = gddTracker.description,
        leftCalloutProps = leftCalloutProps,
        rightIcon = AppIcon.WeatherCloudyClock,
        lines = listOf(
            TrackerCardLineProps(
                icon = AppIcon.MapMarker,
                title = "Location",
                text = locationName ?: "",
            ),
            TrackerCardLineProps(
                icon = AppIcon.Target,
                title = "Target GDD",
                text = formatFixed(gddTracker.target_gdd, 0),
            ),
            TrackerCardLineProps(
                icon = AppIcon.CalendarStart,
                title = "Start date",
                text = formatDateString(gddTracker.start_date_unix_ms),
            ),
            TrackerCardLineProps(
                icon = AppIcon.CalendarEnd,
                title = "Projected end date",
                text = estimateTempString,
            ),
            TrackerCardLineProps(
                icon = AppIcon.ChartTimeline,
                title = "Projection type",
                text = estimateTemp?.estimateType?.name ?: "",
            ),
        ),
        actions = actions,
        onPress = { onNavigateViewTracker(gddTracker.uuid) },
    )
}

fun toCalendarTrackerCardProps(
    calendarTracker: CalendarTracker,
    settings: Settings,
    onDelete: () -> Unit,
    onStop: () -> Unit,
    onResume: () -> Unit,
    onNavigateViewTracker: (String) -> Unit,
    nowUnixMs: Long = Clock.System.now().toEpochMilliseconds(),
): TrackerCardProps {
    val daysRem = differenceInCalendarDays(
        calendarTracker.target_date_unix_ms,
        nowUnixMs,
    )
    val leftCalloutColor = getCalendarTrackerCalloutColor(
        settings.warning_threshold_days,
        daysRem,
    )
    val leftCalloutStatus =
        if (calendarTracker.trackerStatus == TrackerStatus.Stopped) CalloutStatus.Stopped else null
    val actions = buildList {
        add(TrackerCardActionProps(icon = AppIcon.Delete, name = "Delete", callback = onDelete))
        if (calendarTracker.trackerStatus == TrackerStatus.Stopped) {
            add(TrackerCardActionProps(icon = AppIcon.Play, name = "Resume", callback = onResume))
        } else {
            add(TrackerCardActionProps(icon = AppIcon.Stop, name = "Stop", callback = onStop))
        }
    }
    return TrackerCardProps(
        heading = calendarTracker.name,
        subheading = calendarTracker.description,
        leftCalloutProps = LeftCalloutProps(
            text = formatDaysRem(daysRem),
            status = leftCalloutStatus,
            backgroundColor = leftCalloutColor,
        ),
        rightIcon = AppIcon.CalendarClock,
        lines = listOf(
            TrackerCardLineProps(
                icon = AppIcon.CalendarEnd,
                title = "Target Date",
                text = formatDateString(calendarTracker.target_date_unix_ms),
            ),
        ),
        actions = actions,
        onPress = { onNavigateViewTracker(calendarTracker.uuid) },
    )
}

fun toTimedTrackerCardProps(
    timedTracker: TimedTracker,
    settings: Settings,
    onDelete: () -> Unit,
    onReset: () -> Unit,
    onStop: () -> Unit,
    onResume: () -> Unit,
    onNavigateViewTracker: (String) -> Unit,
    nowUnixMs: Long = Clock.System.now().toEpochMilliseconds(),
): TrackerCardProps {
    val endDateUnixMs = addDaysUnixMs(timedTracker.start_date_unix_ms, timedTracker.duration_days)
    val daysRem = differenceInCalendarDays(endDateUnixMs, nowUnixMs)
    val leftCalloutText = formatDaysRem(daysRem)
    val leftCalloutStatus =
        if (timedTracker.trackerStatus == TrackerStatus.Stopped) CalloutStatus.Stopped else null
    val leftCalloutColor = getTimedTrackerCalloutColor(
        settings.warning_threshold_perc,
        daysRem,
        timedTracker.duration_days,
    )
    val actions = buildList {
        add(TrackerCardActionProps(icon = AppIcon.Delete, name = "Delete", callback = onDelete))
        if (timedTracker.trackerStatus == TrackerStatus.Stopped) {
            add(TrackerCardActionProps(icon = AppIcon.Play, name = "Resume", callback = onResume))
        } else {
            add(TrackerCardActionProps(icon = AppIcon.RotateLeft, name = "Reset", callback = onReset))
            add(TrackerCardActionProps(icon = AppIcon.Stop, name = "Stop", callback = onStop))
        }
    }
    return TrackerCardProps(
        heading = timedTracker.name,
        subheading = timedTracker.description,
        leftCalloutProps = LeftCalloutProps(
            text = leftCalloutText,
            status = leftCalloutStatus,
            backgroundColor = leftCalloutColor,
        ),
        rightIcon = AppIcon.ClockStart,
        lines = listOf(
            TrackerCardLineProps(
                icon = AppIcon.CalendarStart,
                title = "Start date",
                text = formatDateString(timedTracker.start_date_unix_ms),
            ),
            TrackerCardLineProps(
                icon = AppIcon.CalendarMultiple,
                title = "Duration days",
                text = timedTracker.duration_days.toString(),
            ),
            TrackerCardLineProps(
                icon = AppIcon.CalendarEnd,
                title = "End date",
                text = formatDateString(endDateUnixMs),
            ),
        ),
        actions = actions,
        onPress = { onNavigateViewTracker(timedTracker.uuid) },
    )
}

fun trackerPropsToCardProps(
    tracker: Tracker,
    settings: Settings,
    locations: List<Location>,
    onDelete: () -> Unit,
    onReset: () -> Unit,
    onStop: () -> Unit,
    onResume: () -> Unit,
    onNavigateViewTracker: (String) -> Unit,
): TrackerCardProps =
    when (tracker) {
        is GddTracker -> toGddTrackerCardProps(
            gddTracker = tracker,
            settings = settings,
            locations = locations,
            onDelete = onDelete,
            onReset = onReset,
            onStop = onStop,
            onResume = onResume,
            onNavigateViewTracker = onNavigateViewTracker,
        )
        is CalendarTracker -> toCalendarTrackerCardProps(
            calendarTracker = tracker,
            settings = settings,
            onDelete = onDelete,
            onStop = onStop,
            onResume = onResume,
            onNavigateViewTracker = onNavigateViewTracker,
        )
        is TimedTracker -> toTimedTrackerCardProps(
            timedTracker = tracker,
            settings = settings,
            onDelete = onDelete,
            onReset = onReset,
            onStop = onStop,
            onResume = onResume,
            onNavigateViewTracker = onNavigateViewTracker,
        )
    }
