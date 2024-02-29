import 'react-native-gesture-handler';
/**
 * @format
 */

import {AppRegistry, useColorScheme} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import {MD3DarkTheme, MD3LightTheme, PaperProvider} from 'react-native-paper';
import {enGB, registerTranslation} from 'react-native-paper-dates';

registerTranslation('en-GB', enGB);

export default function Main() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <PaperProvider theme={isDarkMode ? MD3DarkTheme : MD3LightTheme}>
      <App />
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
