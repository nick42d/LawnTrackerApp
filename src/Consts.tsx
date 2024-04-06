// Hardcoded - TODO: Device specific
export const GRAPH_WIDTH = 300;
// Specific to weatherapi.com
export const MAX_HISTORY_DAYS = 30;
export const MAX_FORECAST_DAYS = 7;
// Harcoded - TODO: predictive
export const ESTIMATED_DAYS = 7;
// Openmeteo params
// API parameters for current day
export const API_WEATHER_CURRENT_PARAMS = [
  'is_day',
  'weather_code',
  'temperature_2m',
];
// API parameters for each day
export const API_WEATHER_DAILY_PARAMS = [
  'temperature_2m_max',
  'temperature_2m_min',
];
export const API_TIMEZONE = 'auto';
export const API_WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
export const API_LOCATIONS_URL =
  'https://geocoding-api.open-meteo.com/v1/search';
export const API_LOCATIONS_LANGUAGE = 'en';
// How often to run react-native-background-fetch - could differ between dev and prod
export const BACKGROUND_REFRESH_INTERVAL = 15;

export const DEFAULT_UNIT_OF_MEASURE = 'Metric';
