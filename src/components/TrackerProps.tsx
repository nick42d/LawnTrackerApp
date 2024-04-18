import {View} from 'react-native';
import {Tracker, getTrackerType} from '../providers/statecontext/Trackers';
import {List, Text, TextInput} from 'react-native-paper';

export type TrackerProps = {
  tracker: Tracker;
};
export function TrackerProps({tracker}: TrackerProps) {
  return (
    <View>
      <List.Section>
        <List.Item title="Tracker type" description={getTrackerType(tracker)} />
        <List.Item title="Name" description={tracker.name} />
        <List.Item title="Description" description={tracker.description} />
        <List.Item title="Tracker status" description={tracker.trackerStatus} />
      </List.Section>
    </View>
  );
}
