// Hardcoded - TODO: Device specific
export const GRAPH_WIDTH = 300;
// How far we are happy to search weather in API.
export const MAX_HISTORY_DAYS = 30;
export const MAX_FORECAST_DAYS = 7;
// Days of estimate to produce past Target
export const EXTRA_ESTIMATE_DAYS = 3;
// For performance reasons, limit the maximum number of estimate days
export const MAX_ESTIMATE_DAYS = 50;
/**
 * Openmeteo API parameters for current day
 */
export const API_WEATHER_CURRENT_PARAMS = [
  'is_day',
  'weather_code',
  'temperature_2m',
];
/**
 * Openmeteo API parameters for each day
 */
export const API_WEATHER_DAILY_PARAMS = [
  'temperature_2m_max',
  'temperature_2m_min',
];
export const API_TIMEZONE = 'auto';
export const API_WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
export const API_LOCATIONS_URL =
  'https://geocoding-api.open-meteo.com/v1/search';
// Currently hardcoded.
export const API_LOCATIONS_LANGUAGE = 'en';
// Currently API will only fetch in metric as the only place this may need to be converted is the locatiosn card (single conversion per location).
export const API_UNIT_OF_MEASURE = 'Metric';
// How often to run react-native-background-fetch
// In minutes
export const BACKGROUND_REFRESH_INTERVAL = 12 * 60;
// Currently harcoded
export const DATE_PICKER_LOCALE = 'en-GB';