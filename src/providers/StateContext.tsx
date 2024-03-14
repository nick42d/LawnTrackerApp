import React, {useEffect, useState} from 'react';
import {GddTracker, WeatherApiHistory} from '../Types';
import {
  MAX_FORECAST_DAYS,
  MAX_HISTORY_DAYS,
  PERTH_LAT,
  PERTH_LONG,
} from '../Consts';
import {API_KEY} from '../../apikey';
import {Location, StateManager} from '../state/State';
import {defaultStateManager, mockGddTrackers, mockLocations} from '../Mock';
import {
  addWeatherToLocation,
  fetchWeatherForecast,
  fetchWeatherHistorical,
} from '../Api';

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
        const weatherFuture = await Promise.all([
          fetchWeatherHistorical(
            location.latitude,
            location.longitude,
            new Date(
              new Date().setDate(new Date().getDate() - MAX_HISTORY_DAYS),
            ),
            new Date(),
          ),
          fetchWeatherForecast(
            location.latitude,
            location.longitude,
            MAX_FORECAST_DAYS,
          ),
        ]);
        return addWeatherToLocation(
          location,
          weatherFuture[0],
          weatherFuture[1],
        );
      }),
    ).then(locations_tmp => {
      console.log('Received response, setting locations');
      setLocations(locations_tmp);
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
