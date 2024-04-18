import {useContext} from 'react';
import {GddTracker} from '../../providers/statecontext/Trackers';
import {replaceUndefinedString} from '../../Utils';
import {
  calcGddTotal as calcGddTotal,
  isWeatherInitialized as isWeatherInitialised,
  isWeatherRefreshing,
} from '../../knowledge/Gdd';
import {HomeLocationsTabScreenProps} from '../../navigation/Root';
import {
  getGddEstimate,
  getGraphPlot,
  getTrackerGddArray,
} from '../gddplot/Plot';
import {SettingsContext} from '../../providers/SettingsContext';
import {StateContext} from '../../providers/StateContext';
import {TrackerCardProps} from './Types';
import {LeftCalloutProps} from './LeftCallout';
import {checkWeatherInvariants} from '../../api/Types';
import {Settings} from '../../providers/settingscontext/Types';
import {Location} from '../../providers/statecontext/Locations';

export function ToGddTrackerCardProps(
  gddTracker: GddTracker,
  navigation: HomeLocationsTabScreenProps<'Home'>['navigation'],
  settings: Settings,
  locations: Location[],
  onDelete: () => void,
  onReset: () => void,
  onStop: () => void,
  onResume: () => void,
): TrackerCardProps {
  const actual_gdd = calcGddTotal(gddTracker, locations, settings.algorithm);
  const weatherIsRefreshing = isWeatherRefreshing(gddTracker, locations);
  const weatherIsInitialised = isWeatherInitialised(gddTracker, locations);
  const leftCalloutRefreshing = typeof actual_gdd !== 'number' ? true : false;
  const gddTrackerArray = getTrackerGddArray(
    gddTracker,
    locations,
    settings.algorithm,
  );
  // TODO: Fix undefined case
  const estimateTemp = gddTrackerArray
    ? getGddEstimate(gddTrackerArray, gddTracker.target_gdd)
    : undefined;
  const estimateTempString = estimateTemp
    ? new Date(estimateTemp.estimateDateUnixMs).toDateString()
    : '';
  const leftCalloutStatus =
    gddTracker.trackerStatus === 'Stopped'
      ? 'Stopped'
      : weatherIsRefreshing === true
        ? 'Refreshing'
        : weatherIsInitialised === true
          ? 'Initialised'
          : undefined;
  const leftcalloutcolour = GetGddTrackerCalloutColor(
    settings.warning_threshold_perc,
    actual_gdd as number,
    gddTracker.target_gdd,
  );
  const leftCalloutProps: LeftCalloutProps = {
    text: actual_gdd.toString(),
    status: leftCalloutStatus,
    backgroundColor: leftcalloutcolour,
  };
  const actions = [{icon: 'delete', name: 'Delete', callback: onDelete}];
  if (gddTracker.trackerStatus === 'Stopped') {
    actions.push({icon: 'play', name: 'Resume', callback: onResume});
  } else {
    actions.push(
      {icon: 'rotate-left', name: 'Reset', callback: onReset},
      {icon: 'stop', name: '', callback: onStop},
    );
  }
  const locationName = locations.find(
    l => l.apiId === gddTracker.locationId,
  )?.name;
  return {
    heading: gddTracker.name,
    subheading: gddTracker.description,
    leftCalloutProps,
    rightIcon: 'weather-cloudy-clock',
    lines: [
      {
        icon: 'map-marker',
        title: 'Location',
        text: locationName ? locationName : '',
      },
      {
        icon: 'target',
        title: 'Target GDD',
        text: gddTracker.target_gdd.toString(),
      },
      {
        icon: 'calendar-start',
        title: 'Start date',
        text: new Date(gddTracker.start_date_unix_ms).toDateString(),
      },
      {
        icon: 'calendar-end',
        title: 'Projected end date',
        text: estimateTempString,
      },
      {
        icon: 'chart-timeline',
        title: 'Projection type',
        text: estimateTemp ? estimateTemp.estimateType : '',
      },
    ],
    actions,
    onPress: () =>
      navigation.navigate('ViewTracker', {
        trackerId: gddTracker.uuid,
      }),
  };
}
export function GetGddTrackerCalloutColor(
  warning_threshold_perc: number,
  cur: number,
  target: number,
): 'red' | 'orange' | undefined {
  const progress = cur / target;
  if (progress >= 1) {
    return 'red';
  } else if (progress >= warning_threshold_perc) {
    return 'orange';
  } else {
    return undefined;
  }
}
