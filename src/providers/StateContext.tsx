import React, {useEffect, useMemo, useReducer, useRef} from 'react';
import {AddTracker, newTracker} from './statecontext/Trackers';
import {FunctionlessStateContext, StateManager} from './statecontext/Types';
import {defaultStateManager, mockTrackers, mockLocations} from '../Mock';
import {
  writeTrackers,
  writeLocations,
  getStoredState,
} from './statecontext/AsyncStorage';
import {reducer} from './statecontext/Reducer';
import {Location} from './statecontext/Locations';
import {StateContextError} from './statecontext/Error';
import {WeatherUpdate, fetchLocationsWeather} from '../api/Api';
import notifee, {
  Event,
  EventType,
  Notification,
  NotificationPressAction,
} from '@notifee/react-native';
import {timeout} from '../Utils';
import {
  backgroundSnoozeTrackerId,
  backgroundStopTrackerId,
  getNotificationTrackerId,
  handleNotificationOpened,
  onNotificationEvent,
} from '../worker/Notification';
import {AppState, AppStateStatus} from 'react-native';
import {differenceInMilliseconds} from 'date-fns';

export const LOCATIONS_STORAGE_KEY = 'LOCATIONS_STATE';
export const GDD_TRACKERS_STORAGE_KEY = 'GDD_TRACKERS_STATE';

export const StateContext = React.createContext<StateManager>(
  defaultStateManager(),
);
export function StateContextProvider({
  children,
}: React.PropsWithChildren): React.JSX.Element {
  // Mutable state - keep track of this to debounce fast fg-bg-fg state change
  const lastInBackground = useRef<Date>(new Date());
  // Indicate to the write effects that writing should be paused.
  // This can be set when mutating state that we don't want to trigger a write effect.
  const blockWriteEffects = useRef(false);
  // Indicate to the appState event listener that events should be ignored.
  // This can be set when we know a rapid automatic appState change will happen (e.g on load)
  const blockAppStateEvents = useRef(false);
  // 3rd parameter is the initializer function - only run on first render.
  // Expecting a change in React 19 to not require the 2nd type / arg parameter
  const [state, dispatch] = useReducer<typeof reducer, null>(
    reducer,
    null,
    () => ({
      locations: mockLocations(),
      trackers: mockTrackers(),
      status: 'Initialised',
    }),
  );
  // On load, load up state and then refresh weather.
  useEffect(() => {
    console.log('App state context loaded');
    blockWriteEffects.current = true;
    blockAppStateEvents.current = true;
    dispatch({kind: 'SetLoading'});
    loadStoredState().then(() => (blockAppStateEvents.current = false));
    // Initialise notifee event handler.
    const unsubscribeFromNotificationEvents =
      notifee.onForegroundEvent(onNotificationEvent);
    // Add event listener to detect foreground / background transition.
    const appStateSubscription = AppState.addEventListener(
      'change',
      nextAppState => handleAppStateChange(nextAppState),
    );
    // Clean up event subscriptions.
    return () => {
      unsubscribeFromNotificationEvents();
      appStateSubscription.remove();
    };
  }, []);
  useEffect(() => {
    console.log(
      'Trackers change detected, write effect blocked: ',
      blockWriteEffects.current,
    );
    let active = true;
    if (!blockWriteEffects.current) {
      // Debounce
      timeout(50).then(() => {
        if (active) {
          writeTrackers(state.trackers);
        }
      });
    }
    return () => {
      active = false;
      console.log('Closing trackers change effect');
    };
  }, [state.trackers]);
  useEffect(() => {
    console.log(
      'Locations change detected, write effect blocked: ',
      blockWriteEffects.current,
    );
    let active = true;
    if (!blockWriteEffects.current) {
      // Debounce
      timeout(50).then(() => {
        if (active) {
          writeLocations(state.locations);
        }
      });
    }
    return () => {
      active = false;
      console.log('Closing locations change effect');
    };
  }, [state.locations]);
  /**
   * Handle a state change from the app - e.g change from BG to FG.
   * @param newState
   */
  // TODO: Consider not reloading locations when we do this.
  // Background fetch will sort that out.
  // NOTE: This runs a couple times when first opening app - likely not required.
  async function handleAppStateChange(newState: AppStateStatus) {
    const now = new Date();
    console.log(
      'App state changed, new state: ',
      newState,
      now.toISOString(),
      'handler blocked: ',
      blockAppStateEvents.current,
    );
    if (
      newState === 'active' &&
      !blockAppStateEvents.current &&
      // Debounce state change
      differenceInMilliseconds(now, lastInBackground.current) >= 50
    ) {
      console.log('Reloading state');
      await loadStoredState();
    }
    if (newState !== 'active') lastInBackground.current = new Date();
  }
  /**
   * Reload the stored state from storage.
   * Note that this then immediately refreshes state.
   */
  async function loadStoredState() {
    blockWriteEffects.current = true;
    await getStoredState()
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
        blockWriteEffects.current = false;
        refreshWeatherLocations(l);
      });
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
  function cancelSnoozeTrackerId(id: string) {
    dispatch({kind: 'CancelSnoozeTrackerId', id});
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
        updateLocationsWeather,
        addLocation,
        deleteLocationId,
        addTracker,
        changeTracker,
        deleteTrackerId,
        resetTrackerId,
        stopTrackerId,
        resumeTrackerId,
        cancelSnoozeTrackerId,
      }}>
      {children}
    </StateContext.Provider>
  );
}
