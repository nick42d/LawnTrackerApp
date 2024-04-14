import {LineChart} from 'react-native-gifted-charts';
import {GddGraphPlot, GraphPlotItem} from './gddplot/Plot';
import {useTheme} from 'react-native-paper';
import {View} from 'react-native';
import {PlotLegend} from './PlotLegend';
import {GRAPH_WIDTH} from '../Consts';

const HISTORICAL_COLOR = 'green';
const FORECASTED_COLOR = 'yellowgreen';
const ESTIMATED_COLOR = 'skyblue';
const TARGET_COLOR = 'orangered';

export function GddPlot(props: {data: GddGraphPlot; targetGdd: number}) {
  const theme = useTheme();

  const forecast_start = props.data.forecastStartIndex as number;
  const estimate_start = props.data.estimateStartIndex as number;
  const segments = [
    {
      startIndex: Math.max(0, forecast_start - 1),
      endIndex: estimate_start - 1,
      strokeDashArray: [6, 4],
      color: FORECASTED_COLOR,
    },
    {
      startIndex: estimate_start - 1,
      endIndex: props.data.items.length as number,
      strokeDashArray: [6, 4],
      color: ESTIMATED_COLOR,
    },
  ];
  return (
    <View>
      <PlotLegend
        points={[
          {name: 'historical', color: HISTORICAL_COLOR},
          {name: 'forecasted', color: FORECASTED_COLOR},
          {name: 'estimated', color: ESTIMATED_COLOR},
          {name: 'target', color: TARGET_COLOR},
        ]}
      />
      <LineChart
        data={props.data.items}
        lineSegments={segments}
        width={GRAPH_WIDTH}
        showReferenceLine1
        referenceLine1Config={{
          thickness: 2,
          color: TARGET_COLOR,
          dashWidth: 10,
          dashGap: 10,
        }}
        referenceLine1Position={props.targetGdd}
        initialSpacing={0}
        isAnimated
        curved
        yAxisTextStyle={{color: theme.colors.onSurface}}
        yAxisColor={theme.colors.onSurface}
        xAxisColor={theme.colors.onSurface}
        xAxisLabelTextStyle={{width: 80, color: theme.colors.onSurface}}
        xAxisIndicesWidth={60}
        focusEnabled
        showStripOnFocus
        showTextOnFocus
        spacing={25}
        thickness={3}
        showScrollIndicator
        showValuesAsDataPointsText
        color={HISTORICAL_COLOR}
        hideDataPoints
        showVerticalLines
      />
    </View>
  );
}
