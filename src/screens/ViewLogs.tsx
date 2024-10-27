import {ScrollView} from 'react-native';
import {List} from 'react-native-paper';

export default function ViewLogsScreen() {
  return (
    <ScrollView>
      <List.Section>
        <List.Subheader>Notification metrics</List.Subheader>
        <List.Item title="Last checked" description="Hello" />
      </List.Section>
    </ScrollView>
  );
}
