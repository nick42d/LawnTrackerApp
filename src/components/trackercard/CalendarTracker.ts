import {CalendarTracker} from '../../providers/statecontext/Trackers';
import {HomeLocationsTabScreenProps} from '../../navigation/Root';
import {TrackerCardProps} from './Types';

export function ToCalendarTrackerCardProps(
  calendarTracker: CalendarTracker,
  navigation: HomeLocationsTabScreenProps<'Home'>['navigation'],
  onDelete: () => void,
  onStop: () => void,
  onResume: () => void,
): TrackerCardProps {
  const daysRem = 30;
  const leftCalloutStatus =
    calendarTracker.trackerStatus === 'Stopped' ? 'Stopped' : undefined;
  return {
    heading: calendarTracker.name,
    subheading: calendarTracker.description,
    leftCalloutProps: {text: `T-${daysRem}`, status: leftCalloutStatus},
    rightIcon: 'calendar-clock',
    lines: [
      {
        icon: 'calendar-end',
        title: 'Target Date',
        text: new Date(calendarTracker.target_date_unix_ms).toDateString(),
      },
    ],
    actions: [
      {icon: 'delete', name: 'Delete', callback: onDelete},
      {icon: 'stop', name: 'Stop', callback: onStop},
    ],
    onPress: () => {},
  };
}
