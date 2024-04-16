import AsyncStorage from '@react-native-async-storage/async-storage';
import {SETTINGS_STORAGE_KEY} from '../SettingsContext';
import {Settings} from './Types';

export async function getStoredSettings(): Promise<Settings | undefined> {
  console.log('Attempting to get Settings from device');
  const maybeSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
  if (maybeSettings !== null) {
    try {
      // Assuming this is type safe since it has annotation
      // NOTE: Parse could fail if someone else writes to the key!
      const settings: Settings = JSON.parse(maybeSettings);
      return settings;
    } catch (e) {
      console.warn('Error parsing stored settings: ', e);
      return undefined;
    }
  }
  console.log('Settings were not found on device');
  return undefined;
}
