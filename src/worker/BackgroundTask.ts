// Module intended to contain the back-end worker
// Sync app with Async Storage
// Issue notifications
import BackgroundFetch from 'react-native-background-fetch';
import {displayTrackerNotification} from './Notification';
import {getStoredState} from '../providers/statecontext/AsyncStorage';
import {StoredState} from '../providers/statecontext/Types';
import {trackerStatus} from '../providers/statecontext/Trackers';
import {Settings} from '../providers/settingscontext/Types';
import {AppState} from 'react-native';
import {
  WeatherUpdate,
  addWeatherArrayToLocations,
  fetchLocationsWeather,
} from '../api/Api';
import {getStoredSettings as getStoredSettings} from '../providers/settingscontext/AsyncStorage';
import {defaultSettings} from '../providers/settingscontext/Types';
import {
  DEFAULT_BACKGROUND_TASK_MANAGER,
  checkIfNotificationsDue,
  getStoredBackgroundTaskManager,
  writeBackgroundTaskManager,
} from './Types';

/**
 * Set up background fetch
 * @param refreshWeatherCallback
 */
export async function initBackgroundFetch(
  refreshWeatherCallback: (update: WeatherUpdate[]) => void,
  intervalHrs: number,
) {
  let status = await BackgroundFetch.configure(
    {
      // Note: in minutes
      minimumFetchInterval: intervalHrs * 60,
      // Begin Android-only options
      enableHeadless: true,
      stopOnTerminate: false,
      forceAlarmManager: true,
      startOnBoot: true,
      // End Android-only options
    },
    (taskId: string) => onEvent(taskId, refreshWeatherCallback),
    onTimeout,
  );
  console.log(
    '[BackgroundFetch] configure status: ',
    status,
    'iterval: ',
    intervalHrs,
  );
}

/**
 * BackgroundFetch event handler.
 */
async function onEvent(
  taskId: string,
  refreshWeatherCallback: (update: WeatherUpdate[]) => void,
) {
  console.log(
    '[BackgroundFetch] task event: ',
    taskId,
    ' state: ',
    AppState.currentState,
  );
  const [state, settings, backgroundTaskManager] = await Promise.all([
    getStoredState(),
    getStoredSettings(),
    getStoredBackgroundTaskManager(),
  ]);
  // NOTE: If notifications become due whilst app is open, you won't get a notification for that day.
  // Consider instead passing 'active' to this function.
  const [newBackgroundTaskManager, notificationDueNow] =
    checkIfNotificationsDue(
      settings ?? defaultSettings(),
      backgroundTaskManager ?? DEFAULT_BACKGROUND_TASK_MANAGER,
    );
  await writeBackgroundTaskManager(newBackgroundTaskManager);
  // Similar logic to HeadlessCallback
  if (state && notificationDueNow) {
    const fetchedWeatherArray = await fetchLocationsWeather(state.locations);
    refreshWeatherCallback(fetchedWeatherArray);
    // Don't notify if app is in foreground
    if (AppState.currentState !== 'active') {
      // There is some duplication of effort here, as refreshWeatherCallback also performs this calculation.
      // We could instead do all the calculation here and pass the new StoredState back to statecontext.
      const newState = refreshStoredStateWeather(
        state,
        fetchedWeatherArray,
        Date.now(),
      );
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

/**
 * TODO: Return a new StoredState with notifications variables updated
 * @param state
 * @param settings
 */
export async function notifyFromStoredState(
  state: StoredState,
  settings: Settings | undefined,
) {
  // If settings is not defined then use the default
  const certainSettings = settings ? settings : defaultSettings();
  const notifications = state.trackers.map(t =>
    trackerStatus(t, Date.now(), state.locations, certainSettings.algorithm),
  );
  console.log(JSON.stringify(notifications));
  const p = notifications.map(async b => {
    displayTrackerNotification(b);
  });
  await Promise.all(p);
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
