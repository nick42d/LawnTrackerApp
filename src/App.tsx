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
import {useContext, useEffect} from 'react';
import {
  SettingsContext,
  SettingsContextProvider,
} from './providers/SettingsContext';
import React from 'react';
import {StateContext, StateContextProvider} from './providers/StateContext';
import notifee from '@notifee/react-native';

const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});
const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

export default function App(): React.JSX.Element {
  const systemDarkMode = useColorScheme() === 'dark';
  // Request notification permissions
  // TODO: Manage this in settings.
  notifee.requestPermission();

  return (
    // TODO: Safe Area
    <SettingsContextProvider>
      <SettingsContext.Consumer>
        {({settings}) => {
          const appDarkMode =
            settings.dark_mode_enabled ||
            (settings.auto_dark_mode && systemDarkMode);
          return (
            <PaperProvider
              theme={appDarkMode ? CombinedDarkTheme : CombinedDefaultTheme}>
              <StateContextProvider>
                <LoadableApp />
              </StateContextProvider>
            </PaperProvider>
          );
        }}
      </SettingsContext.Consumer>
    </SettingsContextProvider>
  );
}
