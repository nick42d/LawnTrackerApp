import {createContext, useEffect, useState} from 'react';
import {defaultSettings as defaultSettings} from '../Mock';
import {Settings, SettingsState} from '../state/State';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SettingsContext = createContext<SettingsState>({
  settings: defaultSettings(),
  setSettings: undefined,
});

export function SettingsContextProvider({children}: React.PropsWithChildren) {
  const [settings, setSettings] = useState(defaultSettings());
  useEffect(() => {
    console.log('Settings context loaded');
    const promise = AsyncStorage.getItem('settingset')
      .then(x => {
        if (x === 'true') console.log('Settings storage variable set');
        else console.log('Settings storage variable not set');
      })
      .catch(() => console.log('Error setting setting'));
  }, []);
  function setSettingsWrapper(settingTemp: Settings) {
    console.log('Setting settings');
    const promise = AsyncStorage.setItem('settingset', 'true')
      .then(() => console.log('Setting set'))
      .catch(() => console.log('Error setting setting'));
    setSettings(settingTemp);
  }
  return (
    <SettingsContext.Provider
      value={{settings, setSettings: setSettingsWrapper}}>
      {children}
    </SettingsContext.Provider>
  );
}
