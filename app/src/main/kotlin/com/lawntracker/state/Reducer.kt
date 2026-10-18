package com.lawntracker.state

import com.lawntracker.api.addWeatherArrayToLocations

fun reducer(
    state: FunctionlessStateContext,
    action: StateAction,
): FunctionlessStateContext {
    println("State Context reducer call: $action")
    return when (action) {
        StateAction.SetLoaded -> state.copy(status = ContextStatus.Loaded)
        StateAction.SetLoading -> state.copy(status = ContextStatus.Loading)
        StateAction.SetTransitioning -> state.copy(status = ContextStatus.Transitioning)
        is StateAction.SetWeatherLocationRefreshing -> state.copy(
            locations = state.locations.map { l ->
                if (l.apiId != action.locationId) {
                    l
                } else {
                    l.copy(
                        weatherStatus = l.weatherStatus.copy(status = WeatherLoadStatus.Refreshing),
                    )
                }
            },
        )
        StateAction.SetWeatherRefreshing -> state.copy(
            locations = state.locations.map { l ->
                l.copy(
                    weatherStatus = l.weatherStatus.copy(status = WeatherLoadStatus.Refreshing),
                )
            },
        )
        is StateAction.AddRefreshedWeatherArray -> {
            val refreshedLocations = addWeatherArrayToLocations(
                state.locations,
                action.weather,
            )
            state.copy(
                locations = refreshedLocations.map { l ->
                    l.copy(
                        weatherStatus = WeatherStatus(
                            lastRefreshedUnixMs = action.timeUnixMs,
                            status = WeatherLoadStatus.Loaded,
                        ),
                    )
                },
            )
        }
        StateAction.ClearAll -> state.copy(locations = emptyList(), trackers = emptyList())
        is StateAction.AddLocation -> state.copy(locations = state.locations + action.location)
        is StateAction.ReplaceLocations -> state.copy(locations = action.locations)
        is StateAction.DeleteLocationId -> state.copy(
            locations = state.locations.filter { item -> item.apiId != action.id },
        )
        is StateAction.ReplaceTrackers -> state.copy(trackers = action.trackers)
        is StateAction.AddTracker -> state.copy(trackers = state.trackers + action.tracker)
        is StateAction.EditTracker -> {
            val idx = state.trackers.indexOfFirst { t -> t.uuid == action.trackerId }
            if (idx == -1) {
                state
            } else {
                val oldTracker = state.trackers[idx]
                val updated = editTracker(oldTracker, action.editTracker)
                val newTrackers = state.trackers.toMutableList()
                newTrackers[idx] = updated
                state.copy(trackers = newTrackers)
            }
        }
        is StateAction.ResetTrackerId -> {
            println("Resetting GDD tracker id ${action.id}")
            state.copy(
                trackers = state.trackers.map { t ->
                    if (t.uuid == action.id) resetTracker(t) else t
                },
            )
        }
        is StateAction.DeleteTrackerId -> {
            println("Deleting tracker id ${action.id}")
            state.copy(
                trackers = state.trackers.filter { item -> item.uuid != action.id },
            )
        }
        is StateAction.SnoozeTrackerId -> {
            println("Snoozing tracker id ${action.id}")
            state.copy(
                trackers = state.trackers.map { t ->
                    if (t.uuid == action.id) snoozeTracker(t) else t
                },
            )
        }
        is StateAction.CancelSnoozeTrackerId -> state.copy(
            trackers = state.trackers.map { t ->
                if (t.uuid == action.id) cancelSnoozeTracker(t) else t
            },
        )
        is StateAction.StopTrackerId -> {
            println("Stopping tracker id ${action.id}")
            state.copy(
                trackers = state.trackers.map { t ->
                    if (t.uuid == action.id) stopTracker(t) else t
                },
            )
        }
        is StateAction.ResumeTrackerId -> {
            println("Resuming tracker id ${action.id}")
            state.copy(
                trackers = state.trackers.map { t ->
                    if (t.uuid == action.id) resumeTracker(t) else t
                },
            )
        }
    }
}
