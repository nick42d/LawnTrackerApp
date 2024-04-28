import {TimedTracker} from '../../providers/statecontext/Trackers';
import {HomeLocationsTabScreenProps} from '../../navigation/Root';
import {TrackerCardProps} from './Types';
import {addDays, differenceInCalendarDays} from 'date-fns';
import {formatDaysRem} from './Common';
import {Settings} from '../../providers/settingscontext/Types';

export function ToTimedTrackerCardProps(
  timedTracker: TimedTracker,
  navigation: HomeLocationsTabScreenProps<'Home'>['navigation'],
  settings: Settings,
  onDelete: () => void,
  onReset: () => void,
  onStop: () => void,
  onResume: () => void,
): TrackerCardProps {
  // This is likely also duplicated when checking notifications
  const daysRem = differenceInCalendarDays(
    addDays(timedTracker.start_date_unix_ms, timedTracker.duration_days),
    new Date(),
  );
  const leftCalloutText = formatDaysRem(daysRem);
  const leftCalloutStatus =
    timedTracker.trackerStatus === 'Stopped' ? 'Stopped' : undefined;
  const leftCalloutColor = GetTimedTrackerCalloutColor(
    settings.warning_threshold_perc,
    daysRem,
    timedTracker.duration_days,
  );
  const actions = [{icon: 'delete', name: 'Delete', callback: onDelete}];
  if (timedTracker.trackerStatus === 'Stopped') {
    actions.push({icon: 'play', name: 'Resume', callback: onResume});
  } else {
    actions.push(
      {icon: 'rotate-left', name: 'Reset', callback: onReset},
      {icon: 'stop', name: 'Stop', callback: onStop},
    );
  }
  return {
    heading: timedTracker.name,
    subheading: timedTracker.description,
    leftCalloutProps: {
      text: leftCalloutText,
      status: leftCalloutStatus,
      backgroundColor: leftCalloutColor,
    },
    rightIcon: 'clock-start',
    lines: [
      {
        icon: 'calendar-start',
        title: 'Start date',
        text: new Date(timedTracker.start_date_unix_ms).toDateString(),
      },
      {
        icon: 'calendar-multiple',
        title: 'Duration days',
        text: timedTracker.duration_days.toString(),
      },
      {
        icon: 'calendar-end',
        title: 'End date',
        text: addDays(
          new Date(timedTracker.start_date_unix_ms),
          timedTracker.duration_days,
        ).toDateString(),
      },
    ],
    actions,
    onPress: () =>
      navigation.navigate('ViewTracker', {
        trackerId: timedTracker.uuid,
      }),
  };
}
export function GetTimedTrackerCalloutColor(
  warning_threshold_perc: number,
  cur: number,
  target: number,
): 'red' | 'orange' | undefined {
  const daysTowardsTarget = target - cur;
  const progress = daysTowardsTarget / target;
  if (progress >= 1) {
    return 'red';
  } else if (progress >= warning_threshold_perc) {
    return 'orange';
  } else {
    return undefined;
  }
}
