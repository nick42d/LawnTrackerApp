// Mock functions to generate test types when initially testing app.

import {PERTH_LAT, PERTH_LONG, SYDNEY_LAT, SYDNEY_LONG} from './Consts';
import {GddTracker} from './Types';
import {
  Settings,
  GDDAlgorithm,
  UnitOfMeasure,
  BaseTemp,
  Location,
} from './state/State';

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

export function mockLocations(): Location[] {
  return [
    {
      latitude: PERTH_LAT,
      longitude: PERTH_LONG,
      name: 'Perth',
      weather: {historical: undefined, today: undefined, forecast: undefined},
    },
    {
      latitude: SYDNEY_LAT,
      longitude: SYDNEY_LONG,
      name: 'Sydney',
      weather: {historical: undefined, today: undefined, forecast: undefined},
    },
  ];
}

export function mockGddTrackers(): GddTracker[] {
  return [
    {
      location_name: 'Perth',
      description: 'Both Lawns',
      name: 'Buffalo',
      start_date_unix: new Date('2024-3-1').valueOf(),
      target_gdd: 250,
      base_temp: 0,
    },
    {
      location_name: 'Perth',
      description: 'Front lawn PGR',
      name: 'Bermuda',
      start_date_unix: new Date('2024-2-28').valueOf(),
      target_gdd: 100,
      base_temp: 0,
    },
    {
      location_name: 'Perth',
      description: 'Front lawn PGR',
      name: 'Bermuda2',
      start_date_unix: new Date('2024-2-28').valueOf(),
      target_gdd: 50,
      base_temp: 0,
    },
    {
      location_name: 'Perth',
      description: 'Front lawn PGR',
      name: 'Bermuda3',
      start_date_unix: new Date('2024-3-3').valueOf(),
      target_gdd: 240,
      base_temp: 0,
    },
  ];
}
