import {UNITS_OF_MEASURE, UnitOfMeasure} from '../settingscontext/Types';
import * as v from 'valibot';

// These types are valibot validated
// due to deserializing from AsyncStorage
export const WeatherAppConditionSchema = v.object(
  {
    code: v.number(),
    temp: v.number(),
    isDay: v.boolean(),
  },
  v.never(),
);
export const WeatherStatusSchema = v.object(
  {
    lastRefreshedUnixMs: v.optional(v.number()),
    status: v.picklist(['Initialised', 'Refreshing', 'Loaded', 'Error']),
  },
  v.never(),
);
export const WeatherAppDaySchema = v.object(
  {
    dateUnixMs: v.number(),
    weatherType: v.picklist(['Historical', 'Forecasted']),
    maxTemp: v.number(),
    minTemp: v.number(),
  },
  v.never(),
);
export const WeatherSchema = v.object(
  {
    currentCondition: WeatherAppConditionSchema,
    weatherArray: v.array(WeatherAppDaySchema),
    temperatureUnit: v.picklist(UNITS_OF_MEASURE),
  },
  v.never(),
);
export const LocationSchema = v.object(
  {
    name: v.string(),
    apiId: v.number(),
    country: v.string(),
    /// Top level administrative division - e.g Western Australia
    admin1: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    weather: v.optional(WeatherSchema),
    weatherStatus: WeatherStatusSchema,
  },
  v.never(),
);
export type WeatherAppDay = v.Output<typeof WeatherAppDaySchema>;
export type WeatherStatus = v.Output<typeof WeatherStatusSchema>;
export type Weather = v.Output<typeof WeatherSchema>;
export type WeatherAppCondition = v.Output<typeof WeatherAppConditionSchema>;
export type Location = v.Output<typeof LocationSchema>;
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
