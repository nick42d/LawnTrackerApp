import 'react-native-gesture-handler';
/**
 * @format
 */

import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {AppRegistry, useColorScheme} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  adaptNavigationTheme,
} from 'react-native-paper';
import {enGB, registerTranslation} from 'react-native-paper-dates';
import merge from 'deepmerge';
import MapLibreGL from '@maplibre/maplibre-react-native';
import {SettingsContextProvider} from './src/providers/SettingsContext';
import {useContext} from 'react';
import {onDisplayNotification} from './src/Notification';
import BackgroundFetch from 'react-native-background-fetch';
import notifee, {EventType} from '@notifee/react-native';

export default function Main() {
  return <App />;
}

// MapLibreGl setup
MapLibreGL.requestAndroidLocationPermissions();
MapLibreGL.setAccessToken(null);
registerTranslation('en-GB', enGB);

notifee.onBackgroundEvent(async ({type, detail}) => {
  const {notification, pressAction} = detail;
  console.log('Notifee Background Event Handler called');
});

let MyHeadlessTask = async event => {
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

  // Perform an example HTTP request.
  // Important:  await asychronous tasks when using HeadlessJS.
  let response = await fetch('https://reactnative.dev/movies.json');
  let responseJson = await response.json();
  // Test Notifee
  await onDisplayNotification();
  console.log('[BackgroundFetch HeadlessTask] response: ', responseJson);

  // Required:  Signal to native code that your task is complete.
  // If you don't do this, your app could be terminated and/or assigned
  // battery-blame for consuming too much time in background.
  BackgroundFetch.finish(taskId);
};

// Register your BackgroundFetch HeadlessTask
BackgroundFetch.registerHeadlessTask(MyHeadlessTask);

// React Native setup
AppRegistry.registerComponent(appName, () => Main);
