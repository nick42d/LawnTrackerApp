// Module intended to contain state management logic for app.

import { GddTracker, Tracker } from '../Types';
import { Weather } from '../api/Types';

export type SettingsState = {
  settings: Settings;
  status: ContextStatus;
  setSettings: ((settings: Settings) => void) | undefined;
};

export type ContextStatus = 'Initialised' | 'Loading' | 'Loaded';

export type Settings = {
  algorithm: GDDAlgorithm;
  warning_threshold_perc: number;
  unit_of_measure: UnitOfMeasure;
  auto_dark_mode: boolean;
  dark_mode_enabled: boolean;
  default_base_temp: BaseTemp;
  api_key: string | undefined;
};

export enum GDDAlgorithm {
  // As per wikipedia definitions: https://en.wikipedia.org/wiki/Growing_degree-day
  VariantA,
  VariantB,
}

export function gddAlgorithmToText(algorithm: GDDAlgorithm) {
  switch (algorithm) {
    case GDDAlgorithm.VariantA: {
      return 'Variant A';
    }
    case GDDAlgorithm.VariantB: {
      return 'Variant B';
    }
  }
}
export function unitOfMeasureToText(unit: UnitOfMeasure) {
  switch (unit) {
    case UnitOfMeasure.Imperial: {
      return 'Imperial';
    }
    case UnitOfMeasure.Metric: {
      return 'Metric';
    }
  }
}

export enum UnitOfMeasure {
  Imperial,
  Metric,
}

export enum BaseTemp {
  Zero = 0,
  Ten = 10,
}

export type StateManager = {
  locations: Location[];
  trackers: Tracker[];
  status: ContextStatus;
  refreshWeather: () => void;
  addLocation: (loc: Location) => void;
  deleteLocationName: (locName: string) => void;
  addTracker: (tracker: Tracker) => void;
  deleteTrackerName: (trackerName: string) => void;
  resetGddTrackerName: (trackerName: string) => void;
};

export type AddLocation = Omit<Location, 'weather'>;

export type Location = {
  name: string;
  latitude: number;
  longitude: number;
  weather: Weather | undefined;
};
