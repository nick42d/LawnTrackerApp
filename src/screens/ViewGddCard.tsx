import React, {useContext} from 'react';
import {Text} from 'react-native-paper';
import {LineChart} from 'react-native-gifted-charts';
import {View} from 'react-native';
import {LocationsContext} from '../providers/LocationsContext';
import {calcGdd} from '../Knowledge';
import {GRAPH_WIDTH, T_BASE} from '../Consts';
import {AppScreenProps} from '../navigation/Root';

export default function ViewGddCardScreen({
  route,
}: AppScreenProps<'ViewGddCard'>) {
  const {locations} = useContext(LocationsContext);
  const item = route.params.gddCard;
  // if locations
  // const daily_gdds_filter = daily_gdds.forecasts.filter(
  //   this_item => this_item.date >= item.start_date,
  // );
  // const daily_gdds_arr = daily_gdds_filter.map(item_2 => ({
  //   value: calcGdd(item_2.mintemp_c, item_2.maxtemp_c, T_BASE),
  //   label: item_2.date.getDate().toString(),
  // }));
  // const daily_forecast_arr = daily_forecast.forecasts.map(item_2 => ({
  //   value: calcGdd(item_2.mintemp_c, item_2.maxtemp_c, T_BASE),
  //   label: item_2.date.getDate().toString(),
  // }));
  // const daily_concat = daily_gdds_arr.concat(daily_forecast_arr);
  // // TODO: neaten
  // const daily_gdds_values = daily_gdds_arr.map(ele => ele.value);
  // const daily_gdds_acc = daily_gdds_values.map(
  //   (
  //     sum => value =>
  //       (sum += value)
  //   )(0),
  // );
  // const daily_gdds_acc_arr = daily_gdds_acc.map((val, idx) => ({
  //   value: val,
  //   label: daily_gdds_arr[idx].label,
  // }));
  return (
    <View>
      <Text>{item.name}</Text>
      <View>
        <LineChart
        // data={daily_concat}
        // lineSegments={[
        //   {startIndex: 6, endIndex: 99, strokeDashArray: [3, 3]},
        // ]}
        // width={GRAPH_WIDTH}
        // showReferenceLine1
        // referenceLine1Position={15}
        // isAnimated
        // curved
        // showScrollIndicator
        // secondaryData={daily_gdds_acc_arr}
        // secondaryLineConfig={{color: 'blue'}}
        // secondaryYAxis={{yAxisColor: 'blue'}}
        />
      </View>
    </View>
  );
}
