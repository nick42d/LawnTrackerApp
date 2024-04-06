
export function newGddTracker(
  name: string,
  description: string,
  location_name: string,
  target_gdd: number,
  base_temp: number,
  start_date: Date
): GddTracker {
  return {
    kind: 'gdd',
    location_name,
    description,
    name,
    target_gdd,
    base_temp,
    start_date_unix_ms: start_date.valueOf(),
    trackerStatus: 'Running',
    notificationStatus: newNotificationStatus(),
  };
}

export function newCalendarTracker(
  name: string,
  description: string,
  target_date: Date
): CalendarTracker {
  return {
    kind: 'calendar',
    description,
    name,
    target_date_unix_ms: target_date.valueOf(),
    trackerStatus: 'Running',
    notificationStatus: newNotificationStatus(),
  };
}

export function newTimedTracker(
  name: string,
  description: string,
  start_date: Date,
  duration_days: number
): TimedTracker {
  return {
    kind: 'timed',
    description,
    name,
    start_date_unix_ms: start_date.valueOf(),
    duration_days,
    trackerStatus: 'Running',
    notificationStatus: newNotificationStatus(),
  };
}
function newNotificationStatus(): NotificationStatus {
  return {
    lastCheckedUnixMs: undefined,
    lastNotificationId: undefined,
    lastNotificationStatus: undefined,
  };
}

export type Tracker = GddTracker | TimedTracker | CalendarTracker;
export type TrackerStatus = "Stopped" | "Running";
export type GddTrackerStatus = TrackerStatus | TrackerError;
export type TrackerError = {
  ErrorType: "MissedDays";
  ErrorMessage: String;
};
export type NotificationStatus = {
  lastCheckedUnixMs: number | undefined;
  lastNotificationId: number | undefined;
  lastNotificationStatus: 'Active' | 'Cleared' | undefined;
};
export type CalendarTracker = {
  kind: 'calendar';
  name: string;
  description: string;
  target_date_unix_ms: number;
  trackerStatus: TrackerStatus;
  notificationStatus: NotificationStatus;
};
export type TimedTracker = {
  kind: 'timed';
  name: string;
  description: string;
  start_date_unix_ms: number;
  duration_days: number;
  trackerStatus: TrackerStatus;
  notificationStatus: NotificationStatus;
};
export type GddTracker = {
  kind: 'gdd';
  name: string;
  description: string;
  target_gdd: number;
  base_temp: number;
  start_date_unix_ms: number;
  location_name: string;
  trackerStatus: GddTrackerStatus;
  notificationStatus: NotificationStatus;
};
