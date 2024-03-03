// Module intended to contain state management logic for app.

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
