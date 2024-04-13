import React, {useEffect, useReducer, useState} from 'react';
import {
  GddTracker,
  Tracker,
  resetTracker,
  resumeTracker,
  stopTracker,
} from './statecontext/Trackers';
import {ContextStatus} from './Types';
import {StateManager} from './statecontext/Types';
import {defaultStateManager, mockTrackers, mockLocations} from '../Mock';
import {
  onChangeGddTrackers as OnChangeGddTrackers,
  OnChangeLocations,
  GetStoredState,
} from './statecontext/EffectHandlers';
import {initBackgroundFetch} from './statecontext/BackgroundFetch';
import {reducer} from './statecontext/Reducer';
import {Location} from './statecontext/Locations';
import {StateContextError} from './statecontext/Error';
import {fetchLocationsWeather} from '../Api';
import notifee from '@notifee/react-native';
import {BackgroundEventCallback} from '../Notification';

export const LOCATIONS_STORAGE_KEY = 'LOCATIONS_STATE';
export const GDD_TRACKERS_STORAGE_KEY = 'GDD_TRACKERS_STATE';

export const StateContext = React.createContext<StateManager>(
  defaultStateManager(),
);
export function StateContextProvider({
  children,
}: React.PropsWithChildren): React.JSX.Element {
  // TBD: Can mock functions be cached?
  const [state, dispatch] = useReducer(reducer, {
    locations: mockLocations(),
    trackers: mockTrackers(),
    status: 'Initialised',
  });
  // On load, load up state and then refresh weather.
  useEffect(() => {
    console.log('App state context loaded, checking device for app state');
    dispatch({kind: 'SetLoading'});
    GetStoredState()
      .then(s => {
        if (s === undefined) {
          console.info("App state wasn't on device, using defaults");
          return;
        }
        dispatch({kind: 'ReplaceTrackers', trackers: s.trackers});
        dispatch({kind: 'ReplaceLocations', locations: s.locations});
        console.log('Loaded app state from device');
        dispatch({kind: 'SetLoaded'});
        refreshWeatherLocations(s.locations);
      })
      .catch(() => console.warn('Error getting app state'));
    // Initialize BackgroundFetch only once when component mounts.
    // Also init foreground event handler
    notifee.onForegroundEvent(BackgroundEventCallback);
    initBackgroundFetch();
  }, []);
  // Keep state synced to AsyncStorage
  // TODO: Better handle race conditions
  useEffect(() => {
    let active = true;
    console.log('App state changed - trackers');
    // Debounce
    setTimeout(() => {
      if (active) {
        OnChangeGddTrackers(state.status, state.trackers);
      }
    }, 50);
    return () => {
      active = false;
      console.log('Closing trackers change effect');
    };
  }, [state.status, state.trackers]);
  // Keep state synced to AsyncStorage
  // TODO: Better handle race conditions
  useEffect(() => {
    let active = true;
    console.log('App state changed - locations');
    state.locations.forEach(l => {
      console.log(l.name, 'status: ', l.weatherStatus);
    });
    // Debounce
    setTimeout(() => {
      if (active) {
        OnChangeLocations(state.status, state.locations);
      }
    }, 50);
    return () => {
      active = false;
      console.log('Closing locations change effect');
    };
  }, [state.status, state.locations]);

  function clearAll() {
    console.log('Running clearall function on state');
    dispatch({kind: 'ClearAll'});
  }
  const locations = state.locations;
  const trackers = state.trackers;
  const status = state.status;
  async function refreshWeatherLocations(locations: Location[]) {
    dispatch({kind: 'SetWeatherRefreshing'});
    const fetchedWeatherArray = await fetchLocationsWeather(locations);
    dispatch({
      kind: 'AddRefreshedWeatherArray',
      weather: fetchedWeatherArray,
      timeUnixMs: new Date().valueOf(),
    });
  }
  function addLocation(location: Location) {
    if (state.locations.find(l => l.apiId === location.apiId) !== undefined) {
      console.log(`Unable to add location as it already exists`);
      throw new StateContextError({
        name: 'ADD_LOCATIONS_ERROR',
        message: 'Error adding location as it already exists',
      });
    }
    dispatch({kind: 'AddLocation', location});
  }
  function deleteLocationId(id: number) {
    console.log(`Attempting to delete location id ${id}`);
    // Can't delete a location if it's used in a GDD Tracker.
    if (
      state.trackers.find(t => t.kind === 'gdd' && t.locationId === id) !==
      undefined
    ) {
      console.log(`Unable to delete location as used in an existing tracker`);
      throw new StateContextError({
        name: 'DELETE_LOCATIONS_ERROR',
        message: 'Error deleting location as is used in a current tracker',
      });
    }
    dispatch({kind: 'DeleteLocationId', id});
  }
  function addTracker(tracker: Tracker) {
    dispatch({kind: 'AddTracker', tracker});
  }
  function deleteTrackerName(name: string) {
    dispatch({kind: 'DeleteTrackerName', name});
  }
  function resetTrackerName(name: string) {
    dispatch({kind: 'ResetTrackerName', name});
  }
  function stopTrackerName(name: string) {
    dispatch({kind: 'StopTrackerName', name});
  }
  function resumeTrackerName(name: string) {
    dispatch({kind: 'ResumeTrackerName', name});
  }
  return (
    <StateContext.Provider
      value={{
        locations,
        trackers,
        status,
        clearAll,
        // TODO: May need to be more clever about this.
        refreshWeather: () => refreshWeatherLocations(state.locations),
        addLocation,
        deleteLocationId,
        addTracker,
        deleteTrackerName,
        resetTrackerName,
        stopTrackerName,
        resumeTrackerName,
      }}>
      {children}
    </StateContext.Provider>
  );
}
