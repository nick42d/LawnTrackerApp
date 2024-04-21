import {
  CompositeScreenProps,
  NavigationContainer,
  NavigatorScreenParams,
  Theme,
} from '@react-navigation/native';
import {
  Appbar,
  MaterialBottomTabScreenProps,
  useTheme,
} from 'react-native-paper';
import {
  StackHeaderProps,
  StackNavigationProp,
  StackScreenProps,
  createStackNavigator,
} from '@react-navigation/stack';
import {getHeaderTitle} from '@react-navigation/elements';
import ViewTrackerScreen from '../screens/ViewTracker';
import {AppDrawerNavigator} from './Drawer';
import {DrawerScreenProps} from '@react-navigation/drawer';
import {Location} from '../providers/statecontext/Locations';
import AddLocationScreen from '../screens/AddLocation';
import {useContext} from 'react';
import {SettingsContext} from '../providers/SettingsContext';
import LoadingScreen from '../screens/Loading';
import ViewLocationScreen from '../screens/ViewLocation';
import EditTrackerScreen from '../screens/EditTracker';
import AddTrackerScreen from '../screens/AddTracker';

const Stack = createStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  Drawer: NavigatorScreenParams<AppDrawerParamList>;
  AddLocation: {fromAddGddTracker: boolean} | undefined;
  AddTracker:
    | {kind: 'gdd'; fromAddLocationId?: number}
    | {kind: 'calendar' | 'timed'};
  ViewTracker: {trackerId: string};
  ViewLocation: {location: Location};
  EditTracker:
    | {trackerId: string; kind: 'gdd'; fromAddLocationId?: number}
    | {trackerId: string; kind: 'calendar' | 'timed'};
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
          name="AddTracker"
          component={AddTrackerScreen}
          options={{title: 'Add Tracker'}}
        />
        <Stack.Screen
          name="ViewTracker"
          component={ViewTrackerScreen}
          options={{title: 'View Tracker'}}
        />
        <Stack.Screen
          name="EditTracker"
          component={EditTrackerScreen}
          options={{title: 'Edit Tracker'}}
        />
        <Stack.Screen
          name="AddLocation"
          component={AddLocationScreen}
          options={{title: 'Add Location'}}
        />
        <Stack.Screen
          name="ViewLocation"
          component={ViewLocationScreen}
          options={{title: 'View Location'}}
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
