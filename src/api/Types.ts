import {format, startOfDay} from 'date-fns';
import {celsiustoFarenheit, farenheitToCelsius} from '../Knowledge';
import {UnitOfMeasure} from '../providers/settingscontext/Types';
import {Weather, WeatherAppDay} from '../providers/statecontext/Locations';
import * as v from 'valibot';

export const API_TEMPERATURE_UNITS = ['celsius', 'farenheit'] as const;
export const WeatherApiLocationSchema = v.object({
  /// Unique ID for this location from API.
  id: v.number(),
  name: v.string(),
  latitude: v.number(),
  longitude: v.number(),
  elevation: v.number(),
  timezone: v.string(),
  feature_code: v.string(),
  country_code: v.string(),
  country: v.string(),
  country_id: v.string(),
  population: v.number(),
  postcodes: v.array(v.string()),
  /// Top level administrative division - e.g Western Australia
  admin1: v.string(),
  admin2: v.string(),
  admin3: v.string(),
  admin4: v.string(),
  admin1_id: v.string(),
  admin2_id: v.string(),
  admin3_id: v.string(),
  admin4_id: v.string(),
});
export const WeatherApiLocationsSchema = v.object({
  results: v.array(WeatherApiLocationSchema),
});
// Subject to const parameters set for api in ../Consts.ts
export const WeatherApiForecastSchema = v.object({
  latitude: v.number(),
  longitude: v.number(),
  generationtime_ms: v.number(),
  utc_offset_seconds: v.number(),
  timezone: v.string(),
  timezone_abbreviation: v.string(),
  elevation: v.number(),
  current_units: v.object({
    time: v.string(),
    interval: v.string(),
    temperature_2m: v.string(),
    is_day: v.string(),
    weather_code: v.string(),
  }),
  current: v.object({
    time: v.number(),
    interval: v.number(),
    temperature_2m: v.number(),
    // Transform binary to boolean on validation
    is_day: v.transform(v.picklist([0, 1]), input => input === 1),
    weather_code: v.number(),
  }),
  daily_units: v.object({
    time: v.string(),
    temperature_2m_max: v.string(),
    temperature_2m_min: v.string(),
  }),
  daily: v.object({
    time: v.array(v.number()),
    temperature_2m_max: v.array(v.number()),
    temperature_2m_min: v.array(v.number()),
  }),
});
export type WeatherApiForecast = v.Output<typeof WeatherApiForecastSchema>;
export type WeatherApiLocation = v.Output<typeof WeatherApiLocationSchema>;
export type WeatherApiLocations = v.Output<typeof WeatherApiLocationsSchema>;
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
  const curDay = startOfDay(apiWeather.current.time * 1000);
  const weatherArray: WeatherAppDay[] = apiWeather.daily.time.map((t, i) => {
    const thisDay = startOfDay(t * 1000);
    return {
      dateUnixMs: thisDay.valueOf(),
      weatherType: thisDay >= curDay ? 'Forecasted' : 'Historical',
      maxTemp: apiWeather.daily.temperature_2m_max[i],
      minTemp: apiWeather.daily.temperature_2m_min[i],
    };
  });
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
