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
  Notification,
  NotificationPressAction,
} from '@notifee/react-native';
import {BackgroundFetcher} from '../components/BackgroundFetcher';
import {timeout} from '../Utils';
import {useNavigation} from '@react-navigation/native';
import {Linking} from 'react-native';
import {
  getNotificationTrackerId,
  handleNotificationOpened,
} from '../Notification';

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
    notifee.onForegroundEvent(onForegroundNotificationEvent);
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
  /**
   * Handle foreground notification event
   * As this is inside context it can directly update App state
   * Semi-duplicate of onBackgroundNotificationEvent
   * @returns
   */
  async function onForegroundNotificationEvent({type, detail}: Event) {
    const {notification, pressAction} = detail;
    console.log('Notifee foreground event handler called');
    switch (type) {
      case EventType.ACTION_PRESS:
        if (!notification || !pressAction) {
          console.warn('Notification details missing for action press');
          return;
        }
        await handleForegroundNotificationPressAction(
          pressAction,
          notification,
        );
        return;
      case EventType.DISMISSED:
        console.log('User dismissed notification');
        return;
      case EventType.PRESS:
        if (!notification) {
          console.warn('Notification details missing for notification open');
          return;
        }
        await handleNotificationOpened(notification);
        return;
      default:
        console.log('Unhandled event type: ', EventType[type]);
    }
  }
  /**
   * Handle foreground notification pressAction
   * As this is inside context it can directly update App state
   * Semi-duplicate of handleBackgroundNotificationPressAction
   */
  async function handleForegroundNotificationPressAction(
    pressAction: NotificationPressAction,
    notification: Notification,
  ) {
    console.log('User pressed action: ', pressAction);
    const trackerId = getNotificationTrackerId(notification);
    if (!trackerId) {
      console.warn('Press action was missing a trackerId');
      return;
    }
    // Cases are located in Notification.ts
    switch (pressAction.id) {
      case 'snooze': {
        console.warn('Snooze is currently unhandled. What should it do?');
        return;
      }
      case 'stop': {
        console.log('Stopping tracker id', trackerId);
        stopTrackerId(trackerId);
        return;
      }
      default:
        console.error('Received unhandled pressAction: ', pressAction.id);
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
  function changeTracker(editTracker: AddTracker, trackerId: string) {
    console.log('call changetracker');
    dispatch({kind: 'EditTracker', editTracker, trackerId});
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
        changeTracker,
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
