import {API_UNIT_OF_MEASURE} from '../../Consts';
import {ContextStatus} from '../Types';
import * as v from 'valibot';

export const SETTINGS_SCHEMA_VERSION = '0.1';

export type SettingsState = {
  settings: Settings;
  status: ContextStatus;
  setSettings: (settings: Settings) => void;
};

export type Settings = v.Output<typeof SettingsSchema>;

export const GDD_ALGORITHMS = ['Variant A', 'Variant B'] as const;
/**
 * As per wikipedia definitions: https://en.wikipedia.org/wiki/Growing_degree-day
 */
export type GddAlgorithm = (typeof GDD_ALGORITHMS)[number];

export const GDD_BASE_TEMPS = [0, 10] as const;
export type GddBaseTemp = (typeof GDD_BASE_TEMPS)[number];
export function gddBaseTempToString(g: GddBaseTemp): string {
  switch (g) {
    case 0: {
      return 'Zero';
    }
    case 10: {
      return 'Ten';
    }
  }
}

export const UNITS_OF_MEASURE = ['Imperial', 'Metric'] as const;
export type UnitOfMeasure = (typeof UNITS_OF_MEASURE)[number];
export function isUnitOfMeasure(s: string): s is UnitOfMeasure {
  return UNITS_OF_MEASURE.find(u => u === s) !== undefined;
}
export function unitOfMeasureAbbreviate(u: UnitOfMeasure): string {
  switch (u) {
    case 'Imperial': {
      return 'F';
    }
    case 'Metric': {
      return 'C';
    }
  }
}
// Valibot validated type
export const SettingsSchema = v.object(
  {
    apiVersion: v.literal(SETTINGS_SCHEMA_VERSION),
    algorithm: v.picklist(GDD_ALGORITHMS),
    warning_threshold_perc: v.number(),
    warning_threshold_days: v.number(),
    unit_of_measure: v.picklist(UNITS_OF_MEASURE),
    auto_dark_mode: v.boolean(),
    dark_mode_enabled: v.boolean(),
    default_base_temp: v.picklist(GDD_BASE_TEMPS),
    earliestNotificationTime: v.object({
      hours: v.number(),
      minutes: v.number(),
    }),
    backgroundTaskIntervalHrs: v.number(),
  },
  v.never(),
);

export function defaultSettings(): Settings {
  return {
    apiVersion: SETTINGS_SCHEMA_VERSION,
    algorithm: 'Variant A',
    warning_threshold_perc: 0.8,
    warning_threshold_days: 7,
    unit_of_measure: API_UNIT_OF_MEASURE,
    auto_dark_mode: true,
    dark_mode_enabled: false,
    default_base_temp: 10,
    earliestNotificationTime: {hours: 6, minutes: 0},
    backgroundTaskIntervalHrs: 1,
  };
}
