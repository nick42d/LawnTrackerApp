import {getStoredSettings} from '../providers/settingscontext/AsyncStorage';
import {fetchLocationsWeather} from '../api/Api';
import {
  writeLocations,
  getStoredState,
  writeTrackers,
} from '../providers/statecontext/AsyncStorage';
import {
  refreshStoredStateWeather,
  notifyFromStoredState,
} from './BackgroundTask';
import BackgroundFetch, {HeadlessEvent} from 'react-native-background-fetch';

/**  Task to be run by headless background fetch.
 * NOTE: Not supported on iOS
 */
export async function HeadlessCallback(event: HeadlessEvent) {
  // Get task id from event {}:
  let taskId = event.taskId;
  let isTimeout = event.timeout; // <-- true when your background-time has expired.
  if (isTimeout) {
    // This task has exceeded its allowed running-time.
    // You must stop what you're doing immediately finish(taskId)
    console.log('[BackgroundFetch] Headless TIMEOUT:', taskId);
    BackgroundFetch.finish(taskId);
    return;
  }
  console.log('[BackgroundFetch HeadlessTask] start: ', taskId);

  const [state, settings] = await Promise.all([
    getStoredState(),
    getStoredSettings(),
  ]);
  // Similar logic to BackgroundFetcher - but don't check if AppState is active.
  if (state) {
    const fetchedWeatherArray = await fetchLocationsWeather(state.locations);
    const newState = refreshStoredStateWeather(
      state,
      fetchedWeatherArray,
      Date.now(),
    );
    // Use of the onChange functions is a hack and should be improved.
    await Promise.all([
      writeLocations(newState.locations),
      writeTrackers(newState.trackers),
      notifyFromStoredState(newState, settings),
    ]);
  }
  console.log('[BackgroundFetch HeadlessTask] executed');

  // Required:  Signal to native code that your task is complete.
  // If you don't do this, your app could be terminated and/or assigned
  // battery-blame for consuming too much time in background.
  BackgroundFetch.finish(taskId);
}
