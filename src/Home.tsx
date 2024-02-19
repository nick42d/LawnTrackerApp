import {Button, Card, FAB, Icon, Text} from 'react-native-paper';
import {FlatList, StyleSheet, View} from 'react-native';
import {GddTracker} from './Types';
import {GddSettings} from './Configuration';
import {useContext, useState} from 'react';
import {HomeWeatherTabParamList, HomeWeatherTabScreenProps} from './Navigation';
import {createMaterialBottomTabNavigator} from 'react-native-paper/react-navigation';
import ViewWeatherScreen from './ViewWeather';
import React from 'react';
import {WeatherContext} from './WeatherContext';
import {calcGdd} from './Knowledge';
import {T_BASE} from './Consts';

const Tab = createMaterialBottomTabNavigator<HomeWeatherTabParamList>();

type CardPropsParamList = {
  item: GddTracker;
  settings: GddSettings;
  navigation: HomeWeatherTabScreenProps<'Home'>['navigation'];
  onDelete: () => void;
  onReset: () => void;
};

function HomeWeatherScreen(): React.JSX.Element {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreenCardList}
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
  );
}

function HomeScreenCardList({
  route,
  navigation,
}: HomeWeatherTabScreenProps<'Home'>) {
  const example_gdds: Array<GddTracker> = [
    {
      location: 'Perth',
      description: 'Both Lawns',
      name: 'Buffalo',
      start_date: new Date('2024-2-18'),
      target_gdd: 250,
      temp_cur_gdd: 240,
      base_temp: 0,
      id: 0,
    },
    {
      location: 'Perth',
      description: 'Front lawn PGR',
      name: 'Bermuda',
      start_date: new Date('2024-1-2'),
      target_gdd: 240,
      temp_cur_gdd: 260,
      base_temp: 0,
      id: 1,
    },
    {
      location: 'Perth',
      description: 'Front lawn PGR',
      name: 'Bermuda',
      start_date: new Date('2024-1-10'),
      target_gdd: 240,
      temp_cur_gdd: 160,
      base_temp: 0,
      id: 2,
    },
    {
      location: 'Perth',
      description: 'Front lawn PGR',
      name: 'Bermuda',
      start_date: new Date('2024-1-22'),
      target_gdd: 240,
      temp_cur_gdd: 160,
      base_temp: 0,
      id: 3,
    },
  ];
  const [example_gdds_state, set_example_gdds_state] = useState(example_gdds);
  React.useEffect(() => {
    // Does not handle IDs correctly.
    if (route.params?.add_gdd) {
      const example_gdds_state_temp = example_gdds_state;
      example_gdds_state_temp.push(route.params.add_gdd);
      set_example_gdds_state(example_gdds_state_temp);
    }
  }, [route.params?.add_gdd]);

  function deleteId(id: number) {
    set_example_gdds_state(
      example_gdds_state.filter(element => element.id != id),
    );
  }
  function resetId(id: number) {
    const new_state = example_gdds_state.map(element =>
      element.id === id
        ? {...element, temp_cur_gdd: 0, start_date: new Date(Date.now())}
        : element,
    );
    set_example_gdds_state(new_state);
  }

  let example_settings: GddSettings = {
    low_alert_threshold_perc: 0.8,
    algorithm: 1,
    unit_of_measure: 1,
  };

  return (
    <View style={{flex: 1}}>
      <FlatList
        data={example_gdds_state}
        renderItem={({item}) => (
          <GddCard
            item={item}
            settings={example_settings}
            navigation={navigation}
            onDelete={() => deleteId(item.id)}
            onReset={() => resetId(item.id)}
          />
        )}
      />
      <FAB
        icon={'plus'}
        onPress={() => {
          console.log('Pressed plus button');
          navigation.navigate('Add');
        }}
        style={[styles.fabStyle]}
      />
    </View>
  );
}

function GddCard({
  item,
  onReset,
  onDelete,
  settings,
  navigation,
}: CardPropsParamList) {
  function calc_gdd_total() {
    const daily_gdds = useContext(WeatherContext);
    const daily_gdds_filter = daily_gdds.forecasts.filter(
      this_item => this_item.date >= item.start_date,
    );
    const daily_gdds_arr = daily_gdds_filter.map(item_2 =>
      calcGdd(item_2.mintemp_c, item_2.maxtemp_c, T_BASE),
    );
    return Math.round(daily_gdds_arr.reduce((res, cur) => res + cur, 0));
  }
  const actual_gdd = calc_gdd_total();
  return (
    <Card
      mode="elevated"
      style={GetGddCardStyle(settings, actual_gdd, item.target_gdd)}
      onPress={() => {
        console.log('Pressed card');
        navigation.navigate('ViewCard', {
          gddCard: item,
        });
      }}>
      <Card.Title
        title={item.name}
        subtitle={item.description}
        left={() => <Text variant="bodyLarge">{actual_gdd}</Text>}
      />
      <Card.Content>
        <Text>
          <Icon source="map-marker" size={20} />
          {item.location}
        </Text>
        <Text>
          <Icon source="calendar-start" size={20} />
          {item.start_date.toDateString()}
        </Text>
        <Text>
          <Icon source="target" size={20} />
          {item.target_gdd}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={onReset}>
          <Icon source="rotate-left" size={20} />
          Reset
        </Button>
        <Button onPress={onDelete}>
          <Icon source="delete" size={20} />
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  listItem: {
    padding: 5,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  listItemAmber: {
    padding: 5,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: 'orange',
  },
  listItemRed: {
    padding: 5,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: 'red',
  },
  fabStyle: {
    bottom: 16,
    right: 16,
    position: 'absolute',
  },
});

function GetGddCardStyle(settings: GddSettings, cur: number, target: number) {
  const progress = cur / target;
  if (progress >= 1) {
    return styles.listItemRed;
  } else if (progress >= settings.low_alert_threshold_perc) {
    return styles.listItemAmber;
  } else {
    return styles.listItem;
  }
}
export default HomeWeatherScreen;
