import {createContext, useEffect, useState} from 'react';
import {defaultSettings as defaultSettings} from '../Mock';
import {Settings, SettingsState} from '../state/State';
import {storage} from '../App';

export const SettingsContext = createContext<SettingsState>({
  settings: defaultSettings(),
  setSettings: undefined,
});

export function SettingsContextProvider({children}: React.PropsWithChildren) {
  const [settings, setSettings] = useState(defaultSettings());
  useEffect(() => {
    console.log('Settings context loaded');
    const test = storage.getBoolean('settingset');
    if (test) console.log('Settings storage variable set');
    else console.log('Settings storage variable not set');
  }, []);
  function setSettingsWrapper(settingTemp: Settings) {
    console.log('Setting settings');
    storage.set('settingset', true);
    setSettings(settingTemp);
  }
  return (
    <SettingsContext.Provider
      value={{settings, setSettings: setSettingsWrapper}}>
      {children}
    </SettingsContext.Provider>
  );
}
