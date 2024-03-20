// File to contain functions that call weather api and process weather api
import {Location} from './state/State';
import {
  API_LOCATIONS_LANGUAGE,
  API_LOCATIONS_URL,
  API_TIMEZONE,
  API_WEATHER_CURRENT_PARAMS,
  API_WEATHER_DAILY_PARAMS,
  API_WEATHER_URL,
} from './Consts';
import {
  Weather,
  WeatherApiForecast,
  WeatherApiLocations,
  WeatherAppDay,
  apiLocationsToAppLocations,
  apiWeatherToAppWeather,
} from './api/Types';
import {celsiustoFarenheit, farenheitToCelsius} from './Knowledge';

export async function fetchLocations(locName: string, results: number) {
  const response = await fetch(
    `${API_LOCATIONS_URL}?name=${locName}&count=${results}&language=${API_LOCATIONS_LANGUAGE}&format=json`,
  )
    .then(r => {
      return r.json() as Promise<WeatherApiLocations>;
    })
    .then(l => {
      return apiLocationsToAppLocations(l);
    })
    .catch(e => console.log('Error', e));
  return response;
}
export async function fetchWeather(
  latitude: number,
  longitude: number,
  past_days: number,
  forecast_days: number,
): Promise<void | Weather> {
  const response = await fetch(
    `${API_WEATHER_URL}?&latitude=${latitude}&longitude=${longitude}&daily=${API_WEATHER_DAILY_PARAMS.join()}&current=${API_WEATHER_CURRENT_PARAMS.join()}&timeformat=unixtime&timezone=${API_TIMEZONE}&past_days=${past_days}&forecast_days=${forecast_days}&format=json`,
  )
    .then(r => {
      return r.json() as Promise<WeatherApiForecast>;
    })
    .then(w => {
      return apiWeatherToAppWeather(w);
    })
    .catch(e => console.log('Error', e));
  return response;
}

export function addWeatherToLocation(
  location: Location,
  newWeather: Weather | void,
): Location {
  if (newWeather === undefined) return location;
  if (location.weather === undefined) {
    location.weather = newWeather;
    return location;
  }
  location.weather = addWeather(location.weather, newWeather);
  return location;
}

export function convertWeatherUnits(
  weather: WeatherAppDay,
  // NOTE: Assumes you checked that unit was different!
  newUnit: 'Celsius' | 'Farenheit',
): WeatherAppDay {
  const newWeather = {
    date_unix: weather.date_unix,
    weather_type: weather.weather_type,
    mintemp:
      newUnit === 'Celsius'
        ? farenheitToCelsius(weather.mintemp)
        : celsiustoFarenheit(weather.mintemp),
    maxtemp:
      newUnit === 'Celsius'
        ? farenheitToCelsius(weather.maxtemp)
        : celsiustoFarenheit(weather.maxtemp),
  };
  return newWeather;
}

export function addWeather(weather: Weather, newWeather: Weather): Weather {
  const isUnitChange = weather.temperature_unit !== newWeather.temperature_unit;
  const newMinDay: number = newWeather.weather_array.reduce<number>(
    (acc: number, cur: WeatherAppDay) => {
      return acc < cur.date_unix ? acc : cur.date_unix;
    },
    Date.now(),
  );
  // Filter old weather array to remove old values and then convert temperature units if needed.
  const filteredDays = weather.weather_array
    .filter(cur => cur.date_unix < newMinDay)
    .map(w =>
      isUnitChange ? convertWeatherUnits(w, newWeather.temperature_unit) : w,
    );
  const combinedDays = filteredDays.concat(newWeather.weather_array);
  return {
    current_condition: newWeather.current_condition,
    temperature_unit: newWeather.temperature_unit,
    weather_array: combinedDays,
  };
}
