/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {getHeaderTitle} from '@react-navigation/elements';
import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Appbar} from 'react-native-paper';
import HomeScreen from './Home';
import AddNewScreen from './AddNew';
import ViewCardScreen from './ViewCard';

const Stack = createStackNavigator();

function PaperStackNavigationBar({
  navigation,
  back,
  route,
  options,
}): React.JSX.Element {
  const title = getHeaderTitle(options, route.name);
  return (
    <Appbar.Header>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}

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
