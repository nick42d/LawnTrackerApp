import {Weather} from '../../api/Types';

export type AddLocation = Omit<Location, 'weather' | 'weatherStatus'>;

export type Location = {
  name: string;
  latitude: number;
  longitude: number;
  weather: Weather | undefined;
  weatherStatus: WeatherStatus;
};

export type WeatherStatus = {
  lastRefreshedUnixMs: number | undefined;
  status: 'Initialised' | 'Refreshing' | 'Loaded' | 'Error';
};

export function newWeatherStatus(): WeatherStatus {
  return {lastRefreshedUnixMs: undefined, status: 'Initialised'};
}

export type LocationError =
  | TimeoutLocationError
  | MissingDaysLocationError
  | MissingLocationLocationError
  | MissingWeatherLocationError;

export type TimeoutLocationError = {
  kind: 'Timeout';
  message: string;
};

export type MissingDaysLocationError = {
  kind: 'MissingDays';
  message: string;
};

export type MissingLocationLocationError = {
  kind: 'MissingLocation';
  message: string;
};

export type MissingWeatherLocationError = {
  kind: 'MissingWeather';
  message: string;
};
