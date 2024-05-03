import {LineChart} from 'react-native-gifted-charts';
import {GddGraphPlot} from './gddplot/Plot';
import {Text, useTheme} from 'react-native-paper';
import {View, useWindowDimensions} from 'react-native';
import {PlotLegend} from './gddplot/PlotLegend';

const HISTORICAL_COLOR = 'green';
const FORECASTED_COLOR = 'yellowgreen';
const ESTIMATED_COLOR = 'skyblue';
const TARGET_COLOR = 'orangered';
const GRAPH_X_SPACING = 25;

export function GddPlot(props: {
  data: GddGraphPlot;
  targetGdd: number;
}): React.JSX.Element {
  const theme = useTheme();
  const {width} = useWindowDimensions();

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
      <View>
        <Text
          variant="titleLarge"
          style={{
            textAlign: 'center',
            textAlignVertical: 'center',
          }}>
          GDD Total by Date
        </Text>
      </View>
      <PlotLegend
        points={[
          {name: 'Historical', color: HISTORICAL_COLOR},
          {name: 'Forecasted', color: FORECASTED_COLOR},
          {name: 'Estimated', color: ESTIMATED_COLOR},
          {name: 'Target', color: TARGET_COLOR},
        ]}
      />
      <LineChart
        data={props.data.items}
        lineSegments={segments}
        width={Math.min(width - 20, props.data.items.length * GRAPH_X_SPACING)}
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
        focusEnabled
        showStripOnFocus
        showTextOnFocus
        // TODO: Better handle large arrays
        stripHeight={999}
        stripColor={theme.colors.primaryContainer}
        spacing={GRAPH_X_SPACING}
        thickness={3}
        showScrollIndicator
        color={HISTORICAL_COLOR}
        showVerticalLines
        dataPointsRadius={0}
      />
    </View>
  );
}
