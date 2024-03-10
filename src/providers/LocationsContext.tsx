import React, {useEffect} from 'react';
import {WeatherApiHistory} from '../Types';
import {
  MAX_FORECAST_DAYS,
  MAX_HISTORY_DAYS,
  PERTH_LAT,
  PERTH_LONG,
} from '../Consts';
import {API_KEY} from '../../apikey';
import {Location, LocationsState} from '../state/State';
import {mockLocations} from '../Mock';
import {
  addWeatherToLocation,
  fetchWeatherForecast,
  fetchWeatherHistorical,
} from '../Api';

export const LocationsContext = React.createContext<LocationsState>({
  locations: [],
  refresh: undefined,
  addLocation: undefined,
  deleteLocationName: undefined,
});

export const LocationsContextProvider = ({
  children,
}: React.PropsWithChildren): React.JSX.Element => {
  const [locations, setLocations] = React.useState(mockLocations());
  useEffect(() => {
    refresh();
  }, []);
  function refresh() {
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
  function addLocation(location: Location) {
    locations.push(location);
    setLocations(locations);
  }
  function deleteLocationName(locName: string) {
    console.log(`Deleting location name ${locName}`);
    const new_locations = locations.filter(item => item.name !== locName);
    setLocations(new_locations);
  }
  return (
    <LocationsContext.Provider
      value={{locations, refresh, addLocation, deleteLocationName}}>
      {children}
    </LocationsContext.Provider>
  );
};
