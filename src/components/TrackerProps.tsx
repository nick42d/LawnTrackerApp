import {View} from 'react-native';
import {Tracker} from '../providers/statecontext/Trackers';
import {Text} from 'react-native-paper';

export type TrackerProps = {
  tracker: Tracker;
};
export function TrackerProps({tracker}: TrackerProps) {
  return (
    <View>
      <Text variant="bodyLarge">{tracker.name}</Text>
      <Text variant="bodyMedium">{tracker.description}</Text>
      <Text variant="bodyMedium">{tracker.kind}</Text>
      <Text variant="bodyMedium">{tracker.trackerStatus.toString()}</Text>
    </View>
  );
}
