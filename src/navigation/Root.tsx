import {
  CompositeScreenProps,
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {GddTracker} from '../Types';
import {Appbar, MaterialBottomTabScreenProps} from 'react-native-paper';
import {
  StackHeaderProps,
  StackScreenProps,
  createStackNavigator,
} from '@react-navigation/stack';
import {DrawerContent, createDrawerNavigator} from '@react-navigation/drawer';
import {getHeaderTitle} from '@react-navigation/elements';
import {onDisplayNotification} from '../Notification';
import AddNewScreen from '../screens/AddNew';
import ViewCardScreen from '../screens/ViewCard';
import {HomeWeatherScreen} from './Tab';
import SettingsScreen from '../screens/Settings';

const Stack = createStackNavigator<RootStackParamList>();
const DrawerNavigator = createDrawerNavigator();

export type RootStackParamList = {
  HomeWeather: NavigatorScreenParams<HomeWeatherTabParamList>;
  Add: undefined;
  ViewCard: {gddCard: GddTracker};
};

export type HomeWeatherTabParamList = {
  Home: {add_gdd: GddTracker} | undefined;
  Locations: undefined;
};

export type AppScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type HomeWeatherTabScreenProps<T extends keyof HomeWeatherTabParamList> =
  CompositeScreenProps<
    MaterialBottomTabScreenProps<HomeWeatherTabParamList, T>,
    StackScreenProps<RootStackParamList>
  >;

export function AppRootStackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HomeWeather"
        screenOptions={{
          header: props => <AppStackNavigationBar {...props} />,
        }}>
        <Stack.Screen
          name="HomeWeather"
          component={AppDrawerNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Add" component={AddNewScreen} />
        <Stack.Screen name="ViewCard" component={ViewCardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export function AppDrawerNavigator() {
  return (
    <DrawerNavigator.Navigator
      initialRouteName="HomeWeather"
      drawerContent={props => <DrawerContent {...props} />}>
      <DrawerNavigator.Screen
        name="HomeWeather"
        component={HomeWeatherScreen}
      />
      <DrawerNavigator.Screen name="Settings" component={SettingsScreen} />
    </DrawerNavigator.Navigator>
  );
}

function AppStackNavigationBar({
  navigation,
  back,
  route,
  options,
}: StackHeaderProps): React.JSX.Element {
  const title = getHeaderTitle(options, route.name);
  return (
    <Appbar.Header>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
      {route.name === 'Add' ? SaveButton() : null}
    </Appbar.Header>
  );
}

function SaveButton() {
  return (
    <Appbar.Action
      onPress={() => onDisplayNotification()}
      icon="content-save"
    />
  );
}