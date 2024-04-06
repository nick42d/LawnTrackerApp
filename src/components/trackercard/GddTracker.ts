import {useContext} from 'react';
import {GddTracker} from '../../providers/statecontext/Trackers';
import {ReplaceUndefinedString} from '../../Utils';
import {calc_gdd_total} from '../../knowledge/Gdd';
import {HomeLocationsTabScreenProps} from '../../navigation/Root';
import {getGddEstimate, getGraphPlot, WeatherSource} from '../../plot/Gdd';
import {SettingsContext} from '../../providers/SettingsContext';
import {StateContext} from '../../providers/StateContext';
import {TrackerCardProps} from './Types';
import styles from '../../Styles';
import {LocationError} from '../../providers/statecontext/Locations';
import {LeftCalloutProps} from './LeftCallout';

export function ToGddTrackerCardProps(
  gddTracker: GddTracker,
  navigation: HomeLocationsTabScreenProps<'Home'>['navigation'],
  onDelete: () => void,
  onReset: () => void,
): TrackerCardProps {
  const {settings} = useContext(SettingsContext);
  const {locations} = useContext(StateContext);
  const actual_gdd = calc_gdd_total(gddTracker, locations, settings.algorithm);
  console.log(JSON.stringify(actual_gdd));
  const leftCalloutRefreshing = typeof actual_gdd !== 'number' ? true : false;
  // TODO: Fix undefined case
  const estimateTemp = getGddEstimate(
    getGraphPlot(gddTracker, locations, settings.algorithm),
    gddTracker.target_gdd,
  );
  const estimateTempString = ReplaceUndefinedString(
    estimateTemp === undefined
      ? undefined
      : new Date(estimateTemp.estimateDateUnixMs).toDateString(),
  );
  const leftcalloutcolour = GetGddTrackerCalloutColor(
    settings.warning_threshold_perc,
    actual_gdd as number,
    gddTracker.target_gdd,
  );
  const leftCalloutProps: LeftCalloutProps = {
    text: actual_gdd.toString(),
    status: leftCalloutRefreshing ? 'Refreshing' : undefined,
    backgroundColor: leftcalloutcolour,
  };
  return {
    heading: gddTracker.name,
    subheading: gddTracker.description,
    leftCalloutProps,
    rightIcon: 'weather-cloudy-clock',
    lines: [
      {
        icon: 'map-marker',
        title: 'Location',
        text: gddTracker.location_name,
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
        text: estimateTemp ? WeatherSource[estimateTemp?.estimateType] : '',
      },
    ],
    actions: [
      {icon: 'rotate-left', name: 'Reset', callback: onReset},
      {icon: 'stop', name: 'Stop', callback: () => {}},
      {icon: 'delete', name: 'Delete', callback: onDelete},
    ],
    onPress: () =>
      navigation.navigate('ViewGddCard', {
        gddCard: gddTracker,
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
