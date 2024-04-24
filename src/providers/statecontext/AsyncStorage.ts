import AsyncStorage from '@react-native-async-storage/async-storage';
import {GDD_TRACKERS_STORAGE_KEY, LOCATIONS_STORAGE_KEY} from '../StateContext';
import {ContextStatus} from '../Types';
import {Location, LocationSchema} from './Locations';
import {Tracker, TrackerSchema} from './Trackers';
import {StoredState} from './Types';
import * as v from 'valibot';

export async function getStoredState(): Promise<StoredState | undefined> {
  return AsyncStorage.multiGet([
    LOCATIONS_STORAGE_KEY,
    GDD_TRACKERS_STORAGE_KEY,
  ]).then(x => {
    const containsLoc = x.find(y => y[0] === LOCATIONS_STORAGE_KEY);
    const containsTrackers = x.find(y => y[0] === GDD_TRACKERS_STORAGE_KEY);
    if (
      containsLoc !== undefined &&
      containsLoc[1] !== null &&
      containsTrackers !== undefined &&
      containsTrackers[1] !== null
    ) {
      console.log('Loading app state from device');
      try {
        const locations: Location[] = v.parse(
          v.array(LocationSchema),
          JSON.parse(containsLoc[1]),
        );
        const trackers: Tracker[] = v.parse(
          v.array(TrackerSchema),
          JSON.parse(containsTrackers[1]),
        );
        return {
          trackers,
          locations,
        };
      } catch (e) {
        console.warn('Error parsing stored state: ', e);
        return undefined;
      }
    } else {
      console.warn('Missing some App state on device - using defaults');
      console.log('ContainsLoc: ' + JSON.stringify(containsLoc));
      console.log('ContainsTrackers: ' + JSON.stringify(containsTrackers));
      return undefined;
    }
  });
}

export function writeTrackers(trackers: Tracker[]) {
  console.log('Writing app state - trackers');
  AsyncStorage.setItem(GDD_TRACKERS_STORAGE_KEY, JSON.stringify(trackers))
    .then(() => console.log('Wrote trackers'))
    .catch(() => console.log('Error writing trackers'));
}

export function writeLocations(locations: Location[]) {
  console.log('Writing app state - locations');
  AsyncStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(locations))
    .then(() => console.log('Wrote locations'))
    .catch(() => console.log('Error writing locations'));
}
