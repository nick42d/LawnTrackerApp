// File to contain functions that call weather api and process weather api
import {Location} from './providers/statecontext/Locations';
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
  Weather,
  WeatherApiForecast,
  WeatherApiLocations,
  WeatherAppDay,
  apiLocationsToAppLocations,
  ApiTemperatureUnit as ApiTemperatureUnit,
  apiWeatherToAppWeather,
  appUnitOfMeasureToApiTemperatureUnit,
} from './api/Types';
import {celsiustoFarenheit, farenheitToCelsius} from './Knowledge';
import {UnitOfMeasure} from './providers/settingscontext/Types';

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
  unitOfMeasure: UnitOfMeasure,
): Promise<void | Weather> {
  const temperature_unit = appUnitOfMeasureToApiTemperatureUnit(unitOfMeasure);
  const response = await fetch(
    `${API_WEATHER_URL}?&latitude=${latitude}&longitude=${longitude}&daily=${API_WEATHER_DAILY_PARAMS.join()}&current=${API_WEATHER_CURRENT_PARAMS.join()}&timeformat=unixtime&timezone=${API_TIMEZONE}&past_days=${past_days}&forecast_days=${forecast_days}&temperature_unit=${temperature_unit}&format=json`,
  )
    .then(r => {
      return r.json() as Promise<WeatherApiForecast>;
    })
    .then(w => {
      return apiWeatherToAppWeather(w, unitOfMeasure);
    })
    .catch(e => console.log('Error', e));
  return response;
}
export async function refreshLocationsWeather(
  locations: Location[],
): Promise<Location[]> {
  return await Promise.all(
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
  );
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
    date_unix: weather.date_unix,
    weather_type: weather.weather_type,
    mintemp: Converter(weather.mintemp),
    maxtemp: Converter(weather.maxtemp),
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
