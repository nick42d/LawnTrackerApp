import {Tracker} from '../../providers/statecontext/Trackers';
import {HomeLocationsTabScreenProps} from '../../navigation/Root';
import {ToCalendarTrackerCardProps} from './CalendarTracker';
import {ToGddTrackerCardProps} from './GddTracker';
import {ToTimedTrackerCardProps} from './TimedTracker';
import {LeftCalloutProps} from './LeftCallout';
import {Settings} from '../../providers/settingscontext/Types';
import {Location} from '../../providers/statecontext/Locations';

type TrackerCardPropsParamList = {
  props: TrackerCardProps;
};
type TrackerCardLineProps = {
  icon: string;
  title: string;
  text: string;
};
type TrackerCardActionProps = {
  icon: string;
  name: string;
  callback: () => void;
};
export type TrackerCardProps = {
  heading: string;
  subheading: string;
  leftCalloutProps?: LeftCalloutProps;
  rightIcon: string;
  lines: TrackerCardLineProps[];
  actions: TrackerCardActionProps[];
  onPress: () => void;
};
export function TrackerPropsToCardProps(
  tracker: Tracker,
  settings: Settings,
  locations: Location[],
  onDelete: () => void,
  onReset: () => void,
  onStop: () => void,
  onResume: () => void,
  navigation: HomeLocationsTabScreenProps<'Home'>['navigation'],
): TrackerCardProps | undefined {
  switch (tracker.kind) {
    case 'gdd': {
      return ToGddTrackerCardProps(
        tracker,
        navigation,
        settings,
        locations,
        onDelete,
        onReset,
        onStop,
        onResume,
      );
    }
    case 'calendar': {
      return ToCalendarTrackerCardProps(
        tracker,
        navigation,
        settings,
        onDelete,
        onStop,
        onResume,
      );
    }
    case 'timed': {
      return ToTimedTrackerCardProps(
        tracker,
        navigation,
        settings,
        onDelete,
        onReset,
        onStop,
        onResume,
      );
    }
    // TODO: Better error handling
    default: {
      return undefined;
    }
  }
}
