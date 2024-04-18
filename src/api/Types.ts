import {format, startOfDay} from 'date-fns';
import {celsiustoFarenheit, farenheitToCelsius} from '../Knowledge';
import {UnitOfMeasure} from '../providers/settingscontext/Types';

export const API_TEMPERATURE_UNITS = ['celsius', 'farenheit'] as const;
export type ApiTemperatureUnit = (typeof API_TEMPERATURE_UNITS)[number];
export function appUnitOfMeasureToApiTemperatureUnit(
  unit: UnitOfMeasure,
): ApiTemperatureUnit {
  return unit === 'Metric' ? 'celsius' : 'farenheit';
}

export function apiWeatherToAppWeather(
  apiWeather: WeatherApiForecast,
  temperatureUnit: UnitOfMeasure,
): Weather {
  const weatherArray: WeatherAppDay[] = apiWeather.daily.time.map((t, i) => ({
    dateUnixMs: startOfDay(t * 1000).valueOf(),
    weatherType: t > apiWeather.current.time ? 'Forecasted' : 'Historical',
    maxTemp: apiWeather.daily.temperature_2m_max[i],
    minTemp: apiWeather.daily.temperature_2m_min[i],
  }));
  return {
    currentCondition: {
      code: apiWeather.current.weather_code,
      isDay: apiWeather.current.is_day,
      temp: apiWeather.current.temperature_2m,
    },
    weatherArray,
    temperatureUnit,
  };
}

export function apiLocationsToAppLocations(apiLocations: WeatherApiLocations) {
  return apiLocations.results.map(x => apiLocationToAppLocation(x));
}
function apiLocationToAppLocation(
  apiLocation: WeatherApiLocation,
): WeatherAppLocation {
  return {
    apiId: apiLocation.id,
    admin1: apiLocation.admin1,
    country: apiLocation.country,
    latitude: apiLocation.latitude,
    longitude: apiLocation.longitude,
    name: apiLocation.name,
    timezone: apiLocation.timezone,
  };
}

/// Check that Weather satisfies following invariants:
/// Must be sorted by date asc
/// Must not miss any dates between largest date and smallest date
/// Must contain no duplicate dates
export function checkWeatherInvariants(
  weather: Weather,
): WeatherInvariantCheck {
  const scanner = weather.weatherArray.reduce<WeatherInvariantCheck>(
    (acc, e) => {
      if (acc.status === 'Failed')
        return {
          status: 'Failed',
          lastDateUnixMs: acc.lastDateUnixMs,
        };
      if (acc.status === 'Initial' || acc.lastDateUnixMs === undefined)
        return {status: 'Ok', lastDateUnixMs: e.dateUnixMs};
      const prevDate = startOfDay(acc.lastDateUnixMs);
      const nextDate = startOfDay(e.dateUnixMs);
      if (nextDate > prevDate) {
        return {status: 'Ok', lastDateUnixMs: nextDate.valueOf()};
      } else {
        return {status: 'Failed', lastDateUnixMs: nextDate.valueOf()};
      }
    },
    {status: 'Initial', lastDateUnixMs: undefined},
  );
  return scanner;
}
type WeatherInvariantCheck = {
  status: 'Initial' | 'Ok' | 'Failed';
  lastDateUnixMs: number | undefined;
};

export function convertUnits(
  weather: Weather,
  newUnit: UnitOfMeasure,
): Weather {
  if (weather.temperatureUnit === newUnit) return weather;
  const Converter =
    newUnit === 'Imperial' ? celsiustoFarenheit : farenheitToCelsius;
  const newWeatherArray: WeatherAppDay[] = weather.weatherArray.map(w => ({
    maxTemp: Converter(w.maxTemp),
    minTemp: Converter(w.minTemp),
    weatherType: w.weatherType,
    dateUnixMs: w.dateUnixMs,
  }));
  return {
    currentCondition: weather.currentCondition,
    weatherArray: [], // TODO
    temperatureUnit: newUnit,
  };
}

// TODO: Add unit
export type Weather = {
  currentCondition: WeatherAppCondition;
  weatherArray: WeatherAppDay[];
  temperatureUnit: UnitOfMeasure;
};

export type WeatherAppCondition = {
  code: number;
  temp: number;
  isDay: boolean;
};

export type WeatherAppDay = {
  dateUnixMs: number;
  weatherType: 'Historical' | 'Forecasted';
  maxTemp: number;
  minTemp: number;
};

export type WeatherApiLocations = {
  results: WeatherApiLocation[];
};

export type WeatherAppLocations = {
  locations: WeatherAppLocation[];
};

// Trimmed version of API Location type
export type WeatherAppLocation = {
  name: string;
  /// Unique ID for this location from API.
  apiId: number;
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
  /// Top level administrative division - e.g Western Australia
  admin1: string;
};

export type WeatherApiLocation = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  feature_code: string;
  country_code: string;
  country: string;
  country_id: string;
  population: number;
  postcodes: string[];
  admin1: string;
  admin2: string;
  admin3: string;
  admin4: string;
  admin1_id: string;
  admin2_id: string;
  admin3_id: string;
  admin4_id: string;
};

// Subject to const parameters set for api in ../Consts.ts
export type WeatherApiForecast = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    is_day: string;
    weather_code: string;
  };
  current: {
    time: number;
    interval: number;
    temperature_2m: number;
    is_day: boolean;
    weather_code: number;
  };
  daily_units: {
    time: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
  };
  daily: {
    time: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};
