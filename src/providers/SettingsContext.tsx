import {createContext, useEffect, useState} from 'react';
import {defaultSettings as defaultSettings} from '../Mock';
import {SettingsState} from './settingscontext/Types';
import {ContextStatus} from './Types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SETTINGS_STORAGE_KEY = 'SETTINGS';
export const SettingsContext = createContext<SettingsState>({
  settings: defaultSettings(),
  status: 'Initialised',
  setSettings: undefined,
});

export function SettingsContextProvider({children}: React.PropsWithChildren) {
  // Note, pass defaults function to useState to avoid calling on every render.
  const [settings, setSettings] = useState(defaultSettings);
  const [status, setStatus] = useState<ContextStatus>('Initialised');

  // On load, load up settings if stored locally.
  useEffect(() => {
    console.log('Settings context loaded');
    setStatus('Loading');
    AsyncStorage.getItem(SETTINGS_STORAGE_KEY)
      .then(x => {
        if (x !== null) {
          console.log('Loading Settings from device');
          // NOTE: Parse could fail if someone else writes to this key!
          setSettings(JSON.parse(x));
        } else console.log('No Settings on device - using defaults');
        setStatus('Loaded');
      })
      .catch(() => console.log('Error getting settings'));
  }, []);
  // Keep settings synced to AsyncStorage
  // TODO: Better handle race conditions
  useEffect(() => {
    let active = true;
    console.log('Settings state changed');
    if (status === 'Loaded') {
      console.log('Setting settings');
      AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
        .then(() =>
          !active
            ? console.error(
                'Destructor called on effect before write settings finished',
              )
            : console.log('Settings set'),
        )
        .catch(() => console.log('Error setting settings'));
    }
    return () => {
      active = false;
      console.log('Cleaning up settings effect');
    };
  }, [settings]);
  return (
    <SettingsContext.Provider value={{settings, status, setSettings}}>
      {children}
    </SettingsContext.Provider>
  );
}
