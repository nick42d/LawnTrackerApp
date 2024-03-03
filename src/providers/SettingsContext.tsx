import {createContext, useState} from 'react';
import {defaultSettings} from '../Mock';

export const SettingsContext = createContext(defaultSettings());

export function SettingsContextProvider({children}: React.PropsWithChildren) {
  const [settings, setSettings] = useState(defaultSettings());
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}
