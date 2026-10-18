package com.lawntracker.state

import com.lawntracker.api.WeatherUpdate

data class StoredState(
    val trackers: List<Tracker>,
    val locations: List<Location>,
)

data class FunctionlessStateContext(
    val locations: List<Location>,
    val trackers: List<Tracker>,
    val status: ContextStatus,
)

sealed interface StateContextError {
    val message: String

    data class AddLocationsError(
        override val message: String = "Error adding location as it already exists",
    ) : StateContextError

    data class DeleteLocationsError(
        override val message: String = "Error deleting location as is used in a current tracker",
    ) : StateContextError
}

sealed interface StateAction {
    data object SetLoading : StateAction
    data object SetTransitioning : StateAction
    data object SetLoaded : StateAction
    data object SetWeatherRefreshing : StateAction
    data class SetWeatherLocationRefreshing(val locationId: Int) : StateAction
    data object ClearAll : StateAction
    data class DeleteLocationId(val id: Int) : StateAction
    data class ReplaceLocations(val locations: List<Location>) : StateAction
    data class AddRefreshedWeatherArray(
        val weather: List<WeatherUpdate>,
        val timeUnixMs: Long,
    ) : StateAction
    data class AddLocation(val location: Location) : StateAction
    data class ReplaceTrackers(val trackers: List<Tracker>) : StateAction
    data class AddTracker(val tracker: Tracker) : StateAction
    data class EditTracker(val editTracker: com.lawntracker.state.AddTracker, val trackerId: String) : StateAction
    data class DeleteTrackerId(val id: String) : StateAction
    data class ResetTrackerId(val id: String) : StateAction
    data class StopTrackerId(val id: String) : StateAction
    data class SnoozeTrackerId(val id: String) : StateAction
    data class CancelSnoozeTrackerId(val id: String) : StateAction
    data class ResumeTrackerId(val id: String) : StateAction
}
