import React, {useContext} from 'react';
import {Text} from 'react-native-paper';
import {LineChart} from 'react-native-gifted-charts';
import {View} from 'react-native';
import {LocationsContext} from '../providers/LocationsContext';
import {calcGdd} from '../Knowledge';
import {GRAPH_WIDTH, T_BASE} from '../Consts';
import {AppScreenProps} from '../navigation/Root';
import {GddTracker} from '../Types';
import {Location, WeatherAppForecast} from '../state/State';

const ESTIMATED_DAYS = 5;

type GraphPlotItem = {value: number; label: string};
type GddGraphPlot = {
  items: GraphPlotItem[];
  forecast_start: number;
  estimate_start: number;
};

function listAverage(list: number[]): number {
  if (list.length === 0) return 0;
  return list.reduce((sum, acc) => acc + sum, 0) / list.length;
}
function forecastsToGddArr(
  forecasts: WeatherAppForecast[] | undefined,
  startDateUnix: number,
  tBase: number,
): number[] {
  if (forecasts === undefined) return [];
  return forecasts
    .filter(x => x.date_unix >= startDateUnix)
    .map(x => calcGdd(x.mintemp_c, x.maxtemp_c, tBase));
}
function getGraphPlot(
  item: GddTracker,
  locations: Location[],
): GddGraphPlot | undefined {
  const startDateUnix = item.start_date_unix_ms / 1000;
  const tBase = item.base_temp;
  const itemLocation = locations.find(loc => loc.name === item.location_name);
  if (itemLocation === undefined) return undefined;
  const history_gdd_arr = forecastsToGddArr(
    itemLocation.weather.historical,
    startDateUnix,
    tBase,
  );
  const forecast_gdd_arr = forecastsToGddArr(
    itemLocation.weather.forecast,
    startDateUnix,
    tBase,
  );
  const average_gdd = listAverage(history_gdd_arr.concat(forecast_gdd_arr));
  const estimate_gdd_arr = Array(ESTIMATED_DAYS).fill(average_gdd);
  const forecast_start = history_gdd_arr.length;
  const estimate_start = forecast_start + forecast_gdd_arr.length;
  let sum = 0;
  const items: GraphPlotItem[] = history_gdd_arr
    .concat(forecast_gdd_arr)
    .concat(estimate_gdd_arr)
    .map((x, i) => {
      sum += x;
      // TODO: Date here
      return {value: sum, label: i.toString()};
    });
  return {items, forecast_start, estimate_start};
}

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
