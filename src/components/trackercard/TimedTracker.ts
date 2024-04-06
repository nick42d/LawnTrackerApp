import { TimedTracker } from '../../providers/statecontext/Trackers';
import { HomeLocationsTabScreenProps } from '../../navigation/Root';
import { TrackerCardProps } from './Types';
import { AddDays } from '../../Utils';

export function ToTimedTrackerCardProps(
  timedTracker: TimedTracker,
  navigation: HomeLocationsTabScreenProps<'Home'>['navigation'],
  onDelete: () => void,
  onReset: () => void
): TrackerCardProps {
  // Temp!
  const daysRem = 5;
  return {
    heading: timedTracker.name,
    subheading: timedTracker.description,
    leftCallout: `T-${daysRem}`,
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
        text: AddDays(new Date(timedTracker.start_date_unix_ms), timedTracker.duration_days).toDateString(),
      },
    ],
    actions: [
      { icon: 'rotate-left', name: 'Reset', callback: onReset },
      { icon: 'stop', name: 'Stop', callback: () => { } },
      { icon: 'delete', name: 'Delete', callback: onDelete },
    ],
    onPress: () => { },
  };
}
