package com.lawntracker.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.lawntracker.api.WeatherUpdate
import com.lawntracker.api.addWeatherArrayToLocations
import com.lawntracker.api.fetchLocationsWeather
import com.lawntracker.state.AppStore
import com.lawntracker.state.Settings
import com.lawntracker.state.StoredState
import com.lawntracker.state.WeatherLoadStatus
import com.lawntracker.state.WeatherStatus
import com.lawntracker.state.defaultSettings
import com.lawntracker.state.getStoredSettings
import com.lawntracker.state.getStoredState
import com.lawntracker.state.trackerStatus
import com.lawntracker.state.writeLocations
import com.lawntracker.state.writeTrackers
import kotlinx.datetime.Clock
import java.util.concurrent.TimeUnit
import kotlin.math.roundToLong

private const val WORK_NAME = "LawnTrackerPeriodicBackgroundTask"

fun initBackgroundFetch(
    context: Context,
    intervalHrs: Double,
    replaceExisting: Boolean = false,
) {
    val intervalMinutes = (intervalHrs * 60.0).roundToLong().coerceAtLeast(15L)
    val request = PeriodicWorkRequestBuilder<TrackerBackgroundWorker>(
        intervalMinutes,
        TimeUnit.MINUTES,
    ).build()

    val policy = if (replaceExisting) {
        ExistingPeriodicWorkPolicy.UPDATE
    } else {
        ExistingPeriodicWorkPolicy.KEEP
    }
    WorkManager.getInstance(context.applicationContext).enqueueUniquePeriodicWork(
        WORK_NAME,
        policy,
        request,
    )
    println("[BackgroundFetch] configured intervalHrs: $intervalHrs ($intervalMinutes mins)")
}

suspend fun runBackgroundCheck(context: Context, isAppInForeground: Boolean = false) {
    val state = getStoredState(context)
    val settings = getStoredSettings(context)
    val backgroundTaskManager = getStoredBackgroundTaskManager(context)

    val (newBackgroundTaskManager, notificationDueNow) = checkIfNotificationsDue(
        settings = settings ?: defaultSettings(),
        backgroundTaskManager = backgroundTaskManager ?: DEFAULT_BACKGROUND_TASK_MANAGER,
    )
    writeBackgroundTaskManager(context, newBackgroundTaskManager)

    if (state != null && notificationDueNow) {
        val fetchedWeatherArray = fetchLocationsWeather(state.locations)
        AppStore.updateLocationsWeather(fetchedWeatherArray, persist = false)
        val nowMs = Clock.System.now().toEpochMilliseconds()
        val newState = refreshStoredStateWeather(
            state = state,
            newWeather = fetchedWeatherArray,
            timeUnixMs = nowMs,
        )
        writeLocations(context, newState.locations)
        writeTrackers(context, newState.trackers)
        if (!isAppInForeground) {
            notifyFromStoredState(context, newState, settings)
        }
    }
}

fun notifyFromStoredState(
    context: Context,
    state: StoredState,
    settings: Settings?,
) {
    val certainSettings = settings ?: defaultSettings()
    val nowMs = Clock.System.now().toEpochMilliseconds()
    val notifications = state.trackers.map { t ->
        trackerStatus(t, nowMs, state.locations, certainSettings.algorithm)
    }
    notifications.forEach { status ->
        displayTrackerNotification(context, status)
    }
}

fun refreshStoredStateWeather(
    state: StoredState,
    newWeather: List<WeatherUpdate>,
    timeUnixMs: Long,
): StoredState {
    val refreshedLocations = addWeatherArrayToLocations(
        state.locations,
        newWeather,
    )
    return state.copy(
        locations = refreshedLocations.map { l ->
            l.copy(
                weatherStatus = WeatherStatus(
                    lastRefreshedUnixMs = timeUnixMs,
                    status = WeatherLoadStatus.Loaded,
                ),
            )
        },
    )
}

class TrackerBackgroundWorker(
    appContext: Context,
    workerParams: WorkerParameters,
) : CoroutineWorker(appContext, workerParams) {
    override suspend fun doWork(): Result {
        println("[BackgroundFetch] task event")
        return com.github.michaelbull.result.coroutines.runSuspendCatching {
            runBackgroundCheck(applicationContext, isAppInForeground = AppStore.isAppInForeground)
        }.let { res ->
            if (res.isOk) {
                println("[BackgroundFetch] executed")
                Result.success()
            } else {
                println("[BackgroundFetch] error: ${res.error.message}")
                Result.retry()
            }
        }
    }
}
