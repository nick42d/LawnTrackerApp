import React, {useEffect, useState} from 'react';
import {
  GddTracker,
  Tracker,
  resetTracker,
  resumeTracker,
  stopTracker,
} from './statecontext/Trackers';
import {
  API_UNIT_OF_MEASURE,
  MAX_FORECAST_DAYS,
  MAX_HISTORY_DAYS,
} from '../Consts';
import {ContextStatus} from './Types';
import {StateManager} from './statecontext/Types';
import {Location} from './statecontext/Locations';
import {defaultStateManager, mockTrackers, mockLocations} from '../Mock';
import {addWeatherToLocation, fetchWeather} from '../Api';
import {
  onChangeGddTrackers as OnChangeGddTrackers,
  OnChangeLocations,
  GetStoredState,
} from './statecontext/EffectHandlers';
import {StateContextError} from './statecontext/Error';
import {initBackgroundFetch} from './statecontext/BackgroundFetch';

export const LOCATIONS_STORAGE_KEY = 'LOCATIONS_STATE';
export const GDD_TRACKERS_STORAGE_KEY = 'GDD_TRACKERS_STATE';

export const StateContext = React.createContext<StateManager>(
  defaultStateManager(),
);
export function StateContextProvider({
  children,
}: React.PropsWithChildren): React.JSX.Element {
  // Note, pass defaults functions to useState to avoid calling on every render.
  const [locations, setLocations] = useState(mockLocations);
  const [trackers, setTrackers] = useState(mockTrackers);
  const [status, setStatus] = useState<ContextStatus>('Initialised');
  // On load, load up state and then refresh weather.
  useEffect(() => {
    console.log('App state context loaded, checking device for app state');
    setStatus('Loading');
    GetStoredState()
      .then(s => {
        if (s === undefined) {
          console.info("App state wasn't on device, using defaults");
          return;
        }
        setTrackers(s.trackers);
        setLocations(s.locations);
        console.log('Loaded app state from device');
      })
      .then(_ => setStatus('Loaded'))
      .then(_ => refreshWeather())
      .catch(() => console.warn('Error getting app state'));
    // Initialize BackgroundFetch only once when component mounts.
    initBackgroundFetch();
  }, []);
  // Keep state synced to AsyncStorage
  // TODO: Better handle race conditions
  useEffect(() => {
    console.log('App state changed - trackers');
    OnChangeGddTrackers(status, trackers);
  }, [trackers]);
  // Keep state synced to AsyncStorage
  // TODO: Better handle race conditions
  useEffect(() => {
    console.log('App state changed - locations');
    locations.map(l => {
      console.log(l.name, 'status: ', l.weatherStatus);
    });
    OnChangeLocations(status, locations);
  }, [locations]);

  function setLocationsWeatherRefreshing() {
    const newLocations: Location[] = locations.map(l => ({
      ...l,
      weatherStatus: {...l.weatherStatus, status: 'Refreshing'},
    }));
    setLocations(newLocations);
  }
  function setLocationsWeatherLoaded(timeUnixMs: number) {
    const newLocations: Location[] = locations.map(l => ({
      ...l,
      weatherStatus: {lastRefreshedUnixMs: timeUnixMs, status: 'Loaded'},
    }));
    setLocations(newLocations);
  }
  // Should this be async?
  function refreshWeather() {
    // Note - this triggers three location changes and thus writes to DB
    // Should be a better way??
    console.log('Refreshing weather');
    setLocationsWeatherRefreshing();
    // Note - promise is executed with location prior to the change we made above.
    Promise.all(
      locations.map(async location => {
        const weatherFuture = await fetchWeather(
          location.latitude,
          location.longitude,
          MAX_HISTORY_DAYS,
          MAX_FORECAST_DAYS,
          API_UNIT_OF_MEASURE,
        );
        return addWeatherToLocation(location, weatherFuture);
      }),
    ).then(newLocations => {
      console.log('Received response, setting locations');
      setLocations(newLocations);
      setLocationsWeatherLoaded(new Date().valueOf());
    });
  }
  function addTracker(tracker: Tracker) {
    setTrackers([...trackers, tracker]);
  }
  // Note - not all trackers can be reset, but more than just GDD trackers.
  function resetTrackerName(name: string) {
    console.log(`Resetting GDD tracker name ${name}`);
    const new_state = trackers.map(t =>
      t.name === name ? resetTracker(t) : t,
    );
    setTrackers(new_state);
  }
  function deleteTrackerName(trackerName: string) {
    console.log(`Deleting tracker name ${trackerName}`);
    const newTrackers = trackers.filter(item => item.name !== trackerName);
    setTrackers(newTrackers);
  }
  function stopTrackerName(trackerName: string) {
    console.log(`Stopping tracker name ${trackerName}`);
    const newTrackers = trackers.map(t =>
      t.name === trackerName ? stopTracker(t) : t,
    );
    setTrackers(newTrackers);
  }
  function resumeTrackerName(trackerName: string) {
    console.log(`Resuming tracker name ${trackerName}`);
    const newTrackers = trackers.map(t =>
      t.name === trackerName ? resumeTracker(t) : t,
    );
    setTrackers(newTrackers);
  }
  function addLocation(location: Location) {
    setLocations([...locations, location]);
  }
  function deleteLocationName(locName: string) {
    console.log(`Attempting to delete location name ${locName}`);
    // Can't delete a location if it's used in a GDD Tracker.
    if (
      trackers.find(t => {
        t.kind === 'gdd' && t.location_name === locName;
      }) !== undefined
    ) {
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
        trackers,
        status,
        refreshWeather,
        addLocation,
        deleteLocationName,
        addTracker,
        deleteTrackerName,
        resetTrackerName,
        stopTrackerName,
        resumeTrackerName,
      }}>
      {children}
    </StateContext.Provider>
  );
}
