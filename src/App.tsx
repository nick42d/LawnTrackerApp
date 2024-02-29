/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import type {StackHeaderProps} from '@react-navigation/stack';
import {HeaderButtonProps, getHeaderTitle} from '@react-navigation/elements';
import {Appbar} from 'react-native-paper';
import AddNewScreen from './AddNew';
import ViewCardScreen from './ViewCard';
import {onDisplayNotification} from './Notification';
import {RootStackParamList} from './Navigation';
import {WeatherContextProvider} from './WeatherContext';
import HomeWeatherDrawerWrapper from './Home';

const Stack = createStackNavigator<RootStackParamList>();
function App(): React.JSX.Element {
  return (
    // TODO: Where to put safe area? May be implicit in PaperProvider already?
    <WeatherContextProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="HomeWeather"
          screenOptions={{
            header: props => <PaperStackNavigationBar {...props} />,
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
