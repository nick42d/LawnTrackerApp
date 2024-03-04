/**
 * @format
 */
import {LocationsContextProvider} from './providers/LocationsContext';
import {SettingsContextProvider} from './providers/SettingsContext';
import {AppRootStackNavigator} from './navigation/Root';

export default function App(): React.JSX.Element {
  return (
    // TODO: Safe Area
    <SettingsContextProvider>
      <LocationsContextProvider>
        <AppRootStackNavigator />
      </LocationsContextProvider>
    </SettingsContextProvider>
  );
}
