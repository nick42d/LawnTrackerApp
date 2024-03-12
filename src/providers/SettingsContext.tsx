import {createContext, useEffect, useState} from 'react';
import {defaultSettings as defaultSettings} from '../Mock';
import {Settings, SettingsState} from '../state/State';

export const SettingsContext = createContext<SettingsState>({
  settings: defaultSettings(),
  setSettings: undefined,
});

export function SettingsContextProvider({children}: React.PropsWithChildren) {
  const [settings, setSettings] = useState(defaultSettings());
  return (
    <SettingsContext.Provider value={{settings, setSettings}}>
      {children}
    </SettingsContext.Provider>
  );
}
