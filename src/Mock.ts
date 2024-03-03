// Mock functions to generate test types when initially testing app.

import {Settings, GDDAlgorithm, UnitOfMeasure, BaseTemp} from './state/State';

export function defaultSettings(): Settings {
  return {
    algorithm: GDDAlgorithm.VariantA,
    warning_threshold_perc: 0.8,
    unit_of_measure: UnitOfMeasure.Metric,
    auto_dark_mode: true,
    dark_mode_enabled: false,
    api_key: undefined,
    default_base_temp: BaseTemp.Ten,
  };
}
