import React, {useContext} from 'react';
import {Text} from 'react-native-paper';
import {LineChart} from 'react-native-gifted-charts';
import {View} from 'react-native';
import {WeatherContext} from './WeatherContext';
import {AppScreenProps} from './Navigation';
import {calcGdd} from './Knowledge';
import {GRAPH_WIDTH, T_BASE} from './Consts';

function ViewCardScreen({route}: AppScreenProps<'ViewCard'>) {
  const item = route.params.gddCard;
  const {historical: daily_gdds, forecast: daily_forecast} =
    useContext(WeatherContext);
  const daily_gdds_filter = daily_gdds.forecasts.filter(
    this_item => this_item.date >= item.start_date,
  );
  const daily_gdds_arr = daily_gdds_filter.map(item_2 =>
    calcGdd(item_2.mintemp_c, item_2.maxtemp_c, T_BASE),
  );
  const daily_forecast_arr = daily_forecast.forecasts.map(item_2 =>
    calcGdd(item_2.mintemp_c, item_2.maxtemp_c, T_BASE),
  );
  const accum_gdds = daily_gdds_arr.map(
    (
      sum => value =>
        (sum += value)
    )(0),
  );
  const daily_gdds_data = daily_gdds_arr.map(element => ({
    value: element,
  }));
  const daily_forecast_data = daily_forecast_arr.map(element => ({
    value: element,
  }));
  const accum_gdds_data = accum_gdds.map(element => ({
    value: element,
    dataPointText: Math.round(element).toString(),
  }));
  return (
    <View>
      <Text>{item.name}</Text>
      <View>
        <LineChart
          data={accum_gdds_data}
          width={GRAPH_WIDTH}
          isAnimated
          curved
          showScrollIndicator
          secondaryData={daily_gdds_data}
          data2={daily_forecast_data}
          color2={'blue'}
          strokeDashArray1={[3, 3]}
          strokeDashArray2={[3, 3]}
          secondaryLineConfig={{color: 'blue'}}
          secondaryYAxis={{yAxisColor: 'blue'}}
        />
      </View>
    </View>
  );
}

export default ViewCardScreen;
