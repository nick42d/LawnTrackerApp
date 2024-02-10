import React, {useContext} from 'react';
import {Text} from 'react-native-paper';
import type {GddTracker} from './Types';
import {List} from 'react-native-paper';
import {LineChart} from 'react-native-gifted-charts';
import {View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {AppStackParamList, daily_gdds_context} from './App';

function ViewWeatherScreen() {
  const daily_gdds = useContext(daily_gdds_context);
  return (
    <View>
      <List.Section>
        <List.Subheader>Weather</List.Subheader>
        {daily_gdds.map(gdd => (
          <List.Item title={gdd.date.toString()} description={gdd.gdd} />
        ))}
      </List.Section>
    </View>
  );
}

export default ViewWeatherScreen;
