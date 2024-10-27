import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import {List, Text} from 'react-native-paper';

export default function ViewLogsScreen() {
  const [keys, setKeys] = useState<readonly string[]>([]);
  const [text, setText] = useState<string | null>();
  useEffect(() => {
    AsyncStorage.getAllKeys().then(found_keys => setKeys(found_keys));
    AsyncStorage.getAllKeys().then(keys =>
      keys.map(key =>
        AsyncStorage.getItem(key).then(item =>
          setText(old_item => (old_item != undefined ? old_item + item : item)),
        ),
      ),
    );
  }, []);
  return (
    <ScrollView>
      <List.Section>
        <List.Subheader>Notification metrics</List.Subheader>
        {keys.map(key => (
          <List.Item key={key} title={key} description="Hello" />
        ))}
      </List.Section>
      <Text>{text}</Text>
    </ScrollView>
  );
}
