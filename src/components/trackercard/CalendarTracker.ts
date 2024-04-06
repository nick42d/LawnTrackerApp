import { CalendarTracker } from '../../providers/statecontext/Trackers';
import { HomeLocationsTabScreenProps } from '../../navigation/Root';
import { TrackerCardProps } from './Types';

export function ToCalendarTrackerCardProps(
  calendarTracker: CalendarTracker,
  navigation: HomeLocationsTabScreenProps<'Home'>['navigation'],
  onDelete: () => void
): TrackerCardProps {
  const daysRem = 30;
  return {
    heading: calendarTracker.name,
    subheading: calendarTracker.description,
    leftCallout: `T-${daysRem}`,
    rightIcon: 'calendar-clock',
    lines: [
      {
        icon: 'calendar-end',
        title: 'Target Date',
        text: new Date(calendarTracker.target_date_unix_ms).toDateString(),
      },
    ],
    actions: [
      { icon: 'stop', name: 'Stop', callback: () => { } },
      { icon: 'delete', name: 'Delete', callback: onDelete },
    ],
    onPress: () => { },
  };
}
