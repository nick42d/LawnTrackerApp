package com.lawntracker.ui.navigation

import android.content.Intent
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.HelpOutline
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.MonitorHeart
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.Saver
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.util.Consumer
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navDeepLink
import androidx.navigation.toRoute
import com.github.michaelbull.result.get
import com.github.michaelbull.result.onFailure
import com.github.michaelbull.result.onSuccess
import com.github.michaelbull.result.runCatching
import com.lawntracker.api.WeatherApiLocation
import com.lawntracker.state.AddGddTrackerInput
import com.lawntracker.state.AddTrackerInput
import com.lawntracker.state.AppStore
import com.lawntracker.state.ContextStatus
import com.lawntracker.state.DefaultAddTrackerInputProps
import com.lawntracker.state.Location
import com.lawntracker.state.TrackerKind
import com.lawntracker.state.WeatherLoadStatus
import com.lawntracker.state.WeatherStatus
import com.lawntracker.state.defaultAddTrackerInput
import com.lawntracker.state.getEditTrackerInput
import com.lawntracker.state.storageJson
import com.lawntracker.state.validateAddTrackerInput
import com.lawntracker.ui.screens.AddLocationScreen
import com.lawntracker.ui.screens.AddTrackerScreen
import com.lawntracker.ui.screens.EditTrackerScreen
import com.lawntracker.ui.screens.HelpScreen
import com.lawntracker.ui.screens.HomeScreen
import com.lawntracker.ui.screens.LoadingScreen
import com.lawntracker.ui.screens.LocationsScreen
import com.lawntracker.ui.screens.SettingsScreen
import com.lawntracker.ui.screens.StatusScreen
import com.lawntracker.ui.screens.ViewLocationScreen
import com.lawntracker.ui.screens.ViewTrackerScreen
import com.lawntracker.worker.initBackgroundFetch
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

enum class DrawerSection(val title: String) {
    HomeLocationsTabs("LawnTracker"),
    Settings("Settings"),
    Help("Help"),
    Status("Status"),
}

enum class HomeLocationsTab {
    Home,
    Locations,
}

@Serializable
enum class AddLocationCaller {
    Locations,
    AddTracker,
    EditTracker,
}

sealed interface Route {
    @Serializable
    data object Drawer : Route

    @Serializable
    data class AddTracker(val kind: TrackerKind) : Route

    @Serializable
    data class ViewTracker(val trackerId: String) : Route

    @Serializable
    data class EditTracker(val trackerId: String) : Route

    @Serializable
    data class AddLocation(
        val fromScreen: AddLocationCaller = AddLocationCaller.Locations,
        val trackerId: String = "",
    ) : Route

    @Serializable
    data class ViewLocation(val apiId: Int) : Route
}

private val addTrackerInputSaver: Saver<AddTrackerInput, String> = Saver(
    save = { value ->
        runCatching { storageJson.encodeToString<AddTrackerInput>(value) }.get() ?: ""
    },
    restore = { json ->
        if (json.isEmpty()) null else runCatching { storageJson.decodeFromString<AddTrackerInput>(json) }.get()
    },
)

