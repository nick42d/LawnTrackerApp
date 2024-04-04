import React, {useEffect, useState} from 'react';
import {GddTracker} from '../Types';
import {MAX_FORECAST_DAYS, MAX_HISTORY_DAYS} from '../Consts';
import {ContextStatus, Location, StateManager} from '../state/State';
import {defaultStateManager, mockGddTrackers, mockLocations} from '../Mock';
import {addWeatherToLocation, fetchWeather} from '../Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  OnLoad,
  onChangeGddTrackers as OnChangeGddTrackers,
  OnChangeLocations,
} from './statecontext/EffectHandlers';
import {StateContextError} from './statecontext/Error';

export const LOCATIONS_STORAGE_KEY = 'LOCATIONS_STATE';
export const GDD_TRACKERS_STORAGE_KEY = 'GDD_TRACKERS_STATE';

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
    OnLoad(setStatus, setGddTrackers, setLocations);
  }, []);
  // Keep state synced to AsyncStorage
  // TODO: Better handle race conditions
  useEffect(() => {
    OnChangeGddTrackers(status, gddTrackers);
  }, [gddTrackers]);
  // Keep state synced to AsyncStorage
  // TODO: Better handle race conditions
  useEffect(() => {
    OnChangeLocations(status, locations);
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
