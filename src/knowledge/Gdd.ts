import {calcGdd} from '../Knowledge';
import {GddTracker} from '../providers/statecontext/Trackers';
import {GDDAlgorithm} from '../providers/settingscontext/Types';
import {Location, LocationError} from '../providers/statecontext/Locations';

export function calc_gdd_total(
  item: GddTracker,
  locations: Location[],
  algorithm: GDDAlgorithm,
): number | LocationError {
  let itemsLocation = locations.find(loc => loc.name === item.location_name);
  if (itemsLocation === undefined)
    return {kind: 'MissingLocation', message: 'Location not found'};
  if (itemsLocation.weather === undefined)
    return {kind: 'MissingWeather', message: 'Weather was undefined'};
  const daily_gdds_filter = itemsLocation.weather.weather_array.filter(
    this_item =>
      // Locations has unix seconds time but item has unix ms
      this_item.date_unix >= item.start_date_unix_ms / 1000,
  );
  // TODO: Handle when base_temp may be F or C.
  const daily_gdds_arr = daily_gdds_filter.map(item_2 =>
    calcGdd(item_2.mintemp, item_2.maxtemp, item.base_temp, algorithm),
  );
  return Math.round(daily_gdds_arr.reduce((res, cur) => res + cur, 0));
}
