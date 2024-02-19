import React, {useContext} from 'react';
import {Text} from 'react-native-paper';
import {List} from 'react-native-paper';
import {LineChart} from 'react-native-gifted-charts';
import {ScrollView} from 'react-native';
import {calcGdd} from './Knowledge';
import {WeatherContext} from './WeatherContext';
import {T_BASE} from './Consts';

function ViewWeatherScreen(): React.JSX.Element {
  const weather = useContext(WeatherContext);
  function gdds_data() {
    return weather.forecasts.map(day => ({
      value: calcGdd(day.mintemp_c, day.maxtemp_c, T_BASE),
    }));
  }
  return (
    <ScrollView>
      <Text>{weather.location}</Text>
      <List.Section>
        <List.Subheader>Weather</List.Subheader>
        {weather.forecasts.map(gdd => (
          <List.Item title={gdd.date.toString()} description={gdd.mintemp_c} />
        ))}
        <LineChart data={gdds_data()} isAnimated curved adjustToWidth />
      </List.Section>
    </ScrollView>
  );
}

export default ViewWeatherScreen;
