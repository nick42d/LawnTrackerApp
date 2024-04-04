import AsyncStorage from '@react-native-async-storage/async-storage';
import {GDD_TRACKERS_STORAGE_KEY, LOCATIONS_STORAGE_KEY} from '../StateContext';
import {ContextStatus, Location} from '../../state/State';
import {GddTracker} from '../../Types';
import {initBackgroundFetch} from './BackgroundFetch';

// On load, load up state and then refresh weather.
export function OnLoad(
  setStatus: (status: ContextStatus) => void,
  setGddTrackers: (gddTrackers: GddTracker[]) => void,
  setLocations: (locations: Location[]) => void,
) {
  console.log('App state context loaded');
  setStatus('Loading');
  AsyncStorage.multiGet([LOCATIONS_STORAGE_KEY, GDD_TRACKERS_STORAGE_KEY])
    .then(x => {
      const containsLoc = x.find(y => y[0] === LOCATIONS_STORAGE_KEY);
      const containsGddTrackers = x.find(
        y => y[0] === GDD_TRACKERS_STORAGE_KEY,
      );
      if (
        containsLoc !== undefined &&
        containsLoc[1] !== null &&
        containsGddTrackers !== undefined &&
        containsGddTrackers[1] !== null
      ) {
        console.log('Loading app state from device');
        // NOTE: Parse could fail if someone else writes to these keys!
        setGddTrackers(JSON.parse(containsGddTrackers[1]));
        setLocations(JSON.parse(containsLoc[1]));
        console.log('Loaded app state from device');
      } else console.log('Missing some App state on device - using defaults');
      setStatus('Loaded');
    })
    .catch(() => console.log('Error getting app state'));
  // Initialize BackgroundFetch only once when component mounts.
  initBackgroundFetch();
}

export function onChangeGddTrackers(
  status: ContextStatus,
  gddTrackers: GddTracker[],
) {
  let active = true;
  console.log('App state changed - trackers');
  if (status === 'Loaded') {
    console.log('Setting app state - trackers');
    AsyncStorage.setItem(GDD_TRACKERS_STORAGE_KEY, JSON.stringify(gddTrackers))
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
