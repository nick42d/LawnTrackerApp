import React, {useEffect} from 'react';
import {WeatherApiHistory, apiHistoryToAppHistory, dayGddStat} from './Types';
import {PERTH_LAT, PERTH_LONG} from './Consts';
import {API_KEY} from '../apikey';

export const WeatherContext = React.createContext({
  data: {
    location: 'loading',
    forecasts: [
      {
        date: new Date('01-01-2001'),
        maxtemp_c: 10,
        mintemp_c: 20,
      },
    ],
  },
  refresh: () => {},
});

export const WeatherContextProvider = ({
  children,
}: React.PropsWithChildren): React.JSX.Element => {
  const [weather, setWeather] = React.useState({
    location: 'loading',
    forecasts: [
      {
        date: new Date('01-01-2001'),
        maxtemp_c: 10,
        mintemp_c: 20,
      },
    ],
  });
  useEffect(() => {
    refresh_func();
    // Don't call useEffect if location hasn't changed.
    // Note, here this is called twice as location starts as 'loading' and then changes.
  }, []);
  // Duplication...
  const refresh_func = () => {
    fetchWeatherHistorical(
      PERTH_LAT,
      PERTH_LONG,
      new Date('2024-2-18'),
      new Date('2024-2-30'),
    );
  };
  function fetchWeatherHistorical(
    lat: number,
    long: number,
    start: Date,
    end: Date,
  ) {
    const start_unix = Math.floor(start.getTime() / 1000);
    const end_unix = Math.floor(end.getTime() / 1000);
    console.log(
      `Attempting to fetch from API ${start_unix} ${end_unix} ${Date.now()}`,
    );
    fetch(
      `http://api.weatherapi.com/v1/history.json?&key=${API_KEY}&q=${lat},${long}&unixdt=${start_unix}&unixend_dt=${end_unix}&hour=17`,
    )
      .then(res => res.json() as Promise<WeatherApiHistory>)
      .then(json => setWeather(apiHistoryToAppHistory(json)));
  }
  return (
    <WeatherContext.Provider value={{data: weather, refresh: refresh_func}}>
      {children}
    </WeatherContext.Provider>
  );
};
