import { UnitOfMeasure } from './state/State';

export function newGddTracker(
  name: string,
  description: string,
  location_name: string,
  target_gdd: number,
  base_temp: number,
  start_date: Date,
): GddTracker {
  return {
    kind: 'gdd',
    location_name,
    description,
    name,
    target_gdd,
    base_temp,
    start_date_unix_ms: start_date.valueOf(),
  };
}

export function newCalendarTracker(
  name: string,
  description: string,
  target_date: Date,
): CalendarTracker {
  return {
    kind: 'calendar',
    description,
    name,
    target_date_unix_ms: target_date.valueOf(),
  };
}

export function newTimedTracker(
  name: string,
  description: string,
  start_date: Date,
  duration_days: number,
): TimedTracker {
  return {
    kind: 'timed',
    description,
    name,
    start_date_unix_ms: start_date.valueOf(),
    duration_days,
  };
}

export type Tracker = GddTracker | TimedTracker | CalendarTracker;

export type CalendarTracker = {
  kind: 'calendar';
  name: string;
  description: string;
  target_date_unix_ms: number;
};
export type TimedTracker = {
  kind: 'timed';
  name: string;
  description: string;
  start_date_unix_ms: number;
  duration_days: number;
};

export type GddTracker = {
  kind: 'gdd';
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
