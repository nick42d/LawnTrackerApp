import {
  CompositeScreenProps,
  NavigationContainer,
  NavigatorScreenParams,
  Theme,
} from '@react-navigation/native';
import {GddTracker, Tracker} from '../providers/statecontext/Trackers';
import {
  Appbar,
  MaterialBottomTabScreenProps,
  Text,
  useTheme,
} from 'react-native-paper';
import {
  StackHeaderProps,
  StackNavigationProp,
  StackScreenProps,
  createStackNavigator,
} from '@react-navigation/stack';
import {getHeaderTitle} from '@react-navigation/elements';
import AddGddTrackerScreen from '../screens/AddGddTracker';
import ViewTrackerScreen from '../screens/ViewTracker';
import {AppDrawerNavigator} from './Drawer';
import {DrawerScreenProps} from '@react-navigation/drawer';
import {AddLocation, Location} from '../providers/statecontext/Locations';
import AddLocationCardScreen from '../screens/AddLocationCard';
import {useContext} from 'react';
import {SettingsContext} from '../providers/SettingsContext';
import {View} from 'react-native';
import LoadingScreen from '../screens/Loading';
import AddCalendarTrackerScreen from '../screens/AddCalendarTracker';
import AddTimedTrackerScreen from '../screens/AddTimedTracker';

const Stack = createStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  Drawer: NavigatorScreenParams<AppDrawerParamList>;
  AddGddTracker: undefined;
  AddCalendarTracker: undefined;
  AddTimedTracker: undefined;
  AddLocationCard: {onGoBack: (locName: string) => void} | undefined;
  ViewTracker: {tracker: Tracker};
  ViewLocationCard: {location: Location};
};

export type AppDrawerParamList = {
  HomeLocationsTabs: NavigatorScreenParams<HomeLocationsTabParamList>;
  Settings: undefined;
  Help: undefined;
};

export type HomeLocationsTabParamList = {
  Home: undefined;
  Locations: undefined;
};

export type AppScreenNavigationProp<T extends keyof RootStackParamList> =
  StackNavigationProp<RootStackParamList, T>;

export type AppScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type AppDrawerScreenProps<T extends keyof AppDrawerParamList> =
  CompositeScreenProps<
    DrawerScreenProps<AppDrawerParamList, T>,
    AppScreenProps<keyof RootStackParamList>
  >;

export type HomeLocationsTabScreenProps<
  T extends keyof HomeLocationsTabParamList,
> = CompositeScreenProps<
  MaterialBottomTabScreenProps<HomeLocationsTabParamList, T>,
  AppDrawerScreenProps<keyof AppDrawerParamList>
>;

export function LoadableApp() {
  const {status: settingsStatus} = useContext(SettingsContext);
  const {status: appStatus} = useContext(SettingsContext);

  // TODO: Handle initialising also.
  return settingsStatus !== 'Loaded' || appStatus !== 'Loaded' ? (
    <LoadingScreen />
  ) : (
    <AppRootStackNavigator />
  );
}

function AppRootStackNavigator() {
  const paperTheme = useTheme<Theme>();

  return (
    <NavigationContainer theme={paperTheme}>
      <Stack.Navigator
        initialRouteName="Drawer"
        screenOptions={{
          header: props => <AppStackNavigationBar {...props} />,
        }}>
        <Stack.Screen
          name="Drawer"
          component={AppDrawerNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AddGddTracker"
          component={AddGddTrackerScreen}
          options={{title: 'Add GDD Tracker'}}
        />
        <Stack.Screen
          name="AddCalendarTracker"
          component={AddCalendarTrackerScreen}
          options={{title: 'Add Calendar Tracker'}}
        />
        <Stack.Screen
          name="AddTimedTracker"
          component={AddTimedTrackerScreen}
          options={{title: 'Add Timed Tracker'}}
        />
        <Stack.Screen
          name="ViewTracker"
          component={ViewTrackerScreen}
          options={{title: 'View Tracker'}}
        />
        <Stack.Screen
          name="AddLocationCard"
          component={AddLocationCardScreen}
          options={{title: 'Add Location'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
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
      {options.headerRight ? options.headerRight({}) : null}
    </Appbar.Header>
  );
}
