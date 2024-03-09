/**
 * @format
 */
import {LocationsContextProvider} from './providers/LocationsContext';
import {AppRootStackNavigator} from './navigation/Root';
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

const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});
const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

export default function App(): React.JSX.Element {
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
      <LocationsContextProvider>
        <AppRootStackNavigator />
      </LocationsContextProvider>
    </PaperProvider>
  );
}
