import React, {useContext, useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import {
  GddTracker,
  WeatherApiHistory,
  WeatherAppHistory,
  apiHistoryToAppHistory,
} from './Types';
import {List} from 'react-native-paper';
import {LineChart} from 'react-native-gifted-charts';
import {ScrollView, View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {AppStackParamList, daily_gdds_context} from './App';
import {API_KEY} from './apikey';

const PERTH_LAT = -31.9514;
const PERTH_LONG = 115.8617;

function ViewWeatherScreen() {
  const [this_state, set_this_state] = useState({
    location: 'loading',
    forecasts: [
      {
        date: new Date('01-01-2001'),
        maxtemp_c: 10,
        mintemp_c: 20,
      },
    ],
  });
  useEffect(() => {
    fetchWeatherHistorical(
      PERTH_LAT,
      PERTH_LONG,
      new Date('2024-1-1'),
      new Date('2024-1-24'),
    );
    return () => {
      ignore: true;
    };
    // Don't call useEffect if location hasn't changed.
    // Note, here this is called twice as location starts as 'loading' and then changes.
  }, [this_state.location]);
  function fetchWeatherHistorical(
    lat: number,
    long: number,
    start: Date,
    end: Date,
  ) {
    const start_unix = Math.floor(start.getTime() / 1000);
    const end_unix = Math.floor(end.getTime() / 1000);
    console.log(
      `Attempting to fetch from API ${start_unix} ${end_unix} ${Date.now()}`,
    );
    fetch(
      `http://api.weatherapi.com/v1/history.json?&key=${API_KEY}&q=${lat},${long}&unixdt=${start_unix}&unixend_dt=${end_unix}&hour=17`,
    )
      .then(res => res.json() as Promise<WeatherApiHistory>)
      .then(json => set_this_state(apiHistoryToAppHistory(json)));
  }
  return (
    <ScrollView>
      <Text>{this_state.location}</Text>
      <List.Section>
        <List.Subheader>Weather</List.Subheader>
        {this_state.forecasts.map(gdd => (
          <List.Item title={gdd.date.toString()} description={gdd.mintemp_c} />
        ))}
      </List.Section>
    </ScrollView>
  );
}

export default ViewWeatherScreen;
