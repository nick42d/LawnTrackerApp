import React, {useContext} from 'react';
import {Text} from 'react-native-paper';
import {LineChart} from 'react-native-gifted-charts';
import {View} from 'react-native';
import {calcGdd} from '../Knowledge';
import {GRAPH_WIDTH} from '../Consts';
import {AppScreenProps} from '../navigation/Root';
import {GddTracker} from '../Types';
import {Location} from '../state/State';
import {getGraphPlot} from '../plot/Gdd';
import {SettingsContext} from '../providers/SettingsContext';
import {StateContext} from '../providers/StateContext';

export default function ViewGddCardScreen({
  route,
}: AppScreenProps<'ViewGddCard'>) {
  const {locations} = useContext(StateContext);
  const {settings} = useContext(SettingsContext);
  const item = route.params.gddCard;
  const plot = getGraphPlot(item, locations, settings.algorithm);
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
      <Text variant="displaySmall">{item.name}</Text>
      <Text>{item.description}</Text>
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
          rotateLabel
          xAxisIndicesWidth={60}
          spacing={60}
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
