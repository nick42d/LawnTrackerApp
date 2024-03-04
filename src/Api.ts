// File to contain functions that call weather api and process weather api
import {API_KEY} from '../apikey';
import {apiHistoryToAppForecast, apiHistoryToAppHistory} from './Types';
import {WeatherApiHistory} from './Types';
import {Location, WeatherAppForecast, WeatherAppHistory} from './state/State';

export async function fetchWeatherForecast(
  lat: number,
  long: number,
  days: number,
): Promise<void | WeatherAppForecast[]> {
  console.log(`Attempting to fetch from API, forecast weather, days:${days}`);
  return await fetch(
    `https://api.weatherapi.com/v1/forecast.json?&key=${API_KEY}&q=${lat},${long}&days=${days}&hour=17&aqi=no`,
  )
    .then(res => res.json() as Promise<WeatherApiHistory>)
    .then(json => apiHistoryToAppForecast(json))
    .catch(err => console.log(err));
}

export async function fetchWeatherHistorical(
  lat: number,
  long: number,
  start: Date,
  end: Date,
): Promise<void | WeatherAppHistory> {
  const start_unix = Math.floor(start.getTime() / 1000);
  const end_unix = Math.floor(end.getTime() / 1000);
  console.log(
    `Attempting to fetch from API, historical weather from ${start.toDateString()}`,
  );
  return await fetch(
    `https://api.weatherapi.com/v1/history.json?&key=${API_KEY}&q=${lat},${long}&unixdt=${start_unix}&unixend_dt=${end_unix}&hour=17`,
  )
    .then(res => res.json() as Promise<WeatherApiHistory>)
    .then(json => apiHistoryToAppHistory(json))
    .catch(err => console.log(err));
}

export function addWeatherToLocation(
  location: Location,
  newWeatherHistory: WeatherAppHistory | void,
  newWeatherForecast: WeatherAppForecast[] | void,
): Location {
  newWeatherHistory ? (location.weather.today = newWeatherHistory.current) : {};
  newWeatherHistory
    ? (location.weather.historical = addWeatherForecast(
        location.weather.historical,
        newWeatherHistory.historical,
      ))
    : {};
  newWeatherForecast
    ? (location.weather.forecast = addWeatherForecast(
        location.weather.forecast,
        newWeatherForecast,
      ))
    : {};
  return location;
}

export function addWeatherForecast(
  forecast: WeatherAppForecast[] | undefined,
  new_forecast: WeatherAppForecast[],
): WeatherAppForecast[] {
  if (forecast === undefined) return new_forecast;
  const new_min_day: number = new_forecast.reduce<number>(
    (acc: number, cur: WeatherAppForecast) => {
      return acc < cur.date_unix ? acc : cur.date_unix;
    },
    Date.now(),
  );
  const filtered_weather_days = forecast.filter(
    cur => cur.date_unix < new_min_day,
  );
  const combined_weather = filtered_weather_days.concat(new_forecast);
  return combined_weather;
}
