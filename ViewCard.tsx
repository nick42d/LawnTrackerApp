import React from 'react';
import {Text} from 'react-native-paper';
import type {GddTracker} from './Types';
import {LineChart} from 'react-native-gifted-charts';
import {View} from 'react-native';

function ViewCardScreen() {
  const example_gdd: GddTracker = {
    location: 'Perth',
    description: 'Back lawn PGR',
    name: 'Buffalo',
    start_date: new Date('1/1/22'),
    target_gdd: 255,
    temp_cur_gdd: 240,
    base_temp: 0,
    id: 0,
  };
  const daily_gdds = [10, 20, 25, 10, 15, 5];
  const accum_gdds = daily_gdds.map(
    (
      sum => value =>
        (sum += value)
    )(0),
  );
  const daily_gdds_data = daily_gdds.map(element => ({
    value: element,
  }));
  const accum_gdds_data = accum_gdds.map(element => ({
    value: element,
  }));
  return (
    <View>
      <LineChart
        data={accum_gdds_data}
        isAnimated
        curved
        secondaryData={daily_gdds_data}
        secondaryLineConfig={{color: 'blue'}}
        secondaryYAxis={{yAxisColor: 'blue'}}
      />
    </View>
  );
}

export default ViewCardScreen;
