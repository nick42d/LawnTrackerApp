package com.lawntracker.worker

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.lawntracker.MainActivity
import com.lawntracker.R
import com.lawntracker.state.AppStore
import com.lawntracker.state.StateAction
import com.lawntracker.state.TrackerStatusCheck
import com.lawntracker.state.getStoredState
import com.lawntracker.state.snoozeTracker
import com.lawntracker.state.stopTracker
import com.lawntracker.state.writeTrackers
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

enum class NotificationAction(val id: String) {
    Snooze("snooze"),
    Stop("stop"),
}

val NOTIFICATION_ACTIONS = listOf(NotificationAction.Snooze, NotificationAction.Stop)

fun displayNotificationAction(n: NotificationAction): String =
    when (n) {
        NotificationAction.Snooze -> "Snooze 1 day"
        NotificationAction.Stop -> "Stop tracking"
    }

const val DEFAULT_CHANNEL_ID = "default"
const val DEFAULT_CHANNEL_NAME = "Default Channel"
const val EXTRA_TRACKER_ID = "trackerId"
const val EXTRA_ACTION_ID = "actionId"
const val EXTRA_NOTIFICATION_ID = "notificationId"

fun displayTrackerNotification(context: Context, status: TrackerStatusCheck) {
    val msg = "Tracker '${status.trackerName}' target exceeded"
    if (status is TrackerStatusCheck.TargetReached) {
        val detail = "Target: ${status.stringTarget}, Current: ${status.stringActual}"
        displayNotification(
            context = context,
            msg = msg,
            detail = detail,
            actionsList = NOTIFICATION_ACTIONS,
            trackerId = status.trackerId,
        )
    }
}

fun displayNotification(
    context: Context,
    msg: String,
    detail: String,
    actionsList: List<NotificationAction>,
    trackerId: String?,
) {
    println("Called onDisplayNotification")
    val notificationManager = NotificationManagerCompat.from(context)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val channel = NotificationChannel(
            DEFAULT_CHANNEL_ID,
            DEFAULT_CHANNEL_NAME,
            NotificationManager.IMPORTANCE_DEFAULT,
        )
        notificationManager.createNotificationChannel(channel)
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        val granted = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.POST_NOTIFICATIONS,
        ) == PackageManager.PERMISSION_GRANTED
        if (!granted) {
            println("Notification permission not granted")
            return
        }
    }

    val notificationId = trackerId?.hashCode() ?: msg.hashCode()

    val openIntent = Intent(
        Intent.ACTION_VIEW,
        Uri.parse(
            if (trackerId != null) {
                "lawntracker://tracker/view/$trackerId"
            } else {
                "lawntracker://"
            },
        ),
        context,
        MainActivity::class.java,
    ).apply {
        flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
    }
    val openPendingIntent = PendingIntent.getActivity(
        context,
        notificationId,
        openIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    val builder = NotificationCompat.Builder(context, DEFAULT_CHANNEL_ID)
        .setSmallIcon(R.drawable.ic_notification)
        .setContentTitle(msg)
        .setContentText(detail)
        .setContentIntent(openPendingIntent)
        .setAutoCancel(true)

    actionsList.forEachIndexed { idx, action ->
        val actionIntent = Intent(context, NotificationActionReceiver::class.java).apply {
            putExtra(EXTRA_TRACKER_ID, trackerId)
            putExtra(EXTRA_ACTION_ID, action.id)
            putExtra(EXTRA_NOTIFICATION_ID, notificationId)
        }
        val actionPendingIntent = PendingIntent.getBroadcast(
            context,
            notificationId * 10 + idx + 1,
            actionIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        builder.addAction(0, displayNotificationAction(action), actionPendingIntent)
    }

    notificationManager.notify(notificationId, builder.build())
}

suspend fun backgroundSnoozeTrackerId(context: Context, trackerId: String) {
    val state = getStoredState(context)
    if (state == null) {
        println("No local state on device")
        return
    }
    val idx = state.trackers.indexOfFirst { t -> t.uuid == trackerId }
    if (idx == -1) {
        println("Couldn't find tracker $trackerId")
        return
    }
    val newTrackers = state.trackers.toMutableList()
    newTrackers[idx] = snoozeTracker(state.trackers[idx])
    writeTrackers(context, newTrackers)
    AppStore.dispatch(StateAction.SnoozeTrackerId(trackerId), persist = false)
}

suspend fun backgroundStopTrackerId(context: Context, trackerId: String) {
    val state = getStoredState(context)
    if (state == null) {
        println("No local state on device")
        return
    }
    val idx = state.trackers.indexOfFirst { t -> t.uuid == trackerId }
    if (idx == -1) {
        println("Couldn't find tracker $trackerId")
        return
    }
    val newTrackers = state.trackers.toMutableList()
    newTrackers[idx] = stopTracker(state.trackers[idx])
    writeTrackers(context, newTrackers)
    AppStore.dispatch(StateAction.StopTrackerId(trackerId), persist = false)
}

enum class NotificationAuthStatus {
    NOT_DETERMINED,
    DENIED,
    AUTHORIZED,
    PROVISIONAL,
}

fun getNotificationAuthStatus(context: Context): NotificationAuthStatus {
    val enabled = NotificationManagerCompat.from(context).areNotificationsEnabled()
    if (!enabled) return NotificationAuthStatus.DENIED
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        val granted = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.POST_NOTIFICATIONS,
        ) == PackageManager.PERMISSION_GRANTED
        return if (granted) NotificationAuthStatus.AUTHORIZED else NotificationAuthStatus.DENIED
    }
    return NotificationAuthStatus.AUTHORIZED
}

class NotificationActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val trackerId = intent.getStringExtra(EXTRA_TRACKER_ID) ?: return
        val actionId = intent.getStringExtra(EXTRA_ACTION_ID) ?: return
        val notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, -1)
        if (notificationId != -1) {
            NotificationManagerCompat.from(context).cancel(notificationId)
        }
        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            when (actionId) {
                NotificationAction.Snooze.id -> backgroundSnoozeTrackerId(context, trackerId)
                NotificationAction.Stop.id -> backgroundStopTrackerId(context, trackerId)
                else -> println("Received unhandled pressAction: $actionId")
            }
            pendingResult.finish()
        }
    }
}
