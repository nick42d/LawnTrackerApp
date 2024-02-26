import React, {useContext, useState} from 'react';
import {Text} from 'react-native-paper';
import {List} from 'react-native-paper';
import {LineChart} from 'react-native-gifted-charts';
import {RefreshControl, ScrollView} from 'react-native';
import {calcGdd} from './Knowledge';
import {WeatherContext} from './WeatherContext';
import {GRAPH_WIDTH, T_BASE} from './Consts';

function ViewWeatherScreen(): React.JSX.Element {
  const {data: weather} = useContext(WeatherContext);
  const [refreshing, setRefreshing] = useState(false);
  const {refresh} = React.useContext(WeatherContext);
  const onRefresh = React.useCallback(() => {
    console.log('Refreshing Home screen');
    setRefreshing(true);
    refresh();
    setRefreshing(false);
  }, []);
  function gdds_data() {
    return weather.forecasts.map(day => ({
      value: calcGdd(day.mintemp_c, day.maxtemp_c, T_BASE),
    }));
  }
  function gdds_data_low() {
    return weather.forecasts.map(day => ({
      value: day.mintemp_c,
    }));
  }
  function gdds_data_high() {
    return weather.forecasts.map(day => ({
      value: day.maxtemp_c,
    }));
  }
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }>
      <Text>{weather.location}</Text>
      <List.Section>
        <List.Subheader>Weather</List.Subheader>
        {weather.forecasts.map(gdd => (
          <List.Item title={gdd.date.toString()} description={gdd.mintemp_c} />
        ))}
        <LineChart
          // TODO: Don't hardcode the width, get it from the device...
          width={GRAPH_WIDTH}
          data={gdds_data()}
          data2={gdds_data_low()}
          data3={gdds_data_high()}
          color1="green"
          color2="blue"
          color3="red"
          isAnimated
          curved
          adjustToWidth
        />
      </List.Section>
    </ScrollView>
  );
}

export default ViewWeatherScreen;
