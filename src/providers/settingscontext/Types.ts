import {ContextStatus} from '../Types';

export type SettingsState = {
  settings: Settings;
  status: ContextStatus;
  setSettings: ((settings: Settings) => void) | undefined;
};

export type Settings = {
  algorithm: GDDAlgorithm;
  warning_threshold_perc: number;
  unit_of_measure: UnitOfMeasure;
  auto_dark_mode: boolean;
  dark_mode_enabled: boolean;
  default_base_temp: BaseTemp;
  api_key: string | undefined;
};

export enum GDDAlgorithm {
  // As per wikipedia definitions: https://en.wikipedia.org/wiki/Growing_degree-day
  VariantA,
  VariantB,
}

export function gddAlgorithmToText(algorithm: GDDAlgorithm) {
  switch (algorithm) {
    case GDDAlgorithm.VariantA: {
      return 'Variant A';
    }
    case GDDAlgorithm.VariantB: {
      return 'Variant B';
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
export enum BaseTemp {
  Zero = 0,
  Ten = 10,
}
