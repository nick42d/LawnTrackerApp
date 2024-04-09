import {ContextStatus} from '../Types';
import {Tracker} from './Trackers';
import {Location} from './Locations';

export type StateManager = {
  locations: Location[];
  trackers: Tracker[];
  status: ContextStatus;
  refreshWeather: () => Promise<void>;
  addLocation: (loc: Location) => void;
  deleteLocationId: (id: number) => void;
  addTracker: (tracker: Tracker) => void;
  deleteTrackerName: (trackerName: string) => void;
  resetTrackerName: (trackerName: string) => void;
  stopTrackerName: (trackerName: string) => void;
  resumeTrackerName: (trackerName: string) => void;
  clearAll: () => void;
};
