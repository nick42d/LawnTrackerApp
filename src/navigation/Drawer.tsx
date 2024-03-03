import {useState} from 'react';
import {View} from 'react-native';
import {Drawer, Switch, Text} from 'react-native-paper';

export function DrawerContent({navigation}: any): React.JSX.Element {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  function onToggleSwitch() {
    setIsSwitchOn(!isSwitchOn);
  }

  return (
    <View>
      <Text>Dark Mode</Text>
      <Switch value={isSwitchOn} onValueChange={onToggleSwitch} />
      <Drawer.Section>
        <Drawer.Item
          icon="home"
          label="Home"
          onPress={() => navigation.navigate('Home')}
        />
      </Drawer.Section>
      <Drawer.Item
        icon="cog"
        label="Settings"
        onPress={() => navigation.navigate('Settings')}
      />
      <Drawer.Item
        icon="help-circle-outline"
        label="Help"
        onPress={() => console.log('Pressed Help')}
      />
    </View>
  );
}
