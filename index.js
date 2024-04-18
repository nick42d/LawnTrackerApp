import 'react-native-gesture-handler';
// Required for uuid - import ASAP
import 'react-native-get-random-values';
/**
 * @format
 */
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import {enGB, registerTranslation} from 'react-native-paper-dates';
import MapLibreGL from '@maplibre/maplibre-react-native';
import {NotifeeBackgroundEventCallback} from './src/Notification';
import BackgroundFetch from 'react-native-background-fetch';
import notifee from '@notifee/react-native';
import {HeadlessCallback} from './src/HeadlessCallback';

export default function Main() {
  return <App />;
}

// MapLibreGl setup
MapLibreGL.requestAndroidLocationPermissions();
MapLibreGL.setAccessToken(null);
registerTranslation('en-GB', enGB);

// Register background event handler for notifee
notifee.onBackgroundEvent(NotifeeBackgroundEventCallback);

// Register BackgroundFetch Headless Callback
BackgroundFetch.registerHeadlessTask(HeadlessCallback);

// React Native setup
AppRegistry.registerComponent(appName, () => Main);
