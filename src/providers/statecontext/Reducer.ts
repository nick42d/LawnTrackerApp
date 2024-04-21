import {addWeatherArrayToLocations} from '../../api/Api';
import {
  editTracker,
  resetTracker,
  resumeTracker,
  stopTracker,
} from './Trackers';
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
    case 'EditTracker': {
      const newState = {...state};
      const idx = state.trackers.findIndex(t => t.uuid === action.trackerId);
      if (idx === -1) return newState;
      const oldTracker = state.trackers[idx];
      const newTracker = editTracker(oldTracker, action.editTracker);
      newState.trackers.splice(idx, 1, newTracker);
      return newState;
    }
    // Note - not all trackers can be reset, but more than just GDD trackers.
    case 'ResetTrackerId': {
      console.log(`Resetting GDD tracker id ${action.id}`);
      return {
        ...state,
        trackers: state.trackers.map(t =>
          t.uuid === action.id ? resetTracker(t) : t,
        ),
      };
    }
    case 'DeleteTrackerId': {
      console.log(`Deleting tracker id ${action.id}`);
      return {
        ...state,
        trackers: state.trackers.filter(item => item.uuid !== action.id),
      };
    }
    case 'StopTrackerId': {
      console.log(`Stopping tracker id ${action.id}`);
      return {
        ...state,
        trackers: state.trackers.map(t =>
          t.uuid === action.id ? stopTracker(t) : t,
        ),
      };
    }
    case 'ResumeTrackerId': {
      console.log(`Resuming tracker id ${action.id}`);
      return {
        ...state,
        trackers: state.trackers.map(t =>
          t.uuid === action.id ? resumeTracker(t) : t,
        ),
      };
    }
  }
}
