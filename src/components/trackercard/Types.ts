import { Tracker } from '../../Types';
import { HomeLocationsTabScreenProps } from '../../navigation/Root';
import { ToCalendarTrackerCardProps } from './CalendarTracker';
import { ToGddTrackerCardProps } from './GddTracker';
import { ToTimedTrackerCardProps } from './TimedTracker';

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
    leftcallout?: string;
    leftcalloutcolour?: 'red' | 'orange';
    righticon: string;
    lines: TrackerCardLineProps[];
    actions: TrackerCardActionProps[];
    onPress: () => void;
};
export function TrackerPropsToCardProps(
    tracker: Tracker,
    navigation: HomeLocationsTabScreenProps<'Home'>['navigation']
): TrackerCardProps | undefined {
    switch (tracker.kind) {
        case 'gdd': {
            return ToGddTrackerCardProps(
                tracker,
                navigation,
                () => { },
                () => { }
            );
        }
        case 'calendar': {
            return ToCalendarTrackerCardProps(tracker, navigation, () => { });
        }
        case 'timed': {
            return ToTimedTrackerCardProps(
                tracker,
                navigation,
                () => { },
                () => { }
            );
        }
        // TODO: Better error handling
        default: {
            return undefined;
        }
    }
}

