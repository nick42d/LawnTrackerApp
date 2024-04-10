import {DATE_PICKER_LOCALE, ESTIMATED_DAYS} from '../Consts';
import {calcGdd} from '../Knowledge';
import {GddTracker} from '../providers/statecontext/Trackers';
import {WeatherAppDay} from '../api/Types';
import {GDDAlgorithm} from '../providers/settingscontext/Types';
import {Location, WeatherStatus} from '../providers/statecontext/Locations';
import {format} from 'date-fns';
import {AddDays} from '../Utils';
import {addDays} from 'date-fns/addDays';

// TODO: Remove unimplemented
const PLOT_WEATHER_TYPES = ['Historical', 'Forecasted', 'Estimated'] as const;
export type PlotWeatherType = (typeof PLOT_WEATHER_TYPES)[number];

export type GddEstimate = {
  estimateType: PlotWeatherType;
  estimateDateUnixMs: number;
};
export type GraphPlotItem = {
  value: number;
  label?: string;
  dataPointText: string;
};
export type DailyGdd = {
  gdd: number;
  dateUnix: number;
  weatherType: PlotWeatherType;
};
export type DailyGddAcc = DailyGdd & {gddAcc: number};
export type GddGraphPlot = {
  items: GraphPlotItem[];
  forecastStartIndex: number;
  estimateStartIndex: number;
};

function listAverage(list: number[]): number {
  if (list.length === 0) return 0;
  return list.reduce((sum, acc) => acc + sum, 0) / list.length;
}
function weatherDaysToGddArr(
  forecasts: WeatherAppDay[],
  startDateUnix: number,
  tBase: number,
  algorithm: GDDAlgorithm,
): DailyGdd[] {
  if (forecasts === undefined) return [];
  return forecasts
    .filter(x => x.date_unix >= startDateUnix)
    .map(x => ({
      gdd: calcGdd(x.mintemp, x.maxtemp, tBase, algorithm),
      dateUnix: x.date_unix,
      weatherType: x.weather_type,
    }));
}
function estimateToGddArr(
  estimate: number,
  startDateUnixMs: number,
  numberDays: number,
): DailyGdd[] {
  return Array(numberDays)
    .fill(estimate)
    .map((x, i) => ({
      gdd: x,
      dateUnix: addDays(startDateUnixMs, i).valueOf() / 1000,
      weatherType: 'Estimated',
    }));
}
/// This can return undefined, in the exception case that the tracker doesn't have a corresponding location.
/// Or the location doesn't have corresponding weather.
export function getTrackerGddArray(
  item: GddTracker,
  locations: Location[],
  algorithm: GDDAlgorithm,
): DailyGddAcc[] | undefined {
  const startDateUnix = item.start_date_unix_ms / 1000;
  const tBase = item.base_temp;
  // Consider creating this as a context method.
  const itemLocation = locations.find(loc => loc.apiId === item.locationId);
  if (itemLocation === undefined) return undefined;
  if (itemLocation.weather === undefined) return undefined;
  const historyAndForecastGddArray = weatherDaysToGddArr(
    itemLocation.weather.weather_array,
    startDateUnix,
    tBase,
    algorithm,
  );
  // Estimate is based off average of history and forecast.
  const average_gdd = listAverage(historyAndForecastGddArray.map(x => x.gdd));
  // Weather array may be empty
  const maybeLastNonEstimateDayUnix =
    historyAndForecastGddArray.at(-1)?.dateUnix;
  // If so, last non-estimate day is the day before start date.
  const firstEstimateDayUnixMs = maybeLastNonEstimateDayUnix
    ? addDays(new Date(maybeLastNonEstimateDayUnix * 1000), 1).valueOf()
    : item.start_date_unix_ms;
  const estimateGddArray = estimateToGddArr(
    average_gdd,
    firstEstimateDayUnixMs,
    ESTIMATED_DAYS,
  );
  let sum = 0;
  return historyAndForecastGddArray.concat(estimateGddArray).map(x => {
    sum += x.gdd;
    // TODO: Prevent crash if empty
    return {...x, gddAcc: sum};
  });
}
export function getGraphPlot(trackerGddArray: DailyGddAcc[]): GddGraphPlot {
  const forecastStartIndex = trackerGddArray.findIndex(
    x => x.weatherType === 'Forecasted',
  );
  const estimateStartIndex = trackerGddArray.findIndex(
    x => x.weatherType === 'Estimated',
  );
  const items: GraphPlotItem[] = trackerGddArray.map((x, idx) => {
    const dateString = format(new Date(x.dateUnix * 1000), 'EEEEEE dd/MM');
    if (idx % 7 === 0) {
      return {value: x.gddAcc, label: dateString, dataPointText: dateString};
    }
    return {value: x.gddAcc, dataPointText: dateString};
  });
  return {
    items,
    forecastStartIndex,
    estimateStartIndex,
  };
}
/// Returns undefined if not able to produce an estimate.
/// TODO: Implement forward lookup if needed, estimate should always be possible.
export function getGddEstimate(
  gddArray: DailyGddAcc[],
  targetGdd: number,
): GddEstimate | undefined {
  const estimatedDayItem = gddArray.find(x => x.gddAcc >= targetGdd);
  if (estimatedDayItem === undefined) return undefined;
  return {
    estimateDateUnixMs: estimatedDayItem.dateUnix * 1000,
    estimateType: estimatedDayItem.weatherType,
  };
}
