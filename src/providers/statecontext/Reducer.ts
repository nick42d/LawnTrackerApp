import {addWeatherArrayToLocations} from '../../Api';
import {resetTracker, resumeTracker, stopTracker} from './Trackers';
import {FunctionlessStateContext, StateAction} from './Types';

export function reducer(
  state: FunctionlessStateContext,
  action: StateAction,
): FunctionlessStateContext {
  console.log('State Context reducer call: ', action.kind);
  switch (action.kind) {
    case 'SetLoaded':
      return {...state, status: 'Loaded'};
    case 'SetLoading':
      return {...state, status: 'Loading'};
    case 'SetWeatherLocationRefreshing': {
      return {
        ...state,
        locations: state.locations.map(l => {
          if (l.apiId !== action.locationId) return l;
          return {
            ...l,
            weatherStatus: {...l.weatherStatus, status: 'Refreshing'},
          };
        }),
      };
    }
    case 'SetWeatherRefreshing': {
      return {
        ...state,
        locations: state.locations.map(l => ({
          ...l,
          weatherStatus: {...l.weatherStatus, status: 'Refreshing'},
        })),
      };
    }
    case 'AddRefreshedWeatherArray': {
      const refreshedLocations = addWeatherArrayToLocations(
        state.locations,
        action.weather,
      );
      return {
        ...state,
        locations: refreshedLocations.map(l => ({
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
    case 'DeleteLocationId': {
      return {
        ...state,
        locations: state.locations.filter(item => item.apiId !== action.id),
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
