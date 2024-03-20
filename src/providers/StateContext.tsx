import React, {useEffect, useState} from 'react';
import {GddTracker} from '../Types';
import {MAX_FORECAST_DAYS, MAX_HISTORY_DAYS} from '../Consts';
import {Location, StateManager} from '../state/State';
import {defaultStateManager, mockGddTrackers, mockLocations} from '../Mock';
import {addWeatherToLocation, fetchWeather} from '../Api';

export const StateContext = React.createContext<StateManager>(
  defaultStateManager(),
);

export const StateContextProvider = ({
  children,
}: React.PropsWithChildren): React.JSX.Element => {
  const [locations, setLocations] = React.useState(mockLocations());
  const [gddTrackers, setGddTrackers] = useState(mockGddTrackers());
  useEffect(() => {
    refreshWeather();
  }, []);
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
