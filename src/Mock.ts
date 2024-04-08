// Mock functions to generate test types when initially testing app.

import {
  GddTracker,
  Tracker,
  newCalendarTracker,
  newGddTracker,
  newTimedTracker,
} from './providers/statecontext/Trackers';
import {AddDays} from './Utils';
import {
  Settings,
  GDDAlgorithm,
  UnitOfMeasure,
  BaseTemp,
} from './providers/settingscontext/Types';
import {StateManager} from './providers/statecontext/Types';
import {Location, newWeatherStatus} from './providers/statecontext/Locations';
import {API_UNIT_OF_MEASURE} from './Consts';

const PERTH_LAT = -32.0494;
const PERTH_LONG = 115.9122;
const SYDNEY_LAT = -33.8688;
const SYDNEY_LONG = 151.2093;

export function defaultSettings(): Settings {
  return {
    algorithm: GDDAlgorithm.VariantA,
    warning_threshold_perc: 0.8,
    unit_of_measure: API_UNIT_OF_MEASURE,
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
    trackers: [],
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
    addTracker: _ => LogErrorCallbackNotSet('addTracker'),
    deleteTrackerName: _ => LogErrorCallbackNotSet('deleteTrackerName'),
    resetTrackerName: _ => LogErrorCallbackNotSet('resetTrackerName'),
    stopTrackerName: _ => LogErrorCallbackNotSet('stopTrackerName'),
    resumeTrackerName: _ => LogErrorCallbackNotSet('resumeTrackerName'),
  };
}

export function mockLocations(): Location[] {
  return [
    {
      latitude: PERTH_LAT,
      longitude: PERTH_LONG,
      name: 'Perth',
      weather: undefined,
      weatherStatus: newWeatherStatus(),
    },
    {
      latitude: SYDNEY_LAT,
      longitude: SYDNEY_LONG,
      name: 'Sydney',
      weather: undefined,
      weatherStatus: newWeatherStatus(),
    },
  ];
}

export function mockTrackers(): Tracker[] {
  return [
    newGddTracker(
      'Astro 120',
      'Back Lawn',
      'Perth',
      250,
      0,
      AddDays(new Date(), -7),
    ),
    newTimedTracker('EcoWet', 'Front Lawn', AddDays(new Date(), -2), 7),
    newCalendarTracker('Acelepryn', 'Both Lawns', AddDays(new Date(), 30)),
  ];
}
