// Mock functions to generate test types when initially testing app.

import {GddTracker} from './Types';
import {
  Settings,
  GDDAlgorithm,
  UnitOfMeasure,
  BaseTemp,
  Location,
  StateManager,
} from './state/State';

const PERTH_LAT = -32.0494;
const PERTH_LONG = 115.9122;
const SYDNEY_LAT = -33.8688;
const SYDNEY_LONG = 151.2093;

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

export function defaultStateManager(): StateManager {
  function LogErrorCallbackNotSet(callbackName: string) {
    console.log(`Error - ${callbackName} not set`);
  }
  return {
    locations: [],
    gddTrackers: [],
    status: 'Initialised',
    refreshWeather: () => {
      LogErrorCallbackNotSet('refreshWeather');
    },
    addLocation: _ => {
      LogErrorCallbackNotSet('addLocation');
    },
    deleteLocationName: _ => {
      LogErrorCallbackNotSet('deleteLocationName');
    },
    addGddTracker: _ => LogErrorCallbackNotSet('addGddTracker'),
    deleteGddTrackerName: _ => LogErrorCallbackNotSet('deleteGddTrackerName'),
    resetGddTrackerName: _ => LogErrorCallbackNotSet('resetGddTrackerName'),
  };
}

export function mockLocations(): Location[] {
  return [
    {
      latitude: PERTH_LAT,
      longitude: PERTH_LONG,
      name: 'Perth',
      weather: undefined,
    },
    {
      latitude: SYDNEY_LAT,
      longitude: SYDNEY_LONG,
      name: 'Sydney',
      weather: undefined,
    },
  ];
}

export function mockGddTrackers(): GddTracker[] {
  return [
    {
      location_name: 'Perth',
      description: 'Both Lawns',
      name: 'Buffalo',
      start_date_unix_ms: new Date('2024-3-1').valueOf(),
      target_gdd: 250,
      base_temp: 0,
    },
    {
      location_name: 'Perth',
      description: 'Front lawn PGR',
      name: 'Bermuda',
      start_date_unix_ms: new Date('2024-2-28').valueOf(),
      target_gdd: 100,
      base_temp: 0,
    },
    {
      location_name: 'Perth',
      description: 'Front lawn PGR',
      name: 'Bermuda2',
      start_date_unix_ms: new Date('2024-2-28').valueOf(),
      target_gdd: 50,
      base_temp: 0,
    },
    {
      location_name: 'Perth',
      description: 'Front lawn PGR',
      name: 'Bermuda3',
      start_date_unix_ms: new Date('2024-3-3').valueOf(),
      target_gdd: 240,
      base_temp: 0,
    },
  ];
}
