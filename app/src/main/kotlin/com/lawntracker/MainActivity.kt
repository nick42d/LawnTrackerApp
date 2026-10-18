package com.lawntracker

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.lawntracker.state.AppStore
import com.lawntracker.ui.navigation.AppNavigationRoot
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        AppStore.initialize(applicationContext)
        setContent {
            LawnTrackerApp(applicationContext)
        }
    }
}

@Composable
fun LawnTrackerApp(appContext: android.content.Context) {
    val settingsState by AppStore.settingsState.collectAsState()
    val settings = settingsState.settings
    val systemDarkMode = isSystemInDarkTheme()
    val appDarkMode = settings.dark_mode_enabled || (settings.auto_dark_mode && systemDarkMode)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        val permissionLauncher = rememberLauncherForActivityResult(
            contract = ActivityResultContracts.RequestPermission(),
            onResult = {},
        )
        LaunchedEffect(Unit) {
            permissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        var wasInBackground = false
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_STOP -> {
                    AppStore.isAppInForeground = false
                    wasInBackground = true
                }
                Lifecycle.Event.ON_START -> {
                    AppStore.isAppInForeground = true
                    if (wasInBackground) {
                        wasInBackground = false
                        AppStore.scope.launch {
                            AppStore.loadStoredState(appContext)
                        }
                    }
                }
                else -> {}
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    MaterialTheme(
        colorScheme = if (appDarkMode) darkColorScheme() else lightColorScheme(),
    ) {
        Surface {
            AppNavigationRoot()
        }
    }
}
