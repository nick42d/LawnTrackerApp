/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {NavigationContainer} from '@react-navigation/native';
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
import {GddTracker} from './Types';
import ViewWeatherScreen from './ViewWeather';

// Local API key
import {API_KEY} from './apikey';

export type AppStackParamList = {
  Home: undefined;
  Add: undefined;
  ViewCard: {gddCard: GddTracker};
  Bar: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();
const Tab = createMaterialBottomTabNavigator();

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
        <Appbar.Action onPress={navigation.goBack} icon="content-save" />
      ) : null}
    </Appbar.Header>
  );
}

const PERTH_LAT = -31.9514;
const PERTH_LONG = 115.8617;

function fetchWeatherHistorical(
  lat: number,
  long: number,
  start: Date,
  end: Date,
) {
  const start_unix = Math.floor(start.getTime() / 1000);
  const end_unix = Math.floor(end.getTime() / 1000);
  console.log(`Attempting to fetch from API ${start_unix} ${end_unix}`);
  fetch(
    `http://api.weatherapi.com/v1/history.json?&key=${API_KEY}&q=${lat},${long}&unixdt=${start_unix}&unixend_dt=${end_unix}&hour=17`,
  )
    .then(res => res.json())
    .then(json => {
      console.log(JSON.stringify(json));
    });
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

function StackNavigator() {
  fetchWeatherHistorical(
    PERTH_LAT,
    PERTH_LONG,
    new Date('2024-1-1'),
    new Date('2024-1-24'),
  );
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        header: props => <PaperStackNavigationBar {...props} />,
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Add" component={AddNewScreen} />
      <Stack.Screen name="ViewCard" component={ViewCardScreen} />
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  return (
    // TODO: Where to put safe area?
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={StackNavigator}
          options={{
            tabBarIcon: ({color}) => (
              <Icon source="home" color={color} size={26} />
            ),
          }}
        />
        <Tab.Screen
          name="Weather"
          component={ViewWeatherScreen}
          options={{
            tabBarIcon: ({color}) => (
              <Icon source="weather-partly-rainy" color={color} size={26} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});

export default App;
