// Module intended to contain the back-end worker
// Sync app with Async Storage
// Issue notifications
import BackgroundFetch from 'react-native-background-fetch';
import {displayTrackerNotification} from '../Notification';
import {BACKGROUND_REFRESH_INTERVAL} from '../Consts';
import {
  GetStoredState,
  StoredState,
} from '../providers/statecontext/AsyncStorage';
import {trackerStatus} from '../providers/statecontext/Trackers';
import {Settings} from '../providers/settingscontext/Types';
import {AppState} from 'react-native';
import {PropsWithChildren, useEffect} from 'react';
import {
  WeatherUpdate,
  addWeatherArrayToLocations,
  fetchLocationsWeather,
} from '../Api';
import {getStoredSettings as getStoredSettings} from '../providers/settingscontext/AsyncStorage';
import {defaultSettings} from '../Mock';

/**  Initiate background fetch and assign event handler.
 * Generally would call this on app load, so consider what impact there would be running it multiple times on succession.
 * NOTE: the foreground/background event handler is here, but the headless event handler is in HeadlessCallback module and registered in index.
 * NOTE: This can update app state (from both foreground and background)
 */
export function BackgroundFetcher(
  props: PropsWithChildren<{
    refreshWeatherCallback: (update: WeatherUpdate[]) => void;
  }>,
) {
  useEffect(() => {
    initBackgroundFetch();
  }, []);
  // BackgroundFetch event handler.
  async function onEvent(taskId: string) {
    console.log(
      '[BackgroundFetch] task event: ',
      taskId,
      ' state: ',
      AppState.currentState,
    );
    // Important:  await asychronous tasks when using HeadlessJS.
    const storedstate = await GetStoredState();
    if (storedstate) {
      const fetchedWeatherArray = await fetchLocationsWeather(
        storedstate.locations,
      );
      props.refreshWeatherCallback(fetchedWeatherArray);
      // Don't notify if app is in foreground
      if (AppState.currentState !== 'active') {
        // There is some duplication of effort here, as refreshWeatherCallback also performs this calculation.
        // We could instead do all the calculation here and pass the new StoredState back to statecontext.
        const newState = refreshStoredStateWeather(
          storedstate,
          fetchedWeatherArray,
          Date.now(),
        );
        const settings = await getStoredSettings();
        await notifyFromStoredState(newState, settings);
      }
    }
    // IMPORTANT:  You must signal to the OS that your task is complete.
    console.log('[BackgroundFetch] executed');
    BackgroundFetch.finish(taskId);
  }
  // Timeout callback is executed when your Task has exceeded its allowed running-time.
  // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
  async function onTimeout(taskId: string) {
    console.warn('[BackgroundFetch] TIMEOUT task: ', taskId);
    BackgroundFetch.finish(taskId);
  }
  async function initBackgroundFetch() {
    let status = await BackgroundFetch.configure(
      {
        minimumFetchInterval: BACKGROUND_REFRESH_INTERVAL,
        // Begin Android-only options
        enableHeadless: true,
        stopOnTerminate: false,
        startOnBoot: true,
        // End Android-only options
      },
      onEvent,
      onTimeout,
    );
    console.log('[BackgroundFetch] configure status: ', status);
  }
  return props.children;
}

/**
 *
 * @param state
 * @param settings
 */
export async function notifyFromStoredState(
  state: StoredState | undefined,
  settings: Settings | undefined,
) {
  // If settings is not defined then use the default
  const certainSettings = settings ? settings : defaultSettings();
  const notifications = state?.trackers.map(t =>
    trackerStatus(t, Date.now(), state.locations, certainSettings.algorithm),
  );
  console.log(JSON.stringify(notifications));
  if (notifications) {
    const p = notifications.map(async b => {
      displayTrackerNotification(b);
    });
    await Promise.all(p);
  }
}

// Duplication of some functionality in reducer
export function refreshStoredStateWeather(
  state: StoredState,
  newWeather: WeatherUpdate[],
  timeUnixMs: number,
): StoredState {
  const refreshedLocations = addWeatherArrayToLocations(
    state.locations,
    newWeather,
  );
  return {
    ...state,
    locations: refreshedLocations.map(l => ({
      ...l,
      weatherStatus: {
        lastRefreshedUnixMs: timeUnixMs,
        status: 'Loaded',
      },
    })),
  };
}
