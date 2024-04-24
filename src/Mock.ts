// Mock functions to generate test types when initially testing app.

import {
  Tracker,
  newCalendarTracker,
  newGddTracker,
  newTimedTracker,
} from './providers/statecontext/Trackers';
import {Settings} from './providers/settingscontext/Types';
import {StateManager} from './providers/statecontext/Types';
import {Location, newWeatherStatus} from './providers/statecontext/Locations';
import {API_UNIT_OF_MEASURE} from './Consts';
import {addDays} from 'date-fns';

const PERTH_LAT = -32.0494;
const PERTH_LONG = 115.9122;
const SYDNEY_LAT = -33.8688;
const SYDNEY_LONG = 151.2093;

export function defaultSettings(): Settings {
  return {
    algorithm: 'Variant A',
    warning_threshold_perc: 0.8,
    warning_threshold_days: 7,
    unit_of_measure: API_UNIT_OF_MEASURE,
    auto_dark_mode: true,
    dark_mode_enabled: false,
    default_base_temp: 10,
  };
}

export function LogErrorCallbackNotSet(callbackName: string) {
  console.log(`Error - ${callbackName} not set`);
}

export function defaultStateManager(): StateManager {
  return {
    locations: [],
    trackers: [],
    status: 'Initialised',
    refreshWeather: async () => {
      LogErrorCallbackNotSet('refreshWeather');
    },
    addLocation: async () => {
      LogErrorCallbackNotSet('addLocation');
    },
    clearAll: () => {
      LogErrorCallbackNotSet('clearAll');
    },
    deleteLocationId: _ => {
      LogErrorCallbackNotSet('deleteLocationID');
    },
    addTracker: _ => LogErrorCallbackNotSet('addTracker'),
    changeTracker: _ => LogErrorCallbackNotSet('changeTracker'),
    deleteTrackerId: _ => LogErrorCallbackNotSet('deleteTrackerId'),
    resetTrackerId: _ => LogErrorCallbackNotSet('resetTrackerId'),
    stopTrackerId: _ => LogErrorCallbackNotSet('stopTrackerId'),
    resumeTrackerId: _ => LogErrorCallbackNotSet('resumeTrackerId'),
    cancelSnoozeTrackerId: _ => LogErrorCallbackNotSet('cancelSnoozeTrackerId'),
  };
}

export function mockLocations(): Location[] {
  return [
    {
      latitude: PERTH_LAT,
      longitude: PERTH_LONG,
      name: 'Perth',
      apiId: -1,
      country: 'Australia',
      admin1: 'Western Australia',
      weather: undefined,
      weatherStatus: newWeatherStatus(),
    },
    {
      latitude: SYDNEY_LAT,
      longitude: SYDNEY_LONG,
      name: 'Sydney',
      apiId: -2,
      country: 'Australia',
      admin1: 'New South Wales',
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
      -1,
      250,
      0,
      addDays(new Date(), -7).valueOf(),
    ),
    newTimedTracker(
      'EcoWet',
      'Front Lawn',
      addDays(new Date(), -2).valueOf(),
      7,
    ),
    newCalendarTracker(
      'Acelepryn',
      'Both Lawns',
      addDays(new Date(), 30).valueOf(),
    ),
  ];
}
