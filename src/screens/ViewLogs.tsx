import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import {List, Text} from 'react-native-paper';

type KeyVal = {
  key: string;
  val: string;
};

export default function ViewLogsScreen() {
  const [keys, setKeys] = useState<KeyVal[]>([]);
  const [text, setText] = useState<string | null>();
  useEffect(() => {
    AsyncStorage.getAllKeys().then(found_keys =>
      found_keys.map(k => {
        AsyncStorage.getItem(k).then(item => {
          if (item !== null)
            setKeys(old => [
              ...old,
              {key: k, val: JSON.stringify(JSON.parse(item), null, 2)},
            ]);
        });
      }),
    );
  }, []);
  return (
    <ScrollView>
      <List.Section>
        <List.Subheader>Notification metrics</List.Subheader>
        {keys.map(keyval => (
          <List.Accordion key={keyval.key} title={keyval.key}>
            <Text>{keyval.val}</Text>
          </List.Accordion>
        ))}
      </List.Section>
      <Text>{text}</Text>
    </ScrollView>
  );
}
