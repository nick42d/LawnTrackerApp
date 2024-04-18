import {calcGdd} from '../Knowledge';
import {GddTracker} from '../providers/statecontext/Trackers';
import {GddAlgorithm} from '../providers/settingscontext/Types';
import {Location, LocationError} from '../providers/statecontext/Locations';

export function calcGddTotal(
  item: GddTracker,
  locations: Location[],
  algorithm: GddAlgorithm,
): number | LocationError {
  let itemsLocation = locations.find(loc => loc.apiId === item.locationId);
  if (itemsLocation === undefined)
    return {kind: 'MissingLocation', message: 'Location not found'};
  if (itemsLocation.weather === undefined)
    return {kind: 'MissingWeather', message: 'Weather was undefined'};
  const daily_gdds_filter = itemsLocation.weather.weatherArray.filter(
    this_item =>
      this_item.dateUnixMs >= item.start_date_unix_ms &&
      // Currently, the key distinction for including GDD is if it's historical, but we could also / instead look at date.
      this_item.weatherType === 'Historical',
  );
  // TODO: Handle when base_temp may be F or C.
  const daily_gdds_arr = daily_gdds_filter.map(item_2 =>
    calcGdd(item_2.minTemp, item_2.maxTemp, item.base_temp, algorithm),
  );
  return Math.round(daily_gdds_arr.reduce((res, cur) => res + cur, 0));
}

export function isWeatherRefreshing(
  item: GddTracker,
  locations: Location[],
): boolean | LocationError {
  let itemsLocation = locations.find(loc => loc.apiId === item.locationId);
  if (itemsLocation === undefined)
    return {kind: 'MissingLocation', message: 'Location not found'};
  return itemsLocation.weatherStatus.status === 'Refreshing';
}

export function isWeatherInitialized(
  item: GddTracker,
  locations: Location[],
): boolean | LocationError {
  let itemsLocation = locations.find(loc => loc.apiId === item.locationId);
  if (itemsLocation === undefined)
    return {kind: 'MissingLocation', message: 'Location not found'};
  return itemsLocation.weatherStatus.status === 'Initialised';
}
