import {
  DrawerHeaderProps,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import {useState} from 'react';
import {View} from 'react-native';
import {Appbar, Drawer, Switch, Text} from 'react-native-paper';
import {AppTabNavigator} from './Tab';
import SettingsScreen from '../screens/Settings';
import {getHeaderTitle} from '@react-navigation/elements';

const DrawerNavigator = createDrawerNavigator();

export function AppDrawerNavigator() {
  return (
    <DrawerNavigator.Navigator
      initialRouteName="HomeLocationsTabs"
      screenOptions={{header: props => <AppDrawerNavigationBar {...props} />}}
      drawerContent={props => <AppDrawerContent {...props} />}>
      <DrawerNavigator.Screen
        name="HomeLocationsTabs"
        component={AppTabNavigator}
      />
      <DrawerNavigator.Screen name="Settings" component={SettingsScreen} />
    </DrawerNavigator.Navigator>
  );
}

// Duplicate of AppStackNavigationBar in Root - todo: deduplicate
function AppDrawerNavigationBar({
  navigation,
  route,
  options,
}: DrawerHeaderProps): React.JSX.Element {
  const title = getHeaderTitle(options, route.name);
  return (
    <Appbar.Header>
      <Appbar.Action icon="menu" onPress={() => navigation.toggleDrawer()} />
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}

export function AppDrawerContent({navigation}: any): React.JSX.Element {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  function onToggleSwitch() {
    setIsSwitchOn(!isSwitchOn);
  }

  return (
    <View>
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
