import {ESTIMATED_DAYS} from '../Consts';
import {calcGdd} from '../Knowledge';
import {GddTracker} from '../Types';
import {Location, WeatherAppForecast} from '../state/State';

export enum WeatherSource {
  Historical,
  Forecast,
  Estimated,
  // TODO: Remove
  Unimplemented,
}
export type GddEstimate = {
  estimateType: WeatherSource;
  estimateDateUnixMs: number;
};
export type GraphPlotItem = {value: number; label: string};
export type DailyGdd = {gdd: number; dateUnix: number};
export type GddGraphPlot = {
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
): DailyGdd[] {
  if (forecasts === undefined) return [];
  return forecasts
    .filter(x => x.date_unix >= startDateUnix)
    .map(x => ({
      gdd: calcGdd(x.mintemp_c, x.maxtemp_c, tBase),
      dateUnix: x.date_unix,
    }));
}
function estimateToGddArr(
  estimate: number,
  startDateUnix: number,
  numberDays: number,
): DailyGdd[] {
  return Array(numberDays)
    .fill(estimate)
    .map((x, i) => ({
      gdd: x,
      // Manual calculation to add days
      dateUnix: startDateUnix + (i + 1) * 60 * 60 * 24,
    }));
}
export function getGraphPlot(
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
  const average_gdd = listAverage(
    history_gdd_arr.concat(forecast_gdd_arr).map(x => x.gdd),
  );
  // TODO bounds check
  const lastForecastDateUnix =
    forecast_gdd_arr[forecast_gdd_arr.length - 1]?.dateUnix;
  const estimate_gdd_arr = estimateToGddArr(
    average_gdd,
    lastForecastDateUnix,
    ESTIMATED_DAYS,
  );
  const forecast_start = history_gdd_arr.length;
  const estimate_start = forecast_start + forecast_gdd_arr.length;
  let sum = 0;
  const items: GraphPlotItem[] = history_gdd_arr
    .concat(forecast_gdd_arr)
    .concat(estimate_gdd_arr)
    .map(x => {
      sum += x.gdd;
      // TODO: Prevent crash if empty
      // Need to convert from DateUnix to DateUnixMs...
      return {value: sum, label: new Date(x.dateUnix * 1000).toDateString()};
    });
  return {items, forecast_start, estimate_start};
}
export function getGddEstimate(
  temp: GddGraphPlot | undefined,
  targetGdd: number,
): GddEstimate | undefined {
  if (temp === undefined) return undefined;
  const estimatedDayItem = temp.items.find(x => x.value >= targetGdd);
  if (estimatedDayItem === undefined) return undefined;
  const estimatedDay = new Date(estimatedDayItem.label);
  return {
    estimateDateUnixMs: estimatedDay.getTime(),
    estimateType: WeatherSource.Unimplemented,
  };
}