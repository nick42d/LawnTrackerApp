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
      })
      .then(_ => dispatch({kind: 'SetLoaded'}))
      // This refreshes on the old weather state.
      .then(_ => refreshWeather())
      .catch(() => console.warn('Error getting app state'));
    // Initialize BackgroundFetch only once when component mounts.
    initBackgroundFetch();
  }, []);
  // Keep state synced to AsyncStorage
  // TODO: Better handle race conditions
  useEffect(() => {
    console.log('App state changed - trackers');
    OnChangeGddTrackers(state.status, state.trackers);
  }, [state.status, state.trackers]);
  // Keep state synced to AsyncStorage
  // TODO: Better handle race conditions
  useEffect(() => {
    console.log('App state changed - locations');
    state.locations.map(l => {
      console.log(l.name, 'status: ', l.weatherStatus);
    });
    OnChangeLocations(state.status, state.locations);
  }, [state.status, state.locations]);

  function clearAll() {
    console.log('Running clearall function on state');
    dispatch({kind: 'ClearAll'});
  }
  const locations = state.locations;
  const trackers = state.trackers;
  const status = state.status;
  async function refreshWeather() {
    console.warn('Refresh Weather not implemented');
  }
  function addLocation(location: Location) {
    dispatch({kind: 'AddLocation', location});
  }
  function deleteLocationName(name: string) {
    dispatch({kind: 'DeleteLocationName', name});
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
        refreshWeather,
        addLocation,
        deleteLocationName,
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
