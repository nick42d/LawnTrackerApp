import {UNITS_OF_MEASURE, UnitOfMeasure} from '../settingscontext/Types';
import * as v from 'valibot';

export const LOCATIONS_SCHEMA_VERSION = '0.1';
// These types are valibot validated
// due to deserializing from AsyncStorage
export const WeatherAppConditionSchema = v.strictObject({
    code: v.number(),
    temp: v.number(),
    isDay: v.boolean(),
  });
export const WeatherStatusSchema = v.strictObject({
    lastRefreshedUnixMs: v.optional(v.number()),
    status: v.picklist(['Initialised', 'Refreshing', 'Loaded', 'Error']),
  });
export const WeatherAppDaySchema = v.strictObject({
    dateUnixMs: v.number(),
    weatherType: v.picklist(['Historical', 'Forecasted']),
    maxTemp: v.number(),
    minTemp: v.number(),
  });
export const WeatherSchema = v.strictObject({
    currentCondition: WeatherAppConditionSchema,
    weatherArray: v.array(WeatherAppDaySchema),
    temperatureUnit: v.picklist(UNITS_OF_MEASURE),
  });
export const LocationSchema = v.strictObject({
    name: v.string(),
    apiId: v.number(),
    latitude: v.number(),
    longitude: v.number(),
    /// Top level administrative division - e.g Western Australia
    country: v.optional(v.string()),
    admin1: v.optional(v.string()),
    weather: v.optional(WeatherSchema),
    weatherStatus: WeatherStatusSchema,
  });
export const LocationsSchema = v.strictObject({
    apiVersion: v.literal(LOCATIONS_SCHEMA_VERSION),
    locations: v.array(LocationSchema),
  });
export type WeatherAppDay = v.InferOutput<typeof WeatherAppDaySchema>;
export type WeatherStatus = v.InferOutput<typeof WeatherStatusSchema>;
export type Weather = v.InferOutput<typeof WeatherSchema>;
export type WeatherAppCondition = v.InferOutput<typeof WeatherAppConditionSchema>;
export type Location = v.InferOutput<typeof LocationSchema>;
export type Locations = v.InferOutput<typeof LocationsSchema>;
/**
 * Helper type for adding a new location - it won't have weather yet.
 */
export type AddLocation = Omit<Location, 'weather' | 'weatherStatus'>;
export function newWeatherStatus(): WeatherStatus {
  return {lastRefreshedUnixMs: undefined, status: 'Initialised'};
}

export type LocationError =
  | TimeoutLocationError
  | MissingDaysLocationError
  | MissingLocationLocationError
  | MissingWeatherLocationError;

export type TimeoutLocationError = {
  kind: 'Timeout';
  message: string;
};

export type MissingDaysLocationError = {
  kind: 'MissingDays';
  message: string;
};

export type MissingLocationLocationError = {
  kind: 'MissingLocation';
  message: string;
};

export type MissingWeatherLocationError = {
  kind: 'MissingWeather';
  message: string;
};

export function prettyPrintLocation(l: Location) {
  if (l.country) return `${l.name}, ${l.country}`;
  return l.name;
}
