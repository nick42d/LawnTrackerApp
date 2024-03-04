/**
 * @format
 */
import {WeatherContextProvider} from './providers/WeatherContext';
import {SettingsContextProvider} from './providers/SettingsContext';
import {AppRootStackNavigator} from './navigation/Root';

export default function App(): React.JSX.Element {
  return (
    // TODO: Safe Area
    <SettingsContextProvider>
      <WeatherContextProvider>
        <AppRootStackNavigator />
      </WeatherContextProvider>
    </SettingsContextProvider>
  );
}
