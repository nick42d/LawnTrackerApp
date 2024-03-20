import {UnitOfMeasure} from './state/State';

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
    start_date_unix_ms: start_date.valueOf(),
  };
  return ret;
}

export type GddTracker = {
  name: string;
  description: string;
  target_gdd: number;
  base_temp: number;
  start_date_unix_ms: number;
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
