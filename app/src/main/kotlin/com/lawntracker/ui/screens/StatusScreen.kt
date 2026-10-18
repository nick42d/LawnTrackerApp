package com.lawntracker.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.lawntracker.MAX_TOTAL_ASYNC_STORAGE_BYTES
import com.lawntracker.api.fetchLocations
import com.lawntracker.differenceInCalendarDays
import com.lawntracker.formatFixed
import com.lawntracker.formatLocaleDateTimeString
import com.lawntracker.getHoursOfDay
import com.lawntracker.getMinutesOfHour
import com.lawntracker.prettyPrintBytes
import com.lawntracker.state.Settings
import com.lawntracker.state.getAllStoredKeysAndBytes
import com.lawntracker.worker.BackgroundTaskManager
import com.lawntracker.worker.DEFAULT_BACKGROUND_TASK_MANAGER
import com.lawntracker.worker.NotificationAuthStatus
import com.lawntracker.worker.getNotificationAuthStatus
import com.lawntracker.worker.getStoredBackgroundTaskManager
import kotlinx.datetime.Clock
import kotlin.math.abs
import kotlin.math.truncate

enum class MetricStatus(val color: Color) {
    Green(Color(0xFF008000)),
    Orange(Color(0xFFFFA500)),
    Red(Color(0xFFFF0000)),
}

@Composable
fun StatusScreen(settings: Settings) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    var resumeTrigger by remember { mutableIntStateOf(0) }
    var backgroundTaskManager by remember { mutableStateOf<BackgroundTaskManager?>(null) }
    var notificationStatus by remember { mutableStateOf<NotificationAuthStatus?>(null) }
    var apiStatus by remember { mutableStateOf<MetricStatus?>(null) }
    var totalKeys by remember { mutableStateOf<Int?>(null) }
    var totalStorage by remember { mutableStateOf<Long?>(null) }

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                resumeTrigger++
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    LaunchedEffect(resumeTrigger) {
        backgroundTaskManager = getStoredBackgroundTaskManager(context) ?: DEFAULT_BACKGROUND_TASK_MANAGER
        notificationStatus = getNotificationAuthStatus(context)
        val locationsResult = fetchLocations("Perth", 10)
        apiStatus = if (locationsResult != null) MetricStatus.Green else MetricStatus.Red
        val (keys, bytes) = getAllStoredKeysAndBytes(context)
        totalKeys = keys
        totalStorage = bytes
    }

    val btm = backgroundTaskManager
    val notifStatus = notificationStatus
    val api = apiStatus
    val keysCount = totalKeys
    val storageBytes = totalStorage

    if (btm == null || notifStatus == null || api == null || keysCount == null || storageBytes == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    val recentTimesCheckedUnixMs = btm.recentTimesCheckedUnixMs
    val recentTimesNotificationDueUnixMs = btm.recentTimesNotificationDueUnixMs
    val lastDue = recentTimesNotificationDueUnixMs.lastOrNull()
    val lastChecked = recentTimesCheckedUnixMs.lastOrNull()

    val averageNotificationDueTime: Double? = if (recentTimesNotificationDueUnixMs.isNotEmpty()) {
        recentTimesNotificationDueUnixMs.sumOf { e ->
            (getHoursOfDay(e) * 60.0 + getMinutesOfHour(e)) / 60.0
        } / recentTimesNotificationDueUnixMs.size.toDouble()
    } else {
        null
    }

    val averageGapBetween: Double? = if (recentTimesCheckedUnixMs.size >= 2) {
        recentTimesCheckedUnixMs
            .dropLast(1)
            .mapIndexed { idx, v ->
                ((recentTimesCheckedUnixMs[idx + 1] - v) / 1000.0) / 3600.0
            }
            .sum() / (recentTimesCheckedUnixMs.size - 1).toDouble()
    } else {
        null
    }

    val nowMs = Clock.System.now().toEpochMilliseconds()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    ) {
        StatusSubheader("Notification metrics")
        StatusItem(
            title = "Last checked",
            description = lastChecked?.let { formatLocaleDateTimeString(it) } ?: "",
            status = metricLastChecked(lastChecked, nowMs),
        )
        StatusItem(
            title = "Average gap between time checked (hrs)",
            description = averageGapBetween?.let { formatFixed(it, 2) } ?: "",
            status = metricAverageTimeBetween(averageGapBetween, settings),
        )
        StatusItem(
            title = "Last due",
            description = lastDue?.let { formatLocaleDateTimeString(it) } ?: "",
            status = metricLastDue(lastDue, nowMs),
        )
        StatusItem(
            title = "Average time of day notifications due (24h)",
            description = averageNotificationDueTime?.let {
                val hoursPart = truncate(it).toInt()
                val minutesPart = formatFixed((it - truncate(it)) * 60.0, 0).padStart(2, '0')
                "$hoursPart:$minutesPart"
            } ?: "",
            status = metricAverageTimeDue(averageNotificationDueTime, settings),
        )
        StatusItem(
            title = "Notification status",
            description = prettyPrintAuthorizationStatus(notifStatus),
            status = metricAuthorizationStatus(notifStatus),
        )

        StatusSubheader("Weather API metrics")
        StatusItem(
            title = "API status",
            description = null,
            status = api,
        )

        StatusSubheader("Storage Metrics")
        StatusItem(
            title = "Total number of stored keys",
            description = keysCount.toString(),
            status = metricTotalKeys(keysCount),
        )
        StatusItem(
            title = "Total storage used",
            description = prettyPrintBytes(storageBytes),
            status = metricTotalStorage(storageBytes),
        )
    }
}

