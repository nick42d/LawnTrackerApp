import { ContextStatus } from '../Types';

import { Tracker } from './Trackers';
import { Location } from './Locations';


export type StateManager = {
  locations: Location[];
  trackers: Tracker[];
  status: ContextStatus;
  refreshWeather: () => void;
  addLocation: (loc: Location) => void;
  deleteLocationName: (locName: string) => void;
  addTracker: (tracker: Tracker) => void;
  deleteTrackerName: (trackerName: string) => void;
  resetGddTrackerName: (trackerName: string) => void;
};


