package com.lawntracker.worker

import android.content.Context
import com.github.michaelbull.result.get
import com.github.michaelbull.result.onFailure
import com.github.michaelbull.result.onSuccess
import com.github.michaelbull.result.runCatching
import com.lawntracker.differenceInCalendarDays
import com.lawntracker.getHoursOfDay
import com.lawntracker.state.SchemaVersion
import com.lawntracker.state.Settings
import com.lawntracker.state.StorageKey
import com.lawntracker.state.getStoredItem
import com.lawntracker.state.setStoredItem
import com.lawntracker.state.storageJson
import kotlinx.datetime.Clock
import kotlinx.serialization.Serializable

const val MAX_RECENT_TIMES_CHECKED = 100
const val MAX_RECENT_TIMES_NOTIFIED = 10

@Serializable
data class BackgroundTaskManager(
    val recentTimesCheckedUnixMs: List<Long>,
    val recentTimesNotificationDueUnixMs: List<Long>,
    val recentErrors: List<String>,
    val apiVersion: SchemaVersion = SchemaVersion.V0_1,
)

val DEFAULT_BACKGROUND_TASK_MANAGER = BackgroundTaskManager(
    recentTimesCheckedUnixMs = emptyList(),
    recentTimesNotificationDueUnixMs = emptyList(),
    recentErrors = emptyList(),
    apiVersion = SchemaVersion.V0_1,
)

fun checkIfNotificationsDue(
    settings: Settings,
    backgroundTaskManager: BackgroundTaskManager,
    nowUnixMs: Long = Clock.System.now().toEpochMilliseconds(),
): Pair<BackgroundTaskManager, Boolean> {
    val lastNotificationDue = backgroundTaskManager.recentTimesNotificationDueUnixMs.lastOrNull()
    val isNowPastCutoff = getHoursOfDay(nowUnixMs) >= settings.earliestNotificationTimeHrs
    val notificationDueNow = if (lastNotificationDue != null) {
        differenceInCalendarDays(nowUnixMs, lastNotificationDue) >= 1 && isNowPastCutoff
    } else {
        isNowPastCutoff
    }
    val recentTimesCheckedUnixMs =
        backgroundTaskManager.recentTimesCheckedUnixMs.takeLast(MAX_RECENT_TIMES_CHECKED - 1) + nowUnixMs
    val recentTimesNotificationDueUnixMs = if (notificationDueNow) {
        backgroundTaskManager.recentTimesNotificationDueUnixMs.takeLast(MAX_RECENT_TIMES_NOTIFIED - 1) + nowUnixMs
    } else {
        backgroundTaskManager.recentTimesNotificationDueUnixMs
    }
    return Pair(
        BackgroundTaskManager(
            apiVersion = backgroundTaskManager.apiVersion,
            recentTimesCheckedUnixMs = recentTimesCheckedUnixMs,
            recentTimesNotificationDueUnixMs = recentTimesNotificationDueUnixMs,
            recentErrors = backgroundTaskManager.recentErrors,
        ),
        notificationDueNow,
    )
}

suspend fun writeBackgroundTaskManager(
    context: Context,
    backgroundTaskManager: BackgroundTaskManager,
) {
    println("Writing background task manager")
    runCatching {
        storageJson.encodeToString(backgroundTaskManager)
    }.onSuccess { encoded ->
        setStoredItem(
            context,
            StorageKey.BackgroundTaskManager,
            encoded,
        )
        println("Wrote background task manager")
    }.onFailure { e ->
        println("Error writing background task manager: ${e.message}")
    }
}

suspend fun getStoredBackgroundTaskManager(context: Context): BackgroundTaskManager? {
    println("Attempting to get Background Task Manager from device")
    val maybeBackgroundTaskManager = getStoredItem(context, StorageKey.BackgroundTaskManager)
    if (maybeBackgroundTaskManager != null) {
        return runCatching {
            storageJson.decodeFromString<BackgroundTaskManager>(maybeBackgroundTaskManager)
        }.onFailure { e ->
            println("Error parsing stored background task manager: ${e.message}")
        }.get()
    }
    println("Background task manager was not found on device")
    return null
}
