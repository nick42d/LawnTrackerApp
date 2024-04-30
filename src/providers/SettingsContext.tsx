import {createContext, useEffect, useState} from 'react';
import {LogErrorCallbackNotSet} from '../Utils';
import {defaultSettings as defaultSettings} from './settingscontext/Types';
import {SettingsState} from './settingscontext/Types';
import {ContextStatus} from './Types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {timeout} from '../Utils';
import {getStoredSettings} from './settingscontext/AsyncStorage';

export const SETTINGS_STORAGE_KEY = 'SETTINGS';
export const SettingsContext = createContext<SettingsState>({
  settings: defaultSettings(),
  status: 'Initialised',
  setSettings: _ => LogErrorCallbackNotSet('setSettings'),
});

export function SettingsContextProvider({children}: React.PropsWithChildren) {
  // Note, pass defaults function to useState to avoid calling on every render.
  const [settings, setSettings] = useState(defaultSettings);
  const [status, setStatus] = useState<ContextStatus>('Initialised');

  // On load, load up settings if stored locally.
  useEffect(() => {
    console.log('Settings context loaded');
    setStatus('Loading');
    getStoredSettings().then(s => {
      if (s !== undefined) {
        console.log('Loading Settings from device');
        setSettings(s);
      } else console.log("Couldn't load Settings - using defaults");
      setStatus('Loaded');
    });
  }, []);
  // Keep settings synced to AsyncStorage
  // TODO: Better handle race conditions
  useEffect(() => {
    let active = true;
    console.log('Settings state changed');
    timeout(50).then(() => {
      if (active === false) return;
      if (status === 'Loaded') {
        console.log('Setting settings');
        AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
          .then(() =>
            !active
              ? console.warn(
                  'Destructor called on effect before write settings finished',
                )
              : console.log('Settings set'),
          )
          .catch(() => console.log('Error setting settings'));
      }
    });
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
