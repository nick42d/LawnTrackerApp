import AsyncStorage from '@react-native-async-storage/async-storage';
import {GDD_TRACKERS_STORAGE_KEY, LOCATIONS_STORAGE_KEY} from '../StateContext';
import { ContextStatus } from '../Types';
import { Location } from './Locations';
import { GddTracker, Tracker } from './Trackers';
import {initBackgroundFetch} from './BackgroundFetch';

type StoredState = {
  trackers: Tracker[];
  locations: Location[];
};

export async function GetStoredState(): Promise<StoredState | undefined> {
  return AsyncStorage.multiGet([
    LOCATIONS_STORAGE_KEY,
    GDD_TRACKERS_STORAGE_KEY,
  ]).then(x => {
    const containsLoc = x.find(y => y[0] === LOCATIONS_STORAGE_KEY);
    const containsGddTrackers = x.find(y => y[0] === GDD_TRACKERS_STORAGE_KEY);
    if (
      containsLoc !== undefined &&
      containsLoc[1] !== null &&
      containsGddTrackers !== undefined &&
      containsGddTrackers[1] !== null
    ) {
      console.log('Loading app state from device');
      return (
        // NOTE: Parse could fail if someone else writes to these keys!
        {
          trackers: JSON.parse(containsGddTrackers[1]),
          locations: JSON.parse(containsLoc[1]),
        }
      );
    } else {
      console.warn('Missing some App state on device - using defaults');
      return undefined;
    }
  });
}

export function onChangeGddTrackers(
  status: ContextStatus,
  trackers: Tracker[],
) {
  let active = true;
  console.log('App state changed - trackers');
  if (status === 'Loaded') {
    console.log('Setting app state - trackers');
    AsyncStorage.setItem(GDD_TRACKERS_STORAGE_KEY, JSON.stringify(trackers))
      .then(() =>
        !active
          ? console.error(
              'Destructor called on effect before write trackers finished',
            )
          : console.log('Trackers set'),
      )
      .catch(() => console.log('Error setting trackers'));
  } else {
    console.log('Not syncing app state as not Loaded - trackers');
  }
  return () => {
    active = false;
    console.log('Cleaning up app state effect - trackers');
  };
}

export function OnChangeLocations(
  status: ContextStatus,
  locations: Location[],
) {
  let active = true;
  console.log('App state changed - locations');
  if (status === 'Loaded') {
    console.log('Setting app state - locations');
    AsyncStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(locations))
      .then(() =>
        !active
          ? console.error(
              'Destructor called on effect before write locations finished',
            )
          : console.log('Locations set'),
      )
      .catch(() => console.log('Error setting locations'));
  } else {
    console.log('Not syncing app state as not Loaded - locations');
  }
  return () => {
    active = false;
    console.log('Cleaning up app state effect - locations');
  };
}
