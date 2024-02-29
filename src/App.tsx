/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import type {StackHeaderProps} from '@react-navigation/stack';
import {HeaderButtonProps, getHeaderTitle} from '@react-navigation/elements';
import {Appbar} from 'react-native-paper';
import HomeWeatherScreen from './Home';
import AddNewScreen from './AddNew';
import ViewCardScreen from './ViewCard';
import {onDisplayNotification} from './Notification';
import {RootStackParamList} from './Navigation';
import {WeatherContextProvider} from './WeatherContext';

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function App(): React.JSX.Element {
  return (
    // TODO: Where to put safe area? May be implicit in PaperProvider already?
    <WeatherContextProvider>
      <NavigationContainer>
        <Drawer.Navigator>
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
        </Drawer.Navigator>
      </NavigationContainer>
    </WeatherContextProvider>
  );
}

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

export default App;
