import React, {useContext} from 'react';
import {Text, useTheme} from 'react-native-paper';
import {LineChart} from 'react-native-gifted-charts';
import {View} from 'react-native';
import {calcGdd} from '../Knowledge';
import {GRAPH_WIDTH} from '../Consts';
import {AppScreenProps} from '../navigation/Root';
import {GddTracker} from '../providers/statecontext/Trackers';
import {Location} from '../providers/statecontext/Locations';
import {getGraphPlot, trimGraphPlotLabels} from '../plot/Gdd';
import {SettingsContext} from '../providers/SettingsContext';
import {StateContext} from '../providers/StateContext';
import {TrackerProps} from '../components/TrackerProps';
import {PlotLegend} from '../components/PlotLegend';
import {checkWeatherInvariants} from '../api/Types';

const HISTORICAL_COLOR = 'green';
const FORECASTED_COLOR = 'yellowgreen';
const ESTIMATED_COLOR = 'skyblue';
const TARGET_COLOR = 'orangered';

export default function ViewTrackerScreen({
  route,
}: AppScreenProps<'ViewTracker'>) {
  const {locations} = useContext(StateContext);
  const {settings} = useContext(SettingsContext);
  const theme = useTheme();
  const item = route.params.tracker;
  // Temp check for invariants
  locations.map(l => {
    console.log('Checking invariant weather at ' + l.name);
    if (l.weather === undefined) {
      console.log('Weather undefined');
      return;
    }
    console.log(JSON.stringify(checkWeatherInvariants(l.weather)));
  });
  const plot =
    item.kind === 'gdd'
      ? getGraphPlot(item, locations, settings.algorithm)
      : undefined;
  const forecast_start = plot?.forecast_start as number;
  const estimate_start = plot?.estimate_start as number;
  const segments = [
    {
      startIndex: forecast_start - 1,
      endIndex: estimate_start - 1,
      strokeDashArray: [6, 4],
      color: FORECASTED_COLOR,
    },
    {
      startIndex: estimate_start - 1,
      endIndex: plot?.items.length as number,
      strokeDashArray: [6, 4],
      color: ESTIMATED_COLOR,
    },
  ];
  const data = plot ? trimGraphPlotLabels(plot.items) : [];
  return (
    <View>
      <TrackerProps tracker={item} />
      {item.kind === 'gdd' && plot !== undefined ? (
        <View style={{rowGap: 30}}>
          <PlotLegend
            points={[
              {name: 'historical', color: HISTORICAL_COLOR},
              {name: 'forecasted', color: FORECASTED_COLOR},
              {name: 'estimated', color: ESTIMATED_COLOR},
              {name: 'target', color: TARGET_COLOR},
            ]}
          />
          <LineChart
            data={data}
            lineSegments={segments}
            width={GRAPH_WIDTH}
            showReferenceLine1
            referenceLine1Config={{
              thickness: 2,
              color: TARGET_COLOR,
              dashWidth: 10,
              dashGap: 10,
            }}
            referenceLine1Position={item.target_gdd}
            isAnimated
            curved
            yAxisTextStyle={{color: theme.colors.onSurface}}
            yAxisColor={theme.colors.onSurface}
            xAxisColor={theme.colors.onSurface}
            xAxisLabelTextStyle={{width: 80, color: theme.colors.onSurface}}
            xAxisIndicesWidth={60}
            spacing={20}
            thickness={3}
            showScrollIndicator
            color={HISTORICAL_COLOR}
            hideDataPoints
            showVerticalLines
          />
        </View>
      ) : undefined}
    </View>
  );
}
