import {HomeWeatherTabParamList} from './Root';
import {Icon} from 'react-native-paper';
import LocationsScreen from '../screens/Locations';
import HomeScreen from '../screens/Home';
import {createMaterialBottomTabNavigator} from 'react-native-paper/react-navigation';

const Tab = createMaterialBottomTabNavigator<HomeWeatherTabParamList>();

export function HomeWeatherScreen(): React.JSX.Element {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Icon source="home" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Locations"
        component={LocationsScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Icon source="map" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
