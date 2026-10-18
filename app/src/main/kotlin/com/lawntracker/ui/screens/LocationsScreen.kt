package com.lawntracker.ui.screens

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.github.michaelbull.result.onFailure
import com.lawntracker.state.AppStore
import com.lawntracker.state.Location
import com.lawntracker.state.Settings
import com.lawntracker.ui.components.LocationsCard
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LocationsScreen(
    locations: List<Location>,
    settings: Settings,
    displayErrorOnLoad: String?,
    onClearDisplayErrorOnLoad: () -> Unit,
    onNavigateAddLocation: () -> Unit,
    onNavigateViewLocation: (Location) -> Unit,
) {
    val scope = rememberCoroutineScope()
    var refreshing by remember { mutableStateOf(false) }
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(displayErrorOnLoad) {
        if (!displayErrorOnLoad.isNullOrEmpty()) {
            onClearDisplayErrorOnLoad()
            snackbarHostState.showSnackbar(
                message = displayErrorOnLoad,
                actionLabel = "Dismiss",
                duration = SnackbarDuration.Long,
            )
        }
    }

    fun onRefresh() {
        println("Refreshing on Locations screen")
        refreshing = true
        scope.launch {
            AppStore.refreshWeatherLocations()
            refreshing = false
        }
    }

    fun onDelete(id: Int) {
        AppStore.deleteLocationId(id).onFailure { err ->
            scope.launch {
                snackbarHostState.showSnackbar(
                    message = err.message,
                    actionLabel = "Dismiss",
                    duration = SnackbarDuration.Long,
                )
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    println("Pressed plus button on locations screen")
                    onNavigateAddLocation()
                },
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "Add Location")
            }
        },
    ) { innerPadding ->
        PullToRefreshBox(
            isRefreshing = refreshing,
            onRefresh = ::onRefresh,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
        ) {
            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(items = locations, key = { it.apiId }) { item ->
                    LocationsCard(
                        location = item,
                        settings = settings,
                        onDelete = { onDelete(item.apiId) },
                        onNavigateViewLocation = onNavigateViewLocation,
                    )
                }
            }
        }
    }
}