@Composable
private fun StatusSubheader(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.labelLarge,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
    )
}

@Composable
private fun StatusItem(
    title: String,
    description: String?,
    status: MetricStatus,
) {
    ListItem(
        headlineContent = { Text(title) },
        supportingContent = if (description != null) {
            { Text(description) }
        } else {
            null
        },
        trailingContent = {
            Box(
                modifier = Modifier
                    .size(20.dp)
                    .background(status.color, CircleShape),
            )
        },
    )
}

fun metricLastChecked(lastChecked: Long?, nowMs: Long): MetricStatus {
    if (lastChecked == null) return MetricStatus.Orange
    if (differenceInCalendarDays(nowMs, lastChecked) > 1) return MetricStatus.Red
    return MetricStatus.Green
}

fun metricLastDue(lastDue: Long?, nowMs: Long): MetricStatus {
    if (lastDue == null) return MetricStatus.Orange
    if (differenceInCalendarDays(nowMs, lastDue) > 1) return MetricStatus.Red
    return MetricStatus.Green
}

fun metricTotalStorage(totalStorage: Long): MetricStatus {
    if (totalStorage >= MAX_TOTAL_ASYNC_STORAGE_BYTES * 0.95) return MetricStatus.Red
    if (totalStorage >= MAX_TOTAL_ASYNC_STORAGE_BYTES * 0.8) return MetricStatus.Orange
    return MetricStatus.Green
}

fun metricTotalKeys(@Suppress("UNUSED_PARAMETER") totalKeys: Int): MetricStatus = MetricStatus.Green

fun metricAverageTimeBetween(
    averageGapBetween: Double?,
    settings: Settings,
): MetricStatus {
    if (averageGapBetween == null) return MetricStatus.Orange
    if (abs(averageGapBetween - settings.backgroundTaskIntervalHrs) >= 0.5) return MetricStatus.Red
    return MetricStatus.Green
}

fun metricAverageTimeDue(
    averageNotificationDueTime: Double?,
    settings: Settings,
): MetricStatus {
    if (averageNotificationDueTime == null) return MetricStatus.Orange
    if (abs(averageNotificationDueTime - settings.earliestNotificationTimeHrs) >= 2.0) return MetricStatus.Red
    return MetricStatus.Green
}

fun metricAuthorizationStatus(status: NotificationAuthStatus): MetricStatus =
    when (status) {
        NotificationAuthStatus.NOT_DETERMINED -> MetricStatus.Orange
        NotificationAuthStatus.DENIED -> MetricStatus.Red
        NotificationAuthStatus.AUTHORIZED -> MetricStatus.Green
        NotificationAuthStatus.PROVISIONAL -> MetricStatus.Orange
    }

fun prettyPrintAuthorizationStatus(status: NotificationAuthStatus): String =
    when (status) {
        NotificationAuthStatus.NOT_DETERMINED -> "Unknown"
        NotificationAuthStatus.DENIED -> "Denied"
        NotificationAuthStatus.AUTHORIZED -> "Authorized"
        NotificationAuthStatus.PROVISIONAL -> "Partial"
    }
