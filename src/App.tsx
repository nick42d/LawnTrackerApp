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
import type {StackHeaderProps} from '@react-navigation/stack';
import {getHeaderTitle} from '@react-navigation/elements';
import React, {ParamHTMLAttributes, createContext} from 'react';
import {StyleSheet} from 'react-native';
import {Appbar} from 'react-native-paper';
import HomeWeatherScreen from './Home';
import AddNewScreen from './AddNew';
import ViewCardScreen from './ViewCard';
import {GddTracker} from './Types';
import {onDisplayNotification} from './Notification';

export type AppStackParamList = {
  HomeWeather: NavigatorScreenParams<AppTabParamList>;
  Add: undefined;
  ViewCard: {gddCard: GddTracker};
  Bar: undefined;
};

export type AppTabParamList = {
  Home: undefined | {add_gdd: GddTracker};
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
        initialRouteName="HomeWeather"
        screenOptions={{
          header: props => <PaperStackNavigationBar {...props} />,
        }}>
        <Stack.Screen
          name="HomeWeather"
          component={HomeWeatherScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Add" component={AddNewScreen} />
        <Stack.Screen name="ViewCard" component={ViewCardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});

export default App;
