import React, {useEffect, useState} from 'react';
import {GddTracker} from '../Types';
import {MAX_FORECAST_DAYS, MAX_HISTORY_DAYS} from '../Consts';
import {ContextStatus, Location, StateManager} from '../state/State';
import {defaultStateManager, mockGddTrackers, mockLocations} from '../Mock';
import {addWeatherToLocation, fetchWeather} from '../Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATIONS_STORAGE_KEY = 'LOCATIONS_STATE';
const GDD_TRACKERS_STORAGE_KEY = 'GDD_TRACKERS_STATE';
export const StateContext = React.createContext<StateManager>(
  defaultStateManager(),
);
export const StateContextProvider = ({
  children,
}: React.PropsWithChildren): React.JSX.Element => {
  const [locations, setLocations] = useState(mockLocations());
  const [gddTrackers, setGddTrackers] = useState(mockGddTrackers());
  const [status, setStatus] = useState<ContextStatus>('Initialised');

  // On load, load up state and then refresh weather.
  useEffect(() => {
    console.log('Settings context loaded');
    setStatus('Loading');
    AsyncStorage.multiGet([LOCATIONS_STORAGE_KEY, GDD_TRACKERS_STORAGE_KEY])
      .then(x => {
        const containsLoc = x.find(y => y[0] === LOCATIONS_STORAGE_KEY);
        const containsGddTrackers = x.find(
          y => y[0] === GDD_TRACKERS_STORAGE_KEY,
        );
        if (
          containsLoc !== undefined &&
          containsLoc[1] !== null &&
          containsGddTrackers !== undefined &&
          containsGddTrackers[1] !== null
        ) {
          console.log('Loading app state from device');
          // NOTE: Parse could fail if someone else writes to these keys!
          setLocations(JSON.parse(containsLoc[1]));
          setGddTrackers(JSON.parse(containsGddTrackers[1]));
        } else console.log('Missing some App state on device - using defaults');
        setStatus('Loaded');
      })
      .then(() => refreshWeather())
      .catch(() => console.log('Error getting app state'));
  }, []);
  // Keep state synced to AsyncStorage
  // TODO: Better handle race conditions
  // TODO: Consider splitting handlers into two effects
  useEffect(() => {
    let active = true;
    console.log('App state changed');
    if (status === 'Loaded') {
      console.log('Setting app state');
      AsyncStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(locations))
        .then(() =>
          !active
            ? console.error(
                'Destructor called on effect before write locations finished',
              )
            : console.log('Locations set'),
        )
        .catch(() => console.log('Error setting locations'));
      AsyncStorage.setItem(
        GDD_TRACKERS_STORAGE_KEY,
        JSON.stringify(gddTrackers),
      )
        .then(() =>
          !active
            ? console.error(
                'Destructor called on effect before write trackers finished',
              )
            : console.log('Trackers set'),
        )
        .catch(() => console.log('Error setting trackers'));
    }
    return () => {
      active = false;
      console.log('Cleaning up app state effect');
    };
  }, [locations, gddTrackers]);

  function refreshWeather() {
    Promise.all(
      locations.map(async location => {
        const weatherFuture = await fetchWeather(
          location.latitude,
          location.longitude,
          MAX_HISTORY_DAYS,
          MAX_FORECAST_DAYS,
        );
        return addWeatherToLocation(location, weatherFuture);
      }),
    ).then(newLocations => {
      console.log('Received response, setting locations');
      setLocations(newLocations);
    });
  }
  function addGddTracker(gddTracker: GddTracker) {
    setGddTrackers([...gddTrackers, gddTracker]);
  }
  function resetGddTrackerName(name: string) {
    console.log(`Resetting GDD tracker name ${name}`);
    const new_state = gddTrackers.map(element =>
      element.name === name
        ? {...element, start_date_unix_ms: Date.now()}
        : element,
    );
    setGddTrackers(new_state);
  }
  function deleteGddTrackerName(trackerName: string) {
    console.log(`Deleting GDD tracker name ${trackerName}`);
    const newGddTrackers = gddTrackers.filter(
      item => item.name !== trackerName,
    );
    setGddTrackers(newGddTrackers);
  }
  function addLocation(location: Location) {
    setLocations([...locations, location]);
  }
  function deleteLocationName(locName: string) {
    console.log(`Deleting location name ${locName}`);
    const new_locations = locations.filter(item => item.name !== locName);
    setLocations(new_locations);
  }
  return (
    <StateContext.Provider
      value={{
        locations,
        gddTrackers,
        status: status,
        refreshWeather,
        addLocation,
        deleteLocationName,
        addGddTracker,
        deleteGddTrackerName,
        resetGddTrackerName,
      }}>
      {children}
    </StateContext.Provider>
  );
};
