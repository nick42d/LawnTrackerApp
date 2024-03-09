import {
  UnitOfMeasure,
  WeatherAppCurrent,
  WeatherAppForecast,
  WeatherAppHistory,
  WeatherCondition,
} from './state/State';

// Dummying up Ids currently...
export function newGddTracker(
  name: string,
  description: string,
  location_name: string,
  target_gdd: number,
  base_temp: number,
  start_date: Date,
): GddTracker {
  const ret: GddTracker = {
    location_name,
    description,
    name,
    target_gdd,
    base_temp,
    start_date_unix: start_date.valueOf(),
  };
  return ret;
}

// TODO: Change to unix date
export type GddTracker = {
  name: string;
  description: string;
  target_gdd: number;
  base_temp: number;
  start_date_unix: number;
  location_name: string;
};

export type DailyWeatherStat = {
  result: number | undefined;
  // Date class as number
  date_unix: number;
  stat_type: WeatherStatType | undefined;
  unit_of_measure: UnitOfMeasure;
};

export enum WeatherStatType {
  Historical,
  Forecast,
  Projection,
}

export type dayGddStat = {
  gdd: number;
  date: Date;
};

function apiForecastDayToAppCondition(
  day: WeatherApiForecastDay,
): WeatherCondition {
  return {
    code: day.day.condition.code,
    description: day.day.condition.text,
    icon_url: day.day.condition.icon,
  };
}

export function apiHistoryToAppHistory(
  api: WeatherApiHistory,
): WeatherAppHistory | void {
  const len = api.forecast.forecastday.length;
  if (len === 0) return;
  return {
    historical: api.forecast.forecastday.map(day => ({
      date_unix: day.date_epoch,
      maxtemp_c: day.day.maxtemp_c,
      mintemp_c: day.day.mintemp_c,
    })),
    // Safe index - guarded above
    current: apiForecastDayToAppCondition(api.forecast.forecastday[len - 1]),
  };
}

export function apiHistoryToAppForecast(
  api: WeatherApiHistory,
): WeatherAppForecast[] {
  return api.forecast.forecastday.map(day => ({
    date_unix: day.date_epoch,
    maxtemp_c: day.day.maxtemp_c,
    mintemp_c: day.day.mintemp_c,
  }));
}
export function apiCurrentToAppCurrent(
  api: WeatherApiCurrent,
): WeatherAppCurrent {
  return {location_name: api.location.name};
}

export type WeatherApiHistory = {
  location: WeatherApiLocation;
  forecast: WeatherApiForecast;
};

export type WeatherApiLocation = {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  tz_id: string;
  localtime_epoch: number;
  localtime: string;
};

export type WeatherApiForecast = {
  forecastday: WeatherApiForecastDay[];
};
export type WeatherApiForecastDay = {
  date: string;
  date_epoch: number;
  day: WeatherApiDay;
  astro: WeatherApiAstro;
  hour: WeatherApiHour[];
};
export type WeatherApiDay = {
  maxtemp_c: number;
  maxtemp_f: number;
  mintemp_c: number;
  mintemp_f: number;
  avgtemp_c: number;
  avgtemp_f: number;
  maxwind_mph: number;
  maxwind_kph: number;
  totalprecip_mm: number;
  totalprecip_in: number;
  avgvis_km: number;
  avgvis_miles: number;
  avghumidity: number;
  daily_will_it_rain: number;
  daily_chance_of_rain: number;
  daily_will_it_snow: number;
  daily_chance_of_snow: number;
  condition: WeatherApiCondition;
  uv: number;
};
export type WeatherApiAstro = {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moon_phase: string;
  moon_illumination: string;
};
export type WeatherApiHour = {
  time_epoch: number;
  time: string;
  temp_c: number;
  temp_f: number;
  is_day: number;
  condition: WeatherApiCondition;
  wind_mph: number;
  wind_kph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  pressure_in: number;
  precip_mm: number;
  precip_in: number;
  humidity: number;
  cloud: number;
  feelslike_c: number;
  feelslike_f: number;
  windchill_c: number;
  windchill_f: number;
  heatindex_c: number;
  heatindex_f: number;
  dewpoint_c: number;
  dewpoint_f: number;
  will_it_rain: number;
  chance_of_rain: number;
  will_it_snow: number;
  chance_of_snow: number;
  vis_km: number;
  vis_miles: number;
  gust_mph: number;
  gust_kph: number;
  uv: number;
};

export type WeatherApiCurrent = {
  location: WeatherApiLocation;
  current: WeatherApiCurrentWeather;
};
export type WeatherApiCurrentWeather = Omit<
  WeatherApiHour,
  | 'time_epoch'
  | 'time'
  | 'windchill_c'
  | 'windchill_f'
  | 'heatindex_c'
  | 'heatindex_f'
  | 'dewpoint_c'
  | 'dewpoint_f'
  | 'feels_like_snow'
  | 'will_it_snow'
  | 'feels_like_rain'
  | 'will_it_rain'
>;

export type WeatherApiCondition = {
  text: string;
  icon: string;
  code: number;
};
