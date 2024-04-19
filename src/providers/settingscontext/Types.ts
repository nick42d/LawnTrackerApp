import {ContextStatus} from '../Types';
import * as v from 'valibot';

export type SettingsState = {
  settings: Settings;
  status: ContextStatus;
  setSettings: (settings: Settings) => void;
};

export type Settings = {
  algorithm: GddAlgorithm;
  warning_threshold_perc: number;
  warning_threshold_days: number;
  unit_of_measure: UnitOfMeasure;
  auto_dark_mode: boolean;
  dark_mode_enabled: boolean;
  default_base_temp: GddBaseTemp;
};
// NOTE: This MUST be updated if Settings is updated
export function validateSettings(
  maybeSettings: unknown,
): maybeSettings is Settings {
  const SettingsSchema = v.object(
    {
      algorithm: v.picklist(GDD_ALGORITHMS),
      warning_threshold_perc: v.number(),
      warning_threshold_days: v.number(),
      unit_of_measure: v.picklist(UNITS_OF_MEASURE),
      auto_dark_mode: v.boolean(),
      dark_mode_enabled: v.boolean(),
      default_base_temp: v.picklist(GDD_BASE_TEMPS),
    },
    v.never(),
  );
  return v.is(SettingsSchema, maybeSettings);
}

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
