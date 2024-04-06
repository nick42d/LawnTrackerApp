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
  unitOfMeasure: UnitOfMeasure,
): Weather {
  const weather_array: WeatherAppDay[] = apiWeather.daily.time.map((t, i) => ({
    date_unix: t,
    weather_type: t > apiWeather.current.time ? 'Forecasted' : 'Historical',
    maxtemp: apiWeather.daily.temperature_2m_max[i],
    mintemp: apiWeather.daily.temperature_2m_min[i],
  }));
  return {
    current_condition: {
      code: apiWeather.current.weather_code,
      isDay: apiWeather.current.is_day,
      temp: apiWeather.current.temperature_2m,
    },
    weather_array,
    temperature_unit: unitOfMeasure,
  };
}

export function apiLocationsToAppLocations(apiLocations: WeatherApiLocations) {
  return {
    locations: apiLocations.results.map(x => apiLocationToAppLocation(x)),
  };
}
function apiLocationToAppLocation(
  apiLocation: WeatherApiLocation,
): WeatherAppLocation {
  return {
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
export function checkWeatherInvariants(weather: Weather) {
  weather.weather_array.reduce<WeatherInvariantCheck>(
    (acc, e) => {
      if (acc.status === 'Failed')
        return {
          status: 'Failed',
          lastDate: acc.lastDate,
        };
      if (acc.status === 'Initial' || acc.lastDate === undefined)
        return {status: 'Ok', lastDate: e.date_unix};
      const prevDate = new Date(acc.lastDate);
      const nextDate = new Date(e.date_unix);
      prevDate.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);
      if (nextDate > prevDate) {
        return {status: 'Ok', lastDate: prevDate.valueOf()};
      } else {
        return {status: 'Failed', lastDate: prevDate.valueOf()};
      }
    },
    {status: 'Initial', lastDate: undefined},
  );
}
type WeatherInvariantCheck = {
  status: 'Initial' | 'Ok' | 'Failed';
  lastDate: number | undefined;
};

export function convertUnits(
  weather: Weather,
  newUnit: UnitOfMeasure,
): Weather {
  if (weather.temperature_unit === newUnit) return weather;
  const Converter =
    newUnit === 'Imperial' ? celsiustoFarenheit : farenheitToCelsius;
  const newWeatherArray: WeatherAppDay[] = weather.weather_array.map(w => ({
    maxtemp: Converter(w.maxtemp),
    mintemp: Converter(w.mintemp),
    weather_type: w.weather_type,
    date_unix: w.date_unix,
  }));
  return {
    current_condition: weather.current_condition,
    weather_array: [], // TODO
    temperature_unit: newUnit,
  };
}

// TODO: Add unit
export type Weather = {
  current_condition: WeatherAppCondition;
  weather_array: WeatherAppDay[];
  temperature_unit: UnitOfMeasure;
};

export type WeatherAppCondition = {
  code: number;
  temp: number;
  isDay: boolean;
};

export type WeatherAppDay = {
  date_unix: number;
  weather_type: 'Historical' | 'Forecasted';
  maxtemp: number;
  mintemp: number;
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
