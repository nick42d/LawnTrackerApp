export type GddTracker = {
  name: string;
  description: string;
  target_gdd: number;
  base_temp: number;
  // TODO: Date library
  start_date: string;
  // TODO: Location library
  location: string;
  // Temporary value to mock current GDD
  // Replace with: Calculation of GDD given weather stats from API
  // Or cache of the same
  temp_cur_gdd: number;
};

export type GddSettings = {
  low_alert_threshold_perc: number;
};
