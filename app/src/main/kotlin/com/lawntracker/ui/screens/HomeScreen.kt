package com.lawntracker.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CloudQueue
import androidx.compose.material.icons.filled.Event
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SmallFloatingActionButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.lawntracker.state.AppStore
import com.lawntracker.state.Location
import com.lawntracker.state.Settings
import com.lawntracker.state.Tracker
import com.lawntracker.state.TrackerKind
import com.lawntracker.ui.components.ConfirmationDialog
import com.lawntracker.ui.components.TrackerCard
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    trackers: List<Tracker>,
    locations: List<Location>,
    settings: Settings,
    onNavigateAddTracker: (TrackerKind) -> Unit,
    onNavigateViewTracker: (String) -> Unit,
) {
    val scope = rememberCoroutineScope()
    var refreshing by remember { mutableStateOf(false) }
    var fabOpen by remember { mutableStateOf(false) }
    var dialogCallback by remember { mutableStateOf({}) }
    var dialogTitle by remember { mutableStateOf("") }
    var dialogMessage by remember { mutableStateOf("") }
    var showDialog by remember { mutableStateOf(false) }

    fun onRefresh() {
        println("Refreshing Home screen")
        refreshing = true
        scope.launch {
            AppStore.refreshWeatherLocations()
            refreshing = false
        }
    }

    fun onDelete(id: String) {
        dialogCallback = {
            AppStore.deleteTrackerId(id)
            showDialog = false
        }
        dialogTitle = "Confirm delete tracker"
        dialogMessage = "Are you sure you want to delete?"
        showDialog = true
    }

    fun onReset(id: String) {
        dialogCallback = {
            AppStore.resetTrackerId(id)
            showDialog = false
        }
        dialogTitle = "Confirm reset tracker"
        dialogMessage = "Are you sure you want to reset? Tracker start date will be set to today"
        showDialog = true
    }

    fun onStop(id: String) {
        dialogCallback = {
            AppStore.stopTrackerId(id)
            showDialog = false
        }
        dialogTitle = "Confirm stop tracker"
        dialogMessage = "Are you sure you want to stop?"
        showDialog = true
    }

    Box(modifier = Modifier.fillMaxSize()) {
        PullToRefreshBox(
            isRefreshing = refreshing,
            onRefresh = ::onRefresh,
            modifier = Modifier.fillMaxSize(),
        ) {
            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(items = trackers, key = { it.uuid }) { item ->
                    TrackerCard(
                        item = item,
                        settings = settings,
                        locations = locations,
                        onDelete = { onDelete(item.uuid) },
                        onReset = { onReset(item.uuid) },
                        onStop = { onStop(item.uuid) },
                        onResume = { AppStore.resumeTrackerId(item.uuid) },
                        onCancelSnooze = { AppStore.cancelSnoozeTrackerId(item.uuid) },
                        onNavigateViewTracker = onNavigateViewTracker,
                    )
                }
            }
        }

        if (fabOpen) {
            val interactionSource = remember { MutableInteractionSource() }
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.32f))
                    .clickable(
                        interactionSource = interactionSource,
                        indication = null,
                    ) {
                        fabOpen = false
                    },
            )
        }

        Column(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp),
            horizontalAlignment = Alignment.End,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            AnimatedVisibility(visible = fabOpen) {
                Column(
                    horizontalAlignment = Alignment.End,
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    FabGroupItem(
                        label = "Calendar Tracker",
                        icon = Icons.Default.Event,
                        onClick = {
                            fabOpen = false
                            println("Pressed add Calendar Tracker button")
                            onNavigateAddTracker(TrackerKind.Calendar)
                        },
                    )
                    FabGroupItem(
                        label = "Timed Tracker",
                        icon = Icons.Default.AccessTime,
                        onClick = {
                            fabOpen = false
                            println("Pressed add Timed Tracker button")
                            onNavigateAddTracker(TrackerKind.Timed)
                        },
                    )
                    FabGroupItem(
                        label = "GDD Tracker",
                        icon = Icons.Default.CloudQueue,
                        onClick = {
                            fabOpen = false
                            println("Pressed add GDD Tracker button")
                            onNavigateAddTracker(TrackerKind.Gdd)
                        },
                    )
                }
            }

            FloatingActionButton(
                onClick = { fabOpen = !fabOpen },
            ) {
                Icon(
                    imageVector = if (fabOpen) Icons.Default.Close else Icons.Default.Add,
                    contentDescription = if (fabOpen) "Close" else "Add tracker",
                )
            }
        }

        ConfirmationDialog(
            title = dialogTitle,
            message = dialogMessage,
            visible = showDialog,
            hideDialog = { showDialog = false },
            onOk = dialogCallback,
        )
    }
}

@Composable
private fun FabGroupItem(
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(
            shape = MaterialTheme.shapes.small,
            tonalElevation = 2.dp,
            shadowElevation = 2.dp,
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelLarge,
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            )
        }
        Spacer(modifier = Modifier.width(8.dp))
        SmallFloatingActionButton(onClick = onClick) {
            Icon(imageVector = icon, contentDescription = label)
        }
    }
}
