import {ContextStatus} from '../Types';
import {AddTracker, Tracker} from './Trackers';
import {Location} from './Locations';
import {Weather} from './Locations';
import {WeatherUpdate} from '../../api/Api';

export type StateManager = {
  locations: Location[];
  trackers: Tracker[];
  status: ContextStatus;
  updateLocationsWeather: (update: WeatherUpdate[]) => void;
  refreshWeather: () => Promise<void>;
  addLocation: (loc: Location) => Promise<void>;
  deleteLocationId: (id: number) => void;
  addTracker: (tracker: AddTracker) => void;
  changeTracker: (editTracker: AddTracker, trackerId: string) => void;
  deleteTrackerId: (trackerId: string) => void;
  resetTrackerId: (trackerId: string) => void;
  stopTrackerId: (trackerId: string) => void;
  resumeTrackerId: (trackerId: string) => void;
  cancelSnoozeTrackerId: (trackerId: string) => void;
  clearAll: () => void;
};

export type StoredState = {
  trackers: Tracker[];
  locations: Location[];
};

/**
 * State Context Reducer types
 */
export type StateAction =
  | StateActionSetLoading
  | StateActionSetTransitioning
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
  | StateActionEditTracker
  | StateActionDeleteTrackerId
  | StateActionResetTrackerId
  | StateActionStopTrackerId
  | StateActionSnoozeTrackerId
  | StateActionCancelSnoozeTrackerId
  | StateActionResumeTrackerId;
export type FunctionlessStateContext = {
  locations: Location[];
  trackers: Tracker[];
  status: ContextStatus;
};
type StateActionSetLoading = {
  kind: 'SetLoading';
};
type StateActionSetTransitioning = {
  kind: 'SetTransitioning';
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
type StateActionEditTracker = {
  kind: 'EditTracker';
  editTracker: AddTracker;
  trackerId: string;
};
type StateActionDeleteTrackerId = {
  kind: 'DeleteTrackerId';
  id: string;
};
type StateActionResetTrackerId = {
  kind: 'ResetTrackerId';
  id: string;
};
type StateActionSnoozeTrackerId = {
  kind: 'SnoozeTrackerId';
  id: string;
};
type StateActionCancelSnoozeTrackerId = {
  kind: 'CancelSnoozeTrackerId';
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
