package com.lawntracker.state

import android.content.Context
import com.github.michaelbull.result.Err
import com.github.michaelbull.result.Ok
import com.github.michaelbull.result.Result
import com.lawntracker.api.WeatherUpdate
import com.lawntracker.api.fetchLocationsWeather
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.datetime.Clock

data class SettingsStateData(
    val settings: Settings = defaultSettings(),
    val status: ContextStatus = ContextStatus.Initialised,
)

object AppStore {
    val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val persistMutex = Mutex()

    @Volatile
    var isAppInForeground: Boolean = false

    private val _state = MutableStateFlow(
        FunctionlessStateContext(
            locations = emptyList(),
            trackers = emptyList(),
            status = ContextStatus.Initialised,
        ),
    )
    val state: StateFlow<FunctionlessStateContext> = _state.asStateFlow()

    private val _settingsState = MutableStateFlow(SettingsStateData())
    val settingsState: StateFlow<SettingsStateData> = _settingsState.asStateFlow()

    private var appContext: Context? = null

    fun dispatch(action: StateAction, persist: Boolean = true) {
        var prevTrackers: List<Tracker> = emptyList()
        var prevLocations: List<Location> = emptyList()
        var nextState: FunctionlessStateContext = _state.value
        _state.update { prev ->
            prevTrackers = prev.trackers
            prevLocations = prev.locations
            val next = reducer(prev, action)
            nextState = next
            next
        }
        val ctx = appContext
        if (persist && ctx != null) {
            val trackersChanged = prevTrackers != nextState.trackers
            val locationsChanged = prevLocations != nextState.locations
            if (trackersChanged || locationsChanged) {
                scope.launch {
                    persistMutex.withLock {
                        val latest = _state.value
                        if (trackersChanged) {
                            writeTrackers(ctx, latest.trackers)
                        }
                        if (locationsChanged) {
                            writeLocations(ctx, latest.locations)
                        }
                    }
                }
            }
        }
    }

    fun initialize(context: Context) {
        val ctx = context.applicationContext
        val firstInit = appContext == null
        appContext = ctx
        if (!firstInit) return

        _settingsState.update { it.copy(status = ContextStatus.Loading) }
        scope.launch {
            val storedSettings = getStoredSettings(ctx)
            val resolved = storedSettings ?: defaultSettings()
            _settingsState.value = SettingsStateData(
                settings = resolved,
                status = ContextStatus.Loaded,
            )
        }

        dispatch(StateAction.SetLoading, persist = false)
        scope.launch {
            loadStoredState(ctx)
        }
    }

    suspend fun loadStoredState(context: Context) {
        val stored = getStoredState(context)
        val locationsToRefresh = if (stored == null) {
            println("App state wasn't on device, using defaults")
            persistMutex.withLock {
                writeTrackers(context, _state.value.trackers)
                writeLocations(context, _state.value.locations)
            }
            _state.value.locations
        } else {
            dispatch(StateAction.ReplaceTrackers(stored.trackers), persist = false)
            dispatch(StateAction.ReplaceLocations(stored.locations), persist = false)
            println("Loaded app state from device")
            stored.locations
        }
        dispatch(StateAction.SetLoaded, persist = false)
        refreshWeatherLocations(locationsToRefresh)
    }

    fun updateSettings(newSettings: Settings) {
        _settingsState.update { it.copy(settings = newSettings) }
        val ctx = appContext
        if (ctx != null && _settingsState.value.status == ContextStatus.Loaded) {
            scope.launch {
                persistMutex.withLock {
                    writeSettings(ctx, _settingsState.value.settings)
                }
            }
        }
    }

    fun clearAll() {
        println("Running clearall function on state")
        dispatch(StateAction.ClearAll)
    }

    fun updateLocationsWeather(update: List<WeatherUpdate>, persist: Boolean = true) {
        dispatch(
            StateAction.AddRefreshedWeatherArray(
                weather = update,
                timeUnixMs = Clock.System.now().toEpochMilliseconds(),
            ),
            persist = persist,
        )
    }

    suspend fun refreshWeatherLocations(locationsToRefresh: List<Location> = _state.value.locations) {
        dispatch(StateAction.SetWeatherRefreshing)
        val fetchedWeatherArray = fetchLocationsWeather(locationsToRefresh)
        dispatch(
            StateAction.AddRefreshedWeatherArray(
                weather = fetchedWeatherArray,
                timeUnixMs = Clock.System.now().toEpochMilliseconds(),
            ),
        )
    }

    suspend fun addLocation(location: Location): Result<Unit, StateContextError> {
        if (_state.value.locations.any { l -> l.apiId == location.apiId }) {
            println("Unable to add location as it already exists")
            return Err(StateContextError.AddLocationsError())
        }
        dispatch(StateAction.AddLocation(location))
        dispatch(StateAction.SetWeatherLocationRefreshing(location.apiId))
        val fetchedWeatherArray = fetchLocationsWeather(listOf(location))
        dispatch(
            StateAction.AddRefreshedWeatherArray(
                weather = fetchedWeatherArray,
                timeUnixMs = Clock.System.now().toEpochMilliseconds(),
            ),
        )
        return Ok(Unit)
    }

    fun deleteLocationId(id: Int): Result<Unit, StateContextError> {
        println("Attempting to delete location id $id")
        if (_state.value.trackers.any { t -> t is GddTracker && t.locationId == id }) {
            println("Unable to delete location as used in an existing tracker")
            return Err(StateContextError.DeleteLocationsError())
        }
        dispatch(StateAction.DeleteLocationId(id))
        return Ok(Unit)
    }

    fun changeTracker(editTracker: AddTracker, trackerId: String) {
        println("call changetracker")
        dispatch(StateAction.EditTracker(editTracker, trackerId))
    }

    fun addTracker(addTracker: AddTracker) {
        val tracker = newTracker(addTracker)
        dispatch(StateAction.AddTracker(tracker))
    }

    fun deleteTrackerId(id: String) {
        dispatch(StateAction.DeleteTrackerId(id))
    }

    fun resetTrackerId(id: String) {
        dispatch(StateAction.ResetTrackerId(id))
    }

    fun stopTrackerId(id: String) {
        dispatch(StateAction.StopTrackerId(id))
    }

    fun resumeTrackerId(id: String) {
        dispatch(StateAction.ResumeTrackerId(id))
    }

    fun cancelSnoozeTrackerId(id: String) {
        dispatch(StateAction.CancelSnoozeTrackerId(id))
    }
}
