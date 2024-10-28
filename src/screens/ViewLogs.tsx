import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import {List, Text} from 'react-native-paper';

type KeyVal = {
  readonly key: string;
  val: string;
};

export default function ViewLogsScreen() {
  const [keys, setKeys] = useState<KeyVal[]>([]);
  const [text, setText] = useState<string | null>();
  useEffect(() => {
    AsyncStorage.getAllKeys().then(found_keys => 
      found_keys.map(k => {
        AsyncStorage.getItem(k).then(item =>
          setKeys((old) => old.push({key: k, val: item}))
        )
      })
  }, []);
  return (
    <ScrollView>
      <List.Section>
        <List.Subheader>Notification metrics</List.Subheader>
        {keys.map(key => (
          <List.Accordion key={key} title={key}>
            <Text>Hello</Text>
          </List.Accordion>
        ))}
      </List.Section>
      <Text>{text}</Text>
    </ScrollView>
  );
}
