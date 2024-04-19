// File to contain functions that call weather api and process weather api
import {Location, WeatherSchema} from './providers/statecontext/Locations';
import {
  API_LOCATIONS_LANGUAGE,
  API_LOCATIONS_URL,
  API_TIMEZONE,
  API_UNIT_OF_MEASURE,
  API_WEATHER_CURRENT_PARAMS,
  API_WEATHER_DAILY_PARAMS,
  API_WEATHER_URL,
  MAX_FORECAST_DAYS,
  MAX_HISTORY_DAYS,
} from './Consts';
import {
  WeatherApiForecast,
  WeatherApiForecastSchema,
  WeatherApiLocations,
  WeatherApiLocationsSchema,
  apiWeatherToAppWeather,
  appUnitOfMeasureToApiTemperatureUnit,
} from './api/Types';
import {Weather, WeatherAppDay} from './providers/statecontext/Locations';
import {celsiustoFarenheit, farenheitToCelsius} from './Knowledge';
import {UnitOfMeasure} from './providers/settingscontext/Types';
import * as v from 'valibot';

export async function fetchLocations(
  locName: string,
  results: number,
): Promise<void | WeatherApiLocations> {
  const response = await fetch(
    `${API_LOCATIONS_URL}?name=${locName}&count=${results}&language=${API_LOCATIONS_LANGUAGE}&format=json`,
  )
    .then(r => r.json())
    .then(j => v.parse(WeatherApiLocationsSchema, j))
    .catch(e => console.log('Error', e));
  return response;
}
export async function fetchWeather(
  latitude: number,
  longitude: number,
  past_days: number,
  forecast_days: number,
  unitOfMeasure: UnitOfMeasure,
): Promise<void | Weather> {
  const temperature_unit = appUnitOfMeasureToApiTemperatureUnit(unitOfMeasure);
  const response = await fetch(
    `${API_WEATHER_URL}?&latitude=${latitude}&longitude=${longitude}&daily=${API_WEATHER_DAILY_PARAMS.join()}&current=${API_WEATHER_CURRENT_PARAMS.join()}&timeformat=unixtime&timezone=${API_TIMEZONE}&past_days=${past_days}&forecast_days=${forecast_days}&temperature_unit=${temperature_unit}&format=json`,
  )
    .then(r => r.json())
    .then(j => {
      const weather = v.parse(WeatherApiForecastSchema, j);
      return apiWeatherToAppWeather(weather, unitOfMeasure);
    })
    .catch(e => console.log('Error', e));
  return response;
}
export type WeatherUpdate = {
  weather: void | Weather;
  locationId: number;
};
export async function fetchLocationsWeather(
  locations: Location[],
): Promise<WeatherUpdate[]> {
  return await Promise.all(
    locations.map(async location => {
      return {
        weather: await fetchWeather(
          location.latitude,
          location.longitude,
          MAX_HISTORY_DAYS,
          MAX_FORECAST_DAYS,
          API_UNIT_OF_MEASURE,
        ),
        locationId: location.apiId,
      };
    }),
  );
}
export function addWeatherArrayToLocations(
  locations: Location[],
  weatherArray: {weather: Weather | void; locationId: number}[],
): Location[] {
  return locations.map(l => {
    const weather = weatherArray.find(w => l.apiId === w.locationId);
    if (weather) {
      console.log('Found matching location for returned weather: ', l.name);
      return addWeatherToLocation(l, weather.weather);
    }
    return l;
  });
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
  newUnit: UnitOfMeasure,
): WeatherAppDay {
  const Converter =
    newUnit === 'Metric' ? farenheitToCelsius : celsiustoFarenheit;
  const newWeather = {
    dateUnixMs: weather.dateUnixMs,
    weatherType: weather.weatherType,
    minTemp: Converter(weather.minTemp),
    maxTemp: Converter(weather.maxTemp),
  };
  return newWeather;
}

export function addWeather(weather: Weather, newWeather: Weather): Weather {
  const isUnitChange = weather.temperatureUnit !== newWeather.temperatureUnit;
  const newMinDay: number = newWeather.weatherArray.reduce<number>(
    (acc: number, cur: WeatherAppDay) => Math.min(acc, cur.dateUnixMs),
    Number.MAX_SAFE_INTEGER,
  );
  // Filter old weather array to remove old values and then convert temperature units if needed.
  const filteredDays = weather.weatherArray
    .filter(cur => cur.dateUnixMs < newMinDay)
    .map(w =>
      isUnitChange ? convertWeatherUnits(w, newWeather.temperatureUnit) : w,
    );
  const combinedDays = filteredDays.concat(newWeather.weatherArray);
  return {
    currentCondition: newWeather.currentCondition,
    temperatureUnit: newWeather.temperatureUnit,
    weatherArray: combinedDays,
  };
}
