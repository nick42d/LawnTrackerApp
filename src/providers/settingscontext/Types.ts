import {ContextStatus} from '../Types';

export type SettingsState = {
  settings: Settings;
  status: ContextStatus;
  setSettings: ((settings: Settings) => void) | undefined;
};

export type Settings = {
  algorithm: GddAlgorithm;
  warning_threshold_perc: number;
  warning_threshold_days: number;
  unit_of_measure: UnitOfMeasure;
  auto_dark_mode: boolean;
  dark_mode_enabled: boolean;
  default_base_temp: GddBaseTemp;
  api_key: string | undefined;
};

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
