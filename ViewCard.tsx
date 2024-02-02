import React, {useContext} from 'react';
import {Text} from 'react-native-paper';
import type {GddTracker} from './Types';
import {LineChart} from 'react-native-gifted-charts';
import {View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {AppStackParamList, daily_gdds_context} from './App';

type Props = StackScreenProps<AppStackParamList, 'ViewCard'>;

function ViewCardScreen({route}: Props) {
  const item = route.params.gddCard;
  const daily_gdds = useContext(daily_gdds_context);
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
      <Text>{item.name}</Text>
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
