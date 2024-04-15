import AsyncStorage from '@react-native-async-storage/async-storage';
import {GDD_TRACKERS_STORAGE_KEY, LOCATIONS_STORAGE_KEY} from '../StateContext';
import {ContextStatus} from '../Types';
import {Location} from './Locations';
import {GddTracker, Tracker} from './Trackers';

export type StoredState = {
  trackers: Tracker[];
  locations: Location[];
};

export async function GetStoredState(): Promise<StoredState | undefined> {
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
        // Assuming this is type safe
        const trackers: Tracker[] = JSON.parse(containsTrackers[1]);
        const locations: Location[] = JSON.parse(containsLoc[1]);
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

export function onChangeGddTrackers(
  status: ContextStatus,
  trackers: Tracker[],
) {
  console.log('App context status is: ' + status);
  if (status === 'Loaded') {
    console.log('Setting app state - trackers');
    AsyncStorage.setItem(GDD_TRACKERS_STORAGE_KEY, JSON.stringify(trackers))
      .then(() => console.log('Trackers set'))
      .catch(() => console.log('Error setting trackers'));
  } else {
    console.log('Not syncing app state as not Loaded - trackers');
  }
}

export function OnChangeLocations(
  status: ContextStatus,
  locations: Location[],
) {
  console.log('App context status is: ' + status);
  let active = true;
  if (status === 'Loaded') {
    console.log('Setting app state - locations');
    AsyncStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(locations))
      .then(() => console.log('Locations set'))
      .catch(() => console.log('Error setting locations'));
  } else {
    console.log('Not syncing app state as not Loaded - locations');
  }
}
