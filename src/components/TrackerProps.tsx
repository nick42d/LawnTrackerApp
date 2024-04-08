import {View} from 'react-native';
import {Tracker} from '../providers/statecontext/Trackers';
import {List, Text, TextInput} from 'react-native-paper';

export type TrackerProps = {
  tracker: Tracker;
};
export function TrackerProps({tracker}: TrackerProps) {
  return (
    <View>
      <List.Section>
        <List.Subheader>{'Tracker type: ' + tracker.kind}</List.Subheader>
        <List.Item title={'Name'} description={tracker.name} />
        <List.Item title={'Description'} description={tracker.description} />
        <TextInput label="test" mode="outlined" placeholder="123" />
      </List.Section>
      <Text variant="bodyMedium">
        {'Tracker status: ' + tracker.trackerStatus.toString()}
      </Text>
      <Text variant="bodyMedium">Consider adding an Edit Tracker screen</Text>
    </View>
  );
}
