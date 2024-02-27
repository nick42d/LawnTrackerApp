import React, {useEffect} from 'react';
import {
  WeatherApiHistory,
  WeatherAppHistory,
  apiHistoryToAppHistory,
} from './Types';
import {PERTH_LAT, PERTH_LONG} from './Consts';
import {API_KEY} from '../apikey';
import {WeatherAppForecast} from './Types';

export const WeatherContext = React.createContext({
  historical: {
    location: 'loading',
    forecasts: [
      {
        date: new Date('01-01-2001'),
        maxtemp_c: 10,
        mintemp_c: 20,
      },
    ],
  },
  forecast: {
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
  const [forecast, setForecast] = React.useState({
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
      new Date(new Date().setDate(new Date().getDate() - 6)),
      new Date(),
    );
    fetchWeatherForecast(PERTH_LAT, PERTH_LONG, 2);
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
    weather_setter.location = new_weather.location;
    setWeather(weather_setter);
  }
  function fetchWeatherForecast(lat: number, long: number, days: number) {
    console.log(`Attempting to fetch from API days:${days}`);
    fetch(
      `https://api.weatherapi.com/v1/forecast.json?&key=${API_KEY}&q=${lat},${long}&days=${days}&hour=17&aqi=no`,
    )
      .then(res => res.json() as Promise<WeatherApiHistory>)
      .then(json => {
        setForecast(apiHistoryToAppHistory(json));
      })
      .catch(err => console.log(err));
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
      `https://api.weatherapi.com/v1/history.json?&key=${API_KEY}&q=${lat},${long}&unixdt=${start_unix}&unixend_dt=${end_unix}&hour=17`,
    )
      .then(res => res.json() as Promise<WeatherApiHistory>)
      .then(json => {
        addWeather(apiHistoryToAppHistory(json));
      })
      .catch(err => console.log(err));
  }
  return (
    <WeatherContext.Provider
      value={{historical: weather, forecast: forecast, refresh: refresh_func}}>
      {children}
    </WeatherContext.Provider>
  );
};
