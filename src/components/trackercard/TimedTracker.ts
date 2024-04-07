import {TimedTracker} from '../../providers/statecontext/Trackers';
import {HomeLocationsTabScreenProps} from '../../navigation/Root';
import {TrackerCardProps} from './Types';
import {AddDays} from '../../Utils';

export function ToTimedTrackerCardProps(
  timedTracker: TimedTracker,
  navigation: HomeLocationsTabScreenProps<'Home'>['navigation'],
  onDelete: () => void,
  onReset: () => void,
  onStop: () => void,
  onResume: () => void,
): TrackerCardProps {
  // Temp!
  const daysRem = 5;
  const leftCalloutStatus =
    timedTracker.trackerStatus === 'Stopped' ? 'Stopped' : undefined;
  const actions = [{icon: 'delete', name: 'Delete', callback: onDelete}];
  if (timedTracker.trackerStatus === 'Stopped') {
    actions.push({icon: 'play', name: 'Resume', callback: onResume});
  } else {
    actions.push(
      {icon: 'rotate-left', name: 'Reset', callback: onReset},
      {icon: 'stop', name: '', callback: onStop},
    );
  }
  return {
    heading: timedTracker.name,
    subheading: timedTracker.description,
    leftCalloutProps: {text: `T-${daysRem}`, status: leftCalloutStatus},
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
        text: AddDays(
          new Date(timedTracker.start_date_unix_ms),
          timedTracker.duration_days,
        ).toDateString(),
      },
    ],
    actions,
    onPress: () =>
      navigation.navigate('ViewTracker', {
        tracker: timedTracker,
      }),
  };
}
