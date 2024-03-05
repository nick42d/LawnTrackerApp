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

registerTranslation('en-GB', enGB);

const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});
const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

export default function Main() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <PaperProvider
      theme={isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme}>
      <App />
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
