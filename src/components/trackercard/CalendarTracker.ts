import {CalendarTracker} from '../../providers/statecontext/Trackers';
import {HomeLocationsTabScreenProps} from '../../navigation/Root';
import {TrackerCardProps} from './Types';
import {differenceInCalendarDays} from 'date-fns';
import {formatDaysRem} from './Common';
import {Settings} from '../../providers/settingscontext/Types';

export function ToCalendarTrackerCardProps(
  calendarTracker: CalendarTracker,
  navigation: HomeLocationsTabScreenProps<'Home'>['navigation'],
  settings: Settings,
  onDelete: () => void,
  onStop: () => void,
  onResume: () => void,
): TrackerCardProps {
  const daysRem = differenceInCalendarDays(
    calendarTracker.target_date_unix_ms,
    new Date(),
  );
  const leftCalloutColor = GetCalendarTrackerCalloutColor(
    settings.warning_threshold_days,
    daysRem,
  );
  const leftCalloutStatus =
    calendarTracker.trackerStatus === 'Stopped' ? 'Stopped' : undefined;
  const actions = [{icon: 'delete', name: 'Delete', callback: onDelete}];
  if (calendarTracker.trackerStatus === 'Stopped') {
    actions.push({icon: 'play', name: 'Resume', callback: onResume});
  } else {
    actions.push({icon: 'stop', name: 'Stop', callback: onStop});
  }
  return {
    heading: calendarTracker.name,
    subheading: calendarTracker.description,
    leftCalloutProps: {
      text: formatDaysRem(daysRem),
      status: leftCalloutStatus,
      backgroundColor: leftCalloutColor,
    },
    rightIcon: 'calendar-clock',
    lines: [
      {
        icon: 'calendar-end',
        title: 'Target Date',
        text: new Date(calendarTracker.target_date_unix_ms).toDateString(),
      },
    ],
    actions,
    onPress: () =>
      navigation.navigate('ViewTracker', {
        trackerId: calendarTracker.uuid,
      }),
  };
}
export function GetCalendarTrackerCalloutColor(
  warning_threshold_days: number,
  daysRem: number,
): 'red' | 'orange' | undefined {
  if (daysRem <= 0) {
    return 'red';
  } else if (daysRem <= warning_threshold_days) {
    return 'orange';
  } else {
    return undefined;
  }
}
