/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import type {StackScreenProps} from '@react-navigation/stack';
import type {StackHeaderProps} from '@react-navigation/stack';
import {createMaterialBottomTabNavigator} from 'react-native-paper/react-navigation';
import {getHeaderTitle} from '@react-navigation/elements';
import React, {createContext, useContext} from 'react';
import {StyleSheet} from 'react-native';
import {Appbar, Icon, Text} from 'react-native-paper';
import HomeScreen from './Home';
import AddNewScreen from './AddNew';
import ViewCardScreen from './ViewCard';
import {GddTracker, WeatherApiHistory, apiHistoryToAppHistory} from './Types';
import ViewWeatherScreen from './ViewWeather';

// Local API key
import {API_KEY} from './apikey';
import {onDisplayNotification} from './Notification';

export type AppStackParamList = {
  Home: undefined;
  Add: undefined;
  ViewCard: {gddCard: GddTracker};
  Bar: undefined;
};

export type AppTabParamList = {
  Home: NavigatorScreenParams<AppStackParamList>;
  Weather: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

function PaperStackNavigationBar({
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
      {route.name === 'ViewCard' || route.name === 'Add' ? (
        <Appbar.Action
          onPress={() => onDisplayNotification()}
          icon="content-save"
        />
      ) : null}
    </Appbar.Header>
  );
}

export function calcGdd(
  t_min: number,
  t_max: number,
  t_base: number,
  // Variant b from wikipedia https://en.wikipedia.org/wiki/Growing_degree-day
  is_variant_b = false,
): number {
  if (!is_variant_b) {
    return Math.max((t_max + t_min) / 2 - t_base, 0);
  } else {
    t_min = Math.max(t_min, t_base);
    return (t_max + t_min) / 2 - t_base;
  }
}

export type dayGddStat = {
  gdd: number;
  date: Date;
};

export const daily_gdds_context: React.Context<dayGddStat[]> = createContext([
  {gdd: 10, date: new Date('2024-1-1')},
  {gdd: 20, date: new Date('2024-1-2')},
  {gdd: 10, date: new Date('2024-1-3')},
  {gdd: 5, date: new Date('2024-1-4')},
  {gdd: 10, date: new Date('2024-1-5')},
  {gdd: 10, date: new Date('2024-1-6')},
  {gdd: 10, date: new Date('2024-1-7')},
  {gdd: 10, date: new Date('2024-1-8')},
  {gdd: 10, date: new Date('2024-1-9')},
  {gdd: 10, date: new Date('2024-1-10')},
  {gdd: 10, date: new Date('2024-1-11')},
  {gdd: 10, date: new Date('2024-1-12')},
  {gdd: 10, date: new Date('2024-1-13')},
  {gdd: 10, date: new Date('2024-1-14')},
  {gdd: 10, date: new Date('2024-1-15')},
  {gdd: 10, date: new Date('2024-1-16')},
  {gdd: 10, date: new Date('2024-1-17')},
  {gdd: 10, date: new Date('2024-1-18')},
  {gdd: 10, date: new Date('2024-1-19')},
  {gdd: 10, date: new Date('2024-1-19')},
  {gdd: 10, date: new Date('2024-1-20')},
  {gdd: 10, date: new Date('2024-1-21')},
  {gdd: 10, date: new Date('2024-1-22')},
  {gdd: 10, date: new Date('2024-1-22')},
  {gdd: 10, date: new Date('2024-1-23')},
  {gdd: 10, date: new Date('2024-1-24')},
]);

function App(): React.JSX.Element {
  return (
    // TODO: Where to put safe area?
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          header: props => <PaperStackNavigationBar {...props} />,
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Add" component={AddNewScreen} />
        <Stack.Screen name="ViewCard" component={ViewCardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});

export default App;
