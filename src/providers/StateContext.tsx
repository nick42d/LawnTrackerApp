import React, {useEffect, useMemo, useReducer, useState} from 'react';
import {AddTracker, Tracker, newTracker} from './statecontext/Trackers';
import {FunctionlessStateContext, StateManager} from './statecontext/Types';
import {defaultStateManager, mockTrackers, mockLocations} from '../Mock';
import {
  writeTrackers as OnChangeGddTrackers,
  writeLocations,
  getStoredState,
} from './statecontext/AsyncStorage';
import {reducer} from './statecontext/Reducer';
import {Location} from './statecontext/Locations';
import {StateContextError} from './statecontext/Error';
import {WeatherUpdate, fetchLocationsWeather, fetchWeather} from '../api/Api';
import notifee, {
  Event,
  EventType,
  NotificationPressAction,
} from '@notifee/react-native';
import {BackgroundFetcher} from '../components/BackgroundFetcher';
import {timeout} from '../Utils';

export const LOCATIONS_STORAGE_KEY = 'LOCATIONS_STATE';
export const GDD_TRACKERS_STORAGE_KEY = 'GDD_TRACKERS_STATE';

export const StateContext = React.createContext<StateManager>(
  defaultStateManager(),
);
export function StateContextProvider({
  children,
}: React.PropsWithChildren): React.JSX.Element {
  // Only generate the mock state on first render.
  // Expecting a change in React 19 to allow this to happen inside useReducer itself
  const initialState = useMemo<FunctionlessStateContext>(
    () => ({
      locations: mockLocations(),
      trackers: mockTrackers(),
      status: 'Initialised',
    }),
    [],
  );
  const [state, dispatch] = useReducer(reducer, initialState);
  // On load, load up state and then refresh weather.
  useEffect(() => {
    console.log('App state context loaded, checking device for app state');
    dispatch({kind: 'SetLoading'});
    getStoredState()
      .then(s => {
        if (s === undefined) {
          console.info("App state wasn't on device, using defaults");
          return state.locations;
        } else {
          dispatch({kind: 'ReplaceTrackers', trackers: s.trackers});
          dispatch({kind: 'ReplaceLocations', locations: s.locations});
          console.log('Loaded app state from device');
          return s.locations;
        }
      })
      .then(l => {
        dispatch({kind: 'SetLoaded'});
        refreshWeatherLocations(l);
      });
    // Initialise notifee foreground event handler.
    // Background event handler is in index.js.
    notifee.onForegroundEvent(onNotificationForegroundEvent);
  }, []);
  useEffect(() => {
    let active = true;
    console.log('App state changed - trackers');
    // Debounce
    timeout(50).then(() => {
      if (active) {
        OnChangeGddTrackers(state.status, state.trackers);
      }
    });
    return () => {
      active = false;
      console.log('Closing trackers change effect');
    };
  }, [state.status, state.trackers]);
  useEffect(() => {
    let active = true;
    console.log('App state changed - locations');
    // Debounce
    timeout(50).then(() => {
      if (active) {
        writeLocations(state.status, state.locations);
      }
    });
    return () => {
      active = false;
      console.log('Closing locations change effect');
    };
  }, [state.status, state.locations]);
  async function onNotificationForegroundEvent({type, detail}: Event) {
    console.log('Notifee foreground event handler called');
    switch (type) {
      case EventType.ACTION_PRESS:
        console.log('User pressed action: ', detail.pressAction);
        if (detail.pressAction && detail.notification?.data) {
          handleActionPressed(detail.pressAction, detail.notification.data);
        } else {
          console.warn("Expected a pressAction but it wasn't there.");
        }
        return;
      case EventType.DISMISSED:
        console.log('User dismissed notification');
        return;
      case EventType.PRESS:
        console.log('User pressed notification');
        return;
      default:
        console.log('Unhandled event type: ', EventType[type]);
    }
  }
  async function handleActionPressed(
    action: NotificationPressAction,
    data: {[key: string]: string | number | object},
  ) {
    // Validate data - ideally this is done elsewhere
    if (!data.trackerId || typeof data.trackerId !== 'string') {
      console.log(
        "Didn't get a tracker id with my notification or it wasn't a string",
      );
      return;
    }
    // Cases are located in Notification.ts
    switch (action.id) {
      case 'snooze': {
        console.warn('Snooze is currently unhandled. What should it do?');
      }
      case 'stop': {
        console.log('Stopping tracker id', data.trackerId);
        stopTrackerId(data.trackerId);
      }
    }
  }
  function clearAll() {
    console.log('Running clearall function on state');
    dispatch({kind: 'ClearAll'});
  }
  function updateLocationsWeather(update: WeatherUpdate[]) {
    dispatch({
      kind: 'AddRefreshedWeatherArray',
      weather: update,
      timeUnixMs: new Date().valueOf(),
    });
  }
  async function refreshWeatherLocations(locationsToRefresh: Location[]) {
    dispatch({kind: 'SetWeatherRefreshing'});
    const fetchedWeatherArray = await fetchLocationsWeather(locationsToRefresh);
    dispatch({
      kind: 'AddRefreshedWeatherArray',
      weather: fetchedWeatherArray,
      timeUnixMs: new Date().valueOf(),
    });
  }
  async function addLocation(location: Location) {
    if (state.locations.find(l => l.apiId === location.apiId) !== undefined) {
      console.log(`Unable to add location as it already exists`);
      throw new StateContextError({
        name: 'ADD_LOCATIONS_ERROR',
        message: 'Error adding location as it already exists',
      });
    }
    dispatch({kind: 'AddLocation', location});
    dispatch({
      kind: 'SetWeatherLocationRefreshing',
      locationId: location.apiId,
    });
    const fetchedWeatherArray = await fetchLocationsWeather([location]);
    dispatch({
      kind: 'AddRefreshedWeatherArray',
      weather: fetchedWeatherArray,
      timeUnixMs: new Date().valueOf(),
    });
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
  function addTracker(addTracker: AddTracker) {
    const tracker = newTracker(addTracker);
    dispatch({kind: 'AddTracker', tracker});
  }
  function deleteTrackerId(id: string) {
    dispatch({kind: 'DeleteTrackerId', id});
  }
  function resetTrackerId(id: string) {
    dispatch({kind: 'ResetTrackerId', id});
  }
  function stopTrackerId(id: string) {
    dispatch({kind: 'StopTrackerId', id});
  }
  function resumeTrackerId(id: string) {
    dispatch({kind: 'ResumeTrackerId', id});
  }
  const locations = state.locations;
  const trackers = state.trackers;
  const status = state.status;
  return (
    <StateContext.Provider
      value={{
        locations,
        trackers,
        status,
        clearAll,
        // TODO: May need to be more clever about this.
        refreshWeather: () => refreshWeatherLocations(locations),
        addLocation,
        deleteLocationId,
        addTracker,
        deleteTrackerName: deleteTrackerId,
        resetTrackerName: resetTrackerId,
        stopTrackerName: stopTrackerId,
        resumeTrackerName: resumeTrackerId,
      }}>
      <BackgroundFetcher refreshWeatherCallback={updateLocationsWeather}>
        {children}
      </BackgroundFetcher>
    </StateContext.Provider>
  );
}
