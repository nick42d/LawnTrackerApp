/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import type {StackHeaderProps} from '@react-navigation/stack';
import {getHeaderTitle} from '@react-navigation/elements';
import {Appbar, MD3DarkTheme, withTheme} from 'react-native-paper';
import AddNewScreen from './screens/AddNew';
import ViewCardScreen from './screens/ViewCard';
import {onDisplayNotification} from './Notification';
import {RootStackParamList} from './screens/Navigation';
import {WeatherContextProvider} from './providers/WeatherContext';
import {HomeWeatherDrawerWrapper} from './screens/Home';
import {SettingsContextProvider} from './providers/SettingsContext';

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    // TODO: Where to put safe area? May be implicit in PaperProvider already?
    <SettingsContextProvider>
      <WeatherContextProvider>
        <AppRootStackNavigator />
      </WeatherContextProvider>
    </SettingsContextProvider>
  );
}

function AppRootStackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HomeWeather"
        screenOptions={{
          header: props => <AppStackNavigationBar {...props} />,
        }}>
        <Stack.Screen
          name="HomeWeather"
          component={HomeWeatherDrawerWrapper}
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
