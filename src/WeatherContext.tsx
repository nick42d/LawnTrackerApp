import React, {useEffect} from 'react';
import {
  WeatherApiHistory,
  WeatherAppHistory,
  apiHistoryToAppHistory,
  dayGddStat,
} from './Types';
import {PERTH_LAT, PERTH_LONG} from './Consts';
import {API_KEY} from '../apikey';
import {WeatherAppForecast} from './Types';

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
      new Date(new Date().setDate(new Date().getDate() - 7)),
      new Date(),
    );
  };
  function addWeather(new_weather: WeatherAppHistory) {
    const new_min_day: Date = new_weather.forecasts.reduce<Date>(
      (acc: Date, cur: WeatherAppForecast) => {
        return acc < cur.date ? acc : cur.date;
      },
      new Date(Date.now()),
    );
    const filtered_weather_days = weather.forecasts.filter(
      cur => cur.date < new_min_day,
    );
    const combined_weather = filtered_weather_days.concat(
      new_weather.forecasts,
    );
    const weather_setter = weather;
    weather_setter.forecasts = combined_weather;
    setWeather(weather_setter);
  }
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
      .then(json => addWeather(apiHistoryToAppHistory(json)));
  }
  return (
    <WeatherContext.Provider value={{data: weather, refresh: refresh_func}}>
      {children}
    </WeatherContext.Provider>
  );
};
