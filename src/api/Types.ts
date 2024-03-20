import {API_TEMPERATURE_UNIT} from '../Consts';

export function apiWeatherToAppWeather(
  apiWeather: WeatherApiForecast,
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
    temperature_unit: API_TEMPERATURE_UNIT,
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

// TODO: Add unit
export type Weather = {
  current_condition: WeatherAppCondition;
  weather_array: WeatherAppDay[];
  temperature_unit: 'Celsius' | 'Farenheit';
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
