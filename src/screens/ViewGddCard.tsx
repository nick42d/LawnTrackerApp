import React, {useContext} from 'react';
import {Text} from 'react-native-paper';
import {LineChart} from 'react-native-gifted-charts';
import {View} from 'react-native';
import {LocationsContext} from '../providers/LocationsContext';
import {calcGdd} from '../Knowledge';
import {GRAPH_WIDTH} from '../Consts';
import {AppScreenProps} from '../navigation/Root';
import {GddTracker} from '../Types';
import {Location, WeatherAppForecast} from '../state/State';
import {getGraphPlot} from '../plot/Gdd';

export default function ViewGddCardScreen({
  route,
}: AppScreenProps<'ViewGddCard'>) {
  const {locations} = useContext(LocationsContext);
  const item = route.params.gddCard;
  const plot = getGraphPlot(item, locations);
  const forecast_start = plot?.forecast_start as number;
  const estimate_start = plot?.estimate_start as number;
  const segments = [
    {
      startIndex: forecast_start - 1,
      endIndex: estimate_start - 1,
      strokeDashArray: [5, 5],
    },
    {
      startIndex: estimate_start - 1,
      endIndex: plot?.items.length as number,
      strokeDashArray: [2, 6],
    },
  ];
  const data = plot ? plot.items : [];
  return (
    <View>
      <Text>{item.name}</Text>
      <View>
        <LineChart
          data={data}
          lineSegments={segments}
          width={GRAPH_WIDTH}
          showReferenceLine1
          referenceLine1Config={{
            thickness: 3,
            color: 'red',
            dashWidth: 10,
            dashGap: -10,
          }}
          referenceLine1Position={item.target_gdd}
          isAnimated
          curved
          spacing={25}
          thickness={3}
          showScrollIndicator
          color="green"
          dataPointsColor="green"
          hideDataPoints
        />
      </View>
    </View>
  );
}
