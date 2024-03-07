import {
  CompositeScreenProps,
  NavigationContainer,
  NavigatorScreenParams,
  Theme,
} from '@react-navigation/native';
import {GddTracker} from '../Types';
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
import AddNewScreen from '../screens/AddNew';
import ViewCardScreen from '../screens/ViewCard';
import {AppDrawerNavigator} from './Drawer';
import {DrawerScreenProps} from '@react-navigation/drawer';

const Stack = createStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  Drawer: NavigatorScreenParams<AppDrawerParamList>;
  Add: undefined;
  ViewCard: {gddCard: GddTracker};
};

export type AppDrawerParamList = {
  HomeLocationsTabs: NavigatorScreenParams<HomeLocationsTabParamList>;
  Settings: undefined;
};

export type HomeLocationsTabParamList = {
  Home: {add_gdd: GddTracker} | undefined;
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

export function AppRootStackNavigator() {
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
        <Stack.Screen name="Add" component={AddNewScreen} />
        <Stack.Screen name="ViewCard" component={ViewCardScreen} />
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
