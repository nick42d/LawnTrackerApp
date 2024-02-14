export type GddTracker = {
  name: string;
  description: string;
  target_gdd: number;
  base_temp: number;
  start_date: Date;
  // TODO: Location library
  location: string;
  // Temporary value to mock current GDD
  // Replace with: Calculation of GDD given weather stats from API
  // Or cache of the same
  temp_cur_gdd: number;
  id: number;
};

export type WeatherAppHistory = {
  location: string;
  forecasts: WeatherAppForecast[];
};

export type WeatherAppForecast = {
  date: Date;
  maxtemp_c: number;
  mintemp_c: number;
};

export function apiHistoryToAppHistory(
  api: WeatherApiHistory,
): WeatherAppHistory {
  return {
    location: api.location.name,
    forecasts: api.forecast.forecastday.map(day => ({
      date: new Date(day.date),
      maxtemp_c: day.day.maxtemp_c,
      mintemp_c: day.day.mintemp_c,
    })),
  };
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

export type WeatherApiCondition = {
  text: string;
  icon: string;
  code: number;
};
