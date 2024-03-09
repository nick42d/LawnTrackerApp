import {createContext, useEffect, useState} from 'react';
import {defaultSettings as defaultSettings} from '../Mock';
import {SettingsState} from '../state/State';

export const SettingsContext = createContext<SettingsState>({
  settings: defaultSettings(),
  setDarkMode: undefined,
  setAutoDarkMode: undefined,
});

export function SettingsContextProvider({children}: React.PropsWithChildren) {
  const [settings, setSettings] = useState(defaultSettings());
  function setDarkMode(value: boolean) {
    console.log(`Called setDarkMode ${value}`);
    setSettings({...settings, dark_mode_enabled: value});
  }
  function setAutoDarkMode(value: boolean) {
    console.log(`Called setAutoDarkMode ${value}`);
    setSettings({...settings, auto_dark_mode: value});
  }
  return (
    <SettingsContext.Provider value={{settings, setDarkMode, setAutoDarkMode}}>
      {children}
    </SettingsContext.Provider>
  );
}
