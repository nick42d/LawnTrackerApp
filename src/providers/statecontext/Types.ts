import {ContextStatus} from '../Types';
import {Tracker} from './Trackers';
import {Location} from './Locations';
import {Weather} from '../../api/Types';

export type StateManager = {
  locations: Location[];
  trackers: Tracker[];
  status: ContextStatus;
  refreshWeather: () => Promise<void>;
  addLocation: (loc: Location) => Promise<void>;
  deleteLocationId: (id: number) => void;
  addTracker: (tracker: Tracker) => void;
  deleteTrackerName: (trackerName: string) => void;
  resetTrackerName: (trackerName: string) => void;
  stopTrackerName: (trackerName: string) => void;
  resumeTrackerName: (trackerName: string) => void;
  clearAll: () => void;
};

/**
 * State Context Reducer types
 */
export type StateAction =
  | StateActionSetLoading
  | StateActionSetLoaded
  | StateActionSetWeatherRefreshing
  | StateActionSetWeatherLocationRefreshing
  | StateActionClearAll
  | StateActionDeleteLocationId
  | StateActionReplaceLocations
  | StateActionAddRefreshedWeatherArray
  | StateActionAddLocation
  | StateActionReplaceTrackers
  | StateActionAddTracker
  | StateActionDeleteTrackerId
  | StateActionResetTrackerId
  | StateActionStopTrackerId
  | StateActionResumeTrackerId;
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
type StateActionSetWeatherLocationRefreshing = {
  kind: 'SetWeatherLocationRefreshing';
  locationId: number;
};
type StateActionClearAll = {
  kind: 'ClearAll';
};
type StateActionReplaceLocations = {
  kind: 'ReplaceLocations';
  locations: Location[];
};
type StateActionAddRefreshedWeatherArray = {
  kind: 'AddRefreshedWeatherArray';
  weather: {weather: Weather | void; locationId: number}[];
  timeUnixMs: number;
};
type StateActionAddLocation = {
  kind: 'AddLocation';
  location: Location;
};
type StateActionDeleteLocationId = {
  kind: 'DeleteLocationId';
  id: number;
};
type StateActionReplaceTrackers = {
  kind: 'ReplaceTrackers';
  trackers: Tracker[];
};
type StateActionAddTracker = {
  kind: 'AddTracker';
  tracker: Tracker;
};
type StateActionDeleteTrackerId = {
  kind: 'DeleteTrackerId';
  id: string;
};
type StateActionResetTrackerId = {
  kind: 'ResetTrackerId';
  id: string;
};
type StateActionStopTrackerId = {
  kind: 'StopTrackerId';
  id: string;
};
type StateActionResumeTrackerId = {
  kind: 'ResumeTrackerId';
  id: string;
};
