import React, {useEffect, useState} from 'react';
import {GddTracker} from '../Types';
import {MAX_FORECAST_DAYS, MAX_HISTORY_DAYS} from '../Consts';
import {ContextStatus, Location, StateManager} from '../state/State';
import {defaultStateManager, mockGddTrackers, mockLocations} from '../Mock';
import {addWeatherToLocation, fetchWeather} from '../Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class StateContextError extends Error {
  name: 'DELETE_LOCATIONS_ERROR';
  message: string;
  cause: any;
  constructor({
    name,
    message,
    cause,
  }: {
    name: 'DELETE_LOCATIONS_ERROR';
    message: string;
    cause?: any;
  }) {
    super();
    this.name = name;
    this.message = message;
    this.cause = cause;
  }
}
const LOCATIONS_STORAGE_KEY = 'LOCATIONS_STATE';
const GDD_TRACKERS_STORAGE_KEY = 'GDD_TRACKERS_STATE';
export const StateContext = React.createContext<StateManager>(
  defaultStateManager(),
);
export function StateContextProvider({
  children,
}: React.PropsWithChildren): React.JSX.Element {
  const [locations, setLocations] = useState(mockLocations());
  const [gddTrackers, setGddTrackers] = useState(mockGddTrackers());
  const [status, setStatus] = useState<ContextStatus>('Initialised');

  // On load, load up state and then refresh weather.
  useEffect(() => {
    console.log('App state context loaded');
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
          setGddTrackers(JSON.parse(containsGddTrackers[1]));
          setLocations(JSON.parse(containsLoc[1]));
          console.log('Loaded app state from device');
        } else console.log('Missing some App state on device - using defaults');
        setStatus('Loaded');
      })
      .catch(() => console.log('Error getting app state'));
  }, []);
  // Keep state synced to AsyncStorage
  // TODO: Better handle race conditions
  useEffect(() => {
    let active = true;
    console.log('App state changed - trackers');
    if (status === 'Loaded') {
      console.log('Setting app state - trackers');
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
    } else {
      console.log('Not syncing app state as not Loaded - trackers');
    }
    return () => {
      active = false;
      console.log('Cleaning up app state effect - trackers');
    };
  }, [gddTrackers]);
  // Keep state synced to AsyncStorage
  // TODO: Better handle race conditions
  useEffect(() => {
    let active = true;
    console.log('App state changed - locations');
    if (status === 'Loaded') {
      console.log('Setting app state - locations');
      AsyncStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(locations))
        .then(() =>
          !active
            ? console.error(
                'Destructor called on effect before write locations finished',
              )
            : console.log('Locations set'),
        )
        .catch(() => console.log('Error setting locations'));
    } else {
      console.log('Not syncing app state as not Loaded - locations');
    }
    return () => {
      active = false;
      console.log('Cleaning up app state effect - locations');
    };
  }, [locations]);

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
    console.log(`Attempting to delete location name ${locName}`);
    if (gddTrackers.find(t => t.location_name === locName) !== undefined) {
      console.log(`Unable to delete location as used in an existing tracker`);
      throw new StateContextError({
        name: 'DELETE_LOCATIONS_ERROR',
        message: 'Error deleting location as is used in a current tracker',
      });
    }
    const new_locations = locations.filter(item => item.name !== locName);
    setLocations(new_locations);
  }
  return (
    <StateContext.Provider
      value={{
        locations,
        gddTrackers,
        status,
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
}
