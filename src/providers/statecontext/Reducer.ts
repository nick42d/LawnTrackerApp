import {fetchWeather, addWeatherToLocation} from '../../Api';
import {
  MAX_HISTORY_DAYS,
  MAX_FORECAST_DAYS,
  API_UNIT_OF_MEASURE,
} from '../../Consts';
import {ContextStatus} from '../Types';
import {StateContextError} from './Error';
import {Location} from './Locations';
import {Tracker, resetTracker, resumeTracker, stopTracker} from './Trackers';

export type FunctionlessStateContext = {
  locations: Location[];
  trackers: Tracker[];
  status: ContextStatus;
};
type StateActionSetLoading = {
  kind: 'SetLoading';
};
type StateActionSetLoaded = {
  kind: 'SetLoaded';
};
type StateActionSetWeatherRefreshing = {
  kind: 'SetWeatherRefreshing';
};
type StateActionSetWeatherLoaded = {
  kind: 'SetWeatherLoaded';
  timeUnixMs: number;
};
type StateActionClearAll = {
  kind: 'ClearAll';
};
type StateActionReplaceLocations = {
  kind: 'ReplaceLocations';
  locations: Location[];
};
type StateActionAddLocation = {
  kind: 'AddLocation';
  location: Location;
};
type StateActionDeleteLocationName = {
  kind: 'DeleteLocationName';
  name: string;
};
type StateActionReplaceTrackers = {
  kind: 'ReplaceTrackers';
  trackers: Tracker[];
};
type StateActionAddTracker = {
  kind: 'AddTracker';
  tracker: Tracker;
};
type StateActionDeleteTrackerName = {
  kind: 'DeleteTrackerName';
  name: string;
};
type StateActionResetTrackerName = {
  kind: 'ResetTrackerName';
  name: string;
};
type StateActionStopTrackerName = {
  kind: 'StopTrackerName';
  name: string;
};
type StateActionResumeTrackerName = {
  kind: 'ResumeTrackerName';
  name: string;
};
export type StateAction =
  | StateActionSetLoading
  | StateActionSetLoaded
  | StateActionSetWeatherRefreshing
  | StateActionSetWeatherLoaded
  | StateActionClearAll
  | StateActionDeleteLocationName
  | StateActionReplaceLocations
  | StateActionAddLocation
  | StateActionReplaceTrackers
  | StateActionAddTracker
  | StateActionDeleteTrackerName
  | StateActionResetTrackerName
  | StateActionResetTrackerName
  | StateActionStopTrackerName
  | StateActionResumeTrackerName;
export function reducer(
  state: FunctionlessStateContext,
  action: StateAction,
): FunctionlessStateContext {
  switch (action.kind) {
    case 'SetLoaded':
      return {...state, status: 'Loaded'};
    case 'SetLoading':
      return {...state, status: 'Loading'};
    case 'SetWeatherRefreshing': {
      return {
        ...state,
        locations: state.locations.map(l => ({
          ...l,
          weatherStatus: {...l.weatherStatus, status: 'Refreshing'},
        })),
      };
    }
    case 'SetWeatherLoaded': {
      return {
        ...state,
        locations: state.locations.map(l => ({
          ...l,
          weatherStatus: {
            lastRefreshedUnixMs: action.timeUnixMs,
            status: 'Loaded',
          },
        })),
      };
    }
    case 'ClearAll':
      return {...state, locations: [], trackers: []};
    case 'AddLocation':
      return {...state, locations: [...state.locations, action.location]};
    case 'ReplaceLocations':
      return {...state, locations: action.locations};
    case 'DeleteLocationName': {
      console.log(`Attempting to delete location name ${action.name}`);
      // Can't delete a location if it's used in a GDD Tracker.
      if (
        state.trackers.find(t => {
          t.kind === 'gdd' && t.location_name === action.name;
        }) !== undefined
      ) {
        console.log(`Unable to delete location as used in an existing tracker`);
        throw new StateContextError({
          name: 'DELETE_LOCATIONS_ERROR',
          message: 'Error deleting location as is used in a current tracker',
        });
      }
      return {
        ...state,
        locations: state.locations.filter(item => item.name !== action.name),
      };
    }
    case 'ReplaceTrackers':
      return {...state, trackers: action.trackers};
    case 'AddTracker':
      return {...state, trackers: [...state.trackers, action.tracker]};
    // Note - not all trackers can be reset, but more than just GDD trackers.
    case 'ResetTrackerName': {
      console.log(`Resetting GDD tracker name ${action.name}`);
      return {
        ...state,
        trackers: state.trackers.map(t =>
          t.name === action.name ? resetTracker(t) : t,
        ),
      };
    }
    case 'DeleteTrackerName': {
      console.log(`Deleting tracker name ${action.name}`);
      return {
        ...state,
        trackers: state.trackers.filter(item => item.name !== action.name),
      };
    }
    case 'StopTrackerName': {
      console.log(`Stopping tracker name ${action.name}`);
      return {
        ...state,
        trackers: state.trackers.map(t =>
          t.name === action.name ? stopTracker(t) : t,
        ),
      };
    }
    case 'ResumeTrackerName': {
      console.log(`Resuming tracker name ${action.name}`);
      return {
        ...state,
        trackers: state.trackers.map(t =>
          t.name === action.name ? resumeTracker(t) : t,
        ),
      };
    }
  }
}
