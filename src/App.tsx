/**
 * @format
 */
import {LoadableApp} from './navigation/Root';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {AppRegistry, useColorScheme} from 'react-native';
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  adaptNavigationTheme,
} from 'react-native-paper';
import merge from 'deepmerge';
import {useContext} from 'react';
import {
  SettingsContext,
  SettingsContextProvider,
} from './providers/SettingsContext';
import {StateContextProvider} from './providers/StateContext';
import Maplibre from '@maplibre/maplibre-react-native';
import React from 'react';
import BackgroundFetch from 'react-native-background-fetch';

const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});
const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

export default function App(): React.JSX.Element {
  // Add a BackgroundFetch event to <FlatList>
  function addEvent(taskId: string) {
    // Simulate a possibly long-running asynchronous task with a Promise.
    return fetch('http://www.google.com');
  }

  async function initBackgroundFetch() {
    // BackgroundFetch event handler.
    const onEvent = async (taskId: string) => {
      console.log('[BackgroundFetch] task: ', taskId);
      // Do your background work...
      await addEvent(taskId);
      // IMPORTANT:  You must signal to the OS that your task is complete.
      BackgroundFetch.finish(taskId);
    };

    // Timeout callback is executed when your Task has exceeded its allowed running-time.
    // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
    const onTimeout = async (taskId: string) => {
      console.warn('[BackgroundFetch] TIMEOUT task: ', taskId);
      BackgroundFetch.finish(taskId);
    };

    // Initialize BackgroundFetch only once when component mounts.
    let status = await BackgroundFetch.configure(
      {minimumFetchInterval: 15},
      onEvent,
      onTimeout,
    );

    console.log('[BackgroundFetch] configure status: ', status);
  }
  // POC for background fetch
  React.useEffect(() => {
    initBackgroundFetch();
  }, []);
  return (
    // TODO: Safe Area
    <SettingsContextProvider>
      <PaperWrapper />
    </SettingsContextProvider>
  );
}
function PaperWrapper() {
  const {settings} = useContext(SettingsContext);
  const systemDarkMode = useColorScheme() === 'dark';
  const appDarkMode =
    settings.dark_mode_enabled || (settings.auto_dark_mode && systemDarkMode);

  return (
    <PaperProvider
      theme={appDarkMode ? CombinedDarkTheme : CombinedDefaultTheme}>
      <StateContextProvider>
        <LoadableApp />
      </StateContextProvider>
    </PaperProvider>
  );
}