private val nullableAddTrackerInputSaver: Saver<AddTrackerInput?, String> = Saver(
    save = { value ->
        if (value == null) "" else runCatching { storageJson.encodeToString<AddTrackerInput>(value) }.get() ?: ""
    },
    restore = { json ->
        if (json.isEmpty()) null else runCatching { storageJson.decodeFromString<AddTrackerInput>(json) }.get()
    },
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppNavigationRoot() {
    val context = LocalContext.current
    val appState by AppStore.state.collectAsState()
    val settingsState by AppStore.settingsState.collectAsState()
    val settings = settingsState.settings
    var previousIntervalHrs by remember { mutableStateOf<Double?>(null) }

    LaunchedEffect(settings.backgroundTaskIntervalHrs) {
        val prev = previousIntervalHrs
        val shouldReplace = prev != null && prev != settings.backgroundTaskIntervalHrs
        previousIntervalHrs = settings.backgroundTaskIntervalHrs
        initBackgroundFetch(
            context = context,
            intervalHrs = settings.backgroundTaskIntervalHrs,
            replaceExisting = shouldReplace,
        )
    }

    if (settingsState.status == ContextStatus.Loading || appState.status == ContextStatus.Loading) {
        LoadingScreen()
        return
    }

    val navController = rememberNavController()
    val activity = context as? ComponentActivity
    DisposableEffect(activity, navController) {
        val listener = Consumer<Intent> { intent ->
            navController.handleDeepLink(intent)
        }
        activity?.addOnNewIntentListener(listener)
        onDispose {
            activity?.removeOnNewIntentListener(listener)
        }
    }

    var activeDrawerSection by rememberSaveable { mutableStateOf(DrawerSection.HomeLocationsTabs) }
    var activeTab by rememberSaveable { mutableStateOf(HomeLocationsTab.Home) }
    var locationsErrorMessage by rememberSaveable { mutableStateOf<String?>(null) }
    var selectedViewLocation by remember { mutableStateOf<Location?>(null) }
    var pendingFromAddLocationId by rememberSaveable { mutableStateOf<Int?>(null) }

    val scope = rememberCoroutineScope()

    NavHost(
        navController = navController,
        startDestination = Route.Drawer,
    ) {
        composable<Route.Drawer> {
            val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)

            BackHandler(
                enabled = !drawerState.isOpen &&
                    (activeDrawerSection != DrawerSection.HomeLocationsTabs || activeTab != HomeLocationsTab.Home),
            ) {
                activeDrawerSection = DrawerSection.HomeLocationsTabs
                activeTab = HomeLocationsTab.Home
            }

            BackHandler(enabled = drawerState.isOpen) {
                scope.launch { drawerState.close() }
            }

            ModalNavigationDrawer(
                drawerState = drawerState,
                drawerContent = {
                    ModalDrawerSheet(modifier = Modifier.width(280.dp)) {
                        Spacer(modifier = Modifier.height(12.dp))
                        NavigationDrawerItem(
                            icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                            label = { Text("Home") },
                            selected = activeDrawerSection == DrawerSection.HomeLocationsTabs &&
                                activeTab == HomeLocationsTab.Home,
                            onClick = {
                                activeDrawerSection = DrawerSection.HomeLocationsTabs
                                activeTab = HomeLocationsTab.Home
                                scope.launch { drawerState.close() }
                            },
                            modifier = Modifier.padding(horizontal = 12.dp),
                        )
                        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                        NavigationDrawerItem(
                            icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                            label = { Text("Settings") },
                            selected = activeDrawerSection == DrawerSection.Settings,
                            onClick = {
                                activeDrawerSection = DrawerSection.Settings
                                scope.launch { drawerState.close() }
                            },
                            modifier = Modifier.padding(horizontal = 12.dp),
                        )
                        NavigationDrawerItem(
                            icon = { Icon(Icons.AutoMirrored.Filled.HelpOutline, contentDescription = "Help") },
                            label = { Text("Help") },
                            selected = activeDrawerSection == DrawerSection.Help,
                            onClick = {
                                activeDrawerSection = DrawerSection.Help
                                scope.launch { drawerState.close() }
                            },
                            modifier = Modifier.padding(horizontal = 12.dp),
                        )
                        NavigationDrawerItem(
                            icon = { Icon(Icons.Default.MonitorHeart, contentDescription = "Status") },
                            label = { Text("Status") },
                            selected = activeDrawerSection == DrawerSection.Status,
                            onClick = {
                                activeDrawerSection = DrawerSection.Status
                                scope.launch { drawerState.close() }
                            },
                            modifier = Modifier.padding(horizontal = 12.dp),
                        )
                    }
                },
            ) {
                Scaffold(
                    topBar = {
                        TopAppBar(
                            title = { Text(activeDrawerSection.title) },
                            navigationIcon = {
                                IconButton(onClick = { scope.launch { drawerState.open() } }) {
                                    Icon(Icons.Default.Menu, contentDescription = "Menu")
                                }
                            },
                        )
                    },
                    bottomBar = {
                        if (activeDrawerSection == DrawerSection.HomeLocationsTabs) {
                            NavigationBar {
                                NavigationBarItem(
                                    selected = activeTab == HomeLocationsTab.Home,
                                    onClick = { activeTab = HomeLocationsTab.Home },
                                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                                    label = { Text("Home") },
                                )
                                NavigationBarItem(
                                    selected = activeTab == HomeLocationsTab.Locations,
                                    onClick = { activeTab = HomeLocationsTab.Locations },
                                    icon = { Icon(Icons.Default.Map, contentDescription = "Locations") },
                                    label = { Text("Locations") },
                                )
                            }
                        }
                    },
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding),
                    ) {
                        when (activeDrawerSection) {
                            DrawerSection.HomeLocationsTabs -> {
                                when (activeTab) {
                                    HomeLocationsTab.Home -> HomeScreen(
                                        trackers = appState.trackers,
                                        locations = appState.locations,
                                        settings = settings,
                                        onNavigateAddTracker = { kind ->
                                            pendingFromAddLocationId = null
                                            navController.navigate(Route.AddTracker(kind = kind))
                                        },
                                        onNavigateViewTracker = { trackerId ->
                                            navController.navigate(Route.ViewTracker(trackerId = trackerId))
                                        },
                                    )
                                    HomeLocationsTab.Locations -> LocationsScreen(
                                        locations = appState.locations,
                                        settings = settings,
                                        displayErrorOnLoad = locationsErrorMessage,
                                        onClearDisplayErrorOnLoad = { locationsErrorMessage = null },
                                        onNavigateAddLocation = {
                                            navController.navigate(
                                                Route.AddLocation(fromScreen = AddLocationCaller.Locations),
                                            )
                                        },
                                        onNavigateViewLocation = { loc ->
                                            selectedViewLocation = loc
                                            navController.navigate(Route.ViewLocation(apiId = loc.apiId))
                                        },
                                    )
                                }
                            }
                            DrawerSection.Settings -> SettingsScreen(
                                settings = settings,
                                setSettings = { AppStore.updateSettings(it) },
                                clearAll = { AppStore.clearAll() },
                            )
                            DrawerSection.Help -> HelpScreen()
                            DrawerSection.Status -> StatusScreen(settings = settings)
                        }
                    }
                }
            }
        }

        composable<Route.AddTracker> { backStackEntry ->
            val route = backStackEntry.toRoute<Route.AddTracker>()
            val kind = route.kind

            var formState by rememberSaveable(stateSaver = addTrackerInputSaver) {
                mutableStateOf(
                    defaultAddTrackerInput(
                        DefaultAddTrackerInputProps(
                            kind = kind,
                            locationId = appState.locations.firstOrNull()?.apiId ?: -1,
                            baseTemp = settings.default_base_temp.value,
                        ),
                    ),
                )
            }
            var showLocationsDialog by rememberSaveable { mutableStateOf(false) }

            LaunchedEffect(pendingFromAddLocationId) {
                val addedId = pendingFromAddLocationId
                val cur = formState
                if (addedId != null && cur is AddGddTrackerInput) {
                    formState = cur.copy(locationId = addedId)
                    showLocationsDialog = true
                    pendingFromAddLocationId = null
                }
            }

            val validation = validateAddTrackerInput(formState, appState.locations)
            val isValid = validation.isOk

            Scaffold(
                topBar = {
                    TopAppBar(
                        title = { Text("Add Tracker") },
                        navigationIcon = {
                            IconButton(onClick = { navController.popBackStack() }) {
                                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                            }
                        },
                        actions = {
                            IconButton(
                                enabled = isValid,
                                onClick = {
                                    if (validation.isOk) {
                                        AppStore.addTracker(validation.value)
                                        navController.popBackStack()
                                    }
                                },
                            ) {
                                Icon(Icons.Default.Save, contentDescription = "Save")
                            }
                        },
                    )
                },
            ) { innerPadding ->
                Box(modifier = Modifier.padding(innerPadding)) {
                    AddTrackerScreen(
                        locations = appState.locations,
                        state = formState,
                        showLocationsDialog = showLocationsDialog,
                        setState = { formState = it },
                        setShowLocationsDialog = { showLocationsDialog = it },
                        onNavigateToAddLocation = {
                            navController.navigate(
                                Route.AddLocation(fromScreen = AddLocationCaller.AddTracker),
                            )
                        },
                    )
                }
            }
        }

        composable<Route.ViewTracker>(
            deepLinks = listOf(navDeepLink<Route.ViewTracker>(basePath = "lawntracker://tracker/view")),
        ) { backStackEntry ->
            val route = backStackEntry.toRoute<Route.ViewTracker>()
            val trackerId = route.trackerId
            val item = appState.trackers.find { it.uuid == trackerId }

            Scaffold(
                topBar = {
                    TopAppBar(
                        title = { Text("View Tracker") },
                        navigationIcon = {
                            IconButton(onClick = { navController.popBackStack() }) {
                                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                            }
                        },
                        actions = {
                            IconButton(
                                onClick = {
                                    println("Edit button pressed, tracker id: $trackerId")
                                    pendingFromAddLocationId = null
                                    navController.navigate(Route.EditTracker(trackerId = trackerId))
                                },
                            ) {
                                Icon(Icons.Default.Edit, contentDescription = "Edit")
                            }
                        },
                    )
                },
            ) { innerPadding ->
                Box(modifier = Modifier.padding(innerPadding)) {
                    ViewTrackerScreen(
                        item = item,
                        locations = appState.locations,
                        settings = settings,
                    )
                }
            }
        }

        composable<Route.EditTracker> { backStackEntry ->
            val route = backStackEntry.toRoute<Route.EditTracker>()
            val trackerId = route.trackerId
            var formState by rememberSaveable(stateSaver = nullableAddTrackerInputSaver) {
                mutableStateOf<AddTrackerInput?>(
                    appState.trackers.find { it.uuid == trackerId }?.let { getEditTrackerInput(it) },
                )
            }
            var showLocationsDialog by rememberSaveable { mutableStateOf(false) }

            LaunchedEffect(pendingFromAddLocationId) {
                val addedId = pendingFromAddLocationId
                val cur = formState
                if (addedId != null && cur is AddGddTrackerInput) {
                    formState = cur.copy(locationId = addedId)
                    showLocationsDialog = true
                    pendingFromAddLocationId = null
                }
            }

            val validation = formState?.let { validateAddTrackerInput(it, appState.locations) }
            val isValid = validation?.isOk == true

            Scaffold(
                topBar = {
                    TopAppBar(
                        title = { Text("Edit Tracker") },
                        navigationIcon = {
                            IconButton(onClick = { navController.popBackStack() }) {
                                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                            }
                        },
                        actions = {
                            IconButton(
                                enabled = isValid,
                                onClick = {
                                    if (validation != null && validation.isOk) {
                                        AppStore.changeTracker(validation.value, trackerId)
                                        navController.popBackStack()
                                    }
                                },
                            ) {
                                Icon(Icons.Default.Save, contentDescription = "Save")
                            }
                        },
                    )
                },
            ) { innerPadding ->
                Box(modifier = Modifier.padding(innerPadding)) {
                    EditTrackerScreen(
                        locations = appState.locations,
                        state = formState,
                        showLocationsDialog = showLocationsDialog,
                        setState = { formState = it },
                        setShowLocationsDialog = { showLocationsDialog = it },
                        onNavigateToAddLocation = {
                            navController.navigate(
                                Route.AddLocation(
                                    fromScreen = AddLocationCaller.EditTracker,
                                    trackerId = trackerId,
                                ),
                            )
                        },
                    )
                }
            }
        }

        composable<Route.AddLocation> { backStackEntry ->
            val route = backStackEntry.toRoute<Route.AddLocation>()
            val fromScreen = route.fromScreen
            var currentLocation by remember { mutableStateOf<WeatherApiLocation?>(null) }

            Scaffold(
                topBar = {
                    TopAppBar(
                        title = { Text("Add Location") },
                        navigationIcon = {
                            IconButton(onClick = { navController.popBackStack() }) {
                                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                            }
                        },
                        actions = {
                            IconButton(
                                enabled = currentLocation != null,
                                onClick = {
                                    val loc = currentLocation ?: return@IconButton
                                    val newLoc = Location(
                                        name = loc.name,
                                        latitude = loc.latitude,
                                        longitude = loc.longitude,
                                        country = loc.country,
                                        admin1 = loc.admin1,
                                        apiId = loc.id,
                                        weather = null,
                                        weatherStatus = WeatherStatus(
                                            status = WeatherLoadStatus.Initialised,
                                            lastRefreshedUnixMs = null,
                                        ),
                                    )
                                    scope.launch {
                                        AppStore.addLocation(newLoc).onSuccess {
                                            if (fromScreen == AddLocationCaller.AddTracker ||
                                                fromScreen == AddLocationCaller.EditTracker
                                            ) {
                                                pendingFromAddLocationId = loc.id
                                            }
                                            navController.popBackStack()
                                        }.onFailure { err ->
                                            locationsErrorMessage = err.message
                                            activeDrawerSection = DrawerSection.HomeLocationsTabs
                                            activeTab = HomeLocationsTab.Locations
                                            navController.popBackStack(Route.Drawer, inclusive = false)
                                        }
                                    }
                                },
                            ) {
                                Icon(Icons.Default.Save, contentDescription = "Save")
                            }
                        },
                    )
                },
            ) { innerPadding ->
                Box(modifier = Modifier.padding(innerPadding)) {
                    AddLocationScreen(
                        currentLocation = currentLocation,
                        onCurrentLocationChanged = { currentLocation = it },
                    )
                }
            }
        }

        composable<Route.ViewLocation> { backStackEntry ->
            val route = backStackEntry.toRoute<Route.ViewLocation>()
            val apiId = route.apiId
            val location = appState.locations.find { it.apiId == apiId } ?: selectedViewLocation

            Scaffold(
                topBar = {
                    TopAppBar(
                        title = { Text("View Location") },
                        navigationIcon = {
                            IconButton(onClick = { navController.popBackStack() }) {
                                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                            }
                        },
                    )
                },
            ) { innerPadding ->
                Box(modifier = Modifier.padding(innerPadding)) {
                    if (location != null) {
                        ViewLocationScreen(item = location)
                    } else {
                        Text("Location not found")
                    }
                }
            }
        }
    }
}
