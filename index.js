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

MapLibreGL.setAccessToken(null);
registerTranslation('en-GB', enGB);

export default function Main() {
  return <App />;
}

AppRegistry.registerComponent(appName, () => Main);
