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
  const actions = [{icon: 'delete', name: 'Delete', callback: onDelete}];
  if (calendarTracker.trackerStatus === 'Stopped') {
    actions.push({icon: 'play', name: 'Resume', callback: onResume});
  } else {
    actions.push({icon: 'stop', name: '', callback: onStop});
  }
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
    actions,
    onPress: () => {},
  };
}
