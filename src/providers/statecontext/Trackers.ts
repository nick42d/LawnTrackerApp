import {addDays} from 'date-fns';
import {calcGdd} from '../../Knowledge';
import {calcGddTotal} from '../../knowledge/Gdd';
import {GddAlgorithm, GddBaseTemp} from '../settingscontext/Types';
import {Location} from './Locations';

export function newGddTracker(
  name: string,
  description: string,
  locationId: number,
  target_gdd: number,
  base_temp: GddBaseTemp,
  start_date: Date,
): GddTracker {
  return {
    kind: 'gdd',
    locationId,
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
  target_date: Date,
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
  duration_days: number,
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
export type TrackerStatus = 'Stopped' | 'Running';
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
  locationId: number;
  trackerStatus: TrackerStatus;
  notificationStatus: NotificationStatus;
};

/// Resets tracker - note copy on write behaviour
export function resetTracker(tracker: Tracker): Tracker {
  if (tracker.kind === 'calendar') return tracker;
  return {...tracker, start_date_unix_ms: Date.now()};
}

/// Stops tracker
export function stopTracker(tracker: Tracker): Tracker {
  return {...tracker, trackerStatus: 'Stopped'};
}

/// Resumes tracker and resets it if resettable.
export function resumeTracker(tracker: Tracker): Tracker {
  return {...resetTracker(tracker), trackerStatus: 'Running'};
}

export type TrackerStatusCheck =
  | {
      kind: 'Stopped' | 'Running' | 'ErrorCalculatingGdd';
      trackerKind: 'gdd' | 'timed' | 'calendar';
      trackerName: string;
    }
  | {
      kind: 'TargetReached' | 'Running';
      trackerKind: 'gdd' | 'timed' | 'calendar';
      trackerName: string;
      target: number;
      actual: number;
    };

export function trackerStatus(
  tracker: Tracker,
  curDateUnixMs: number,
  locations: Location[],
  algorithm: GddAlgorithm,
): TrackerStatusCheck {
  if (tracker.trackerStatus === 'Stopped')
    return {
      trackerKind: tracker.kind,
      trackerName: tracker.name,
      kind: 'Stopped',
    };
  switch (tracker.kind) {
    case 'calendar': {
      const target = tracker.target_date_unix_ms;
      return target <= curDateUnixMs
        ? {
            actual: curDateUnixMs,
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            kind: 'TargetReached',
            target,
          }
        : {
            actual: curDateUnixMs,
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            kind: 'Running',
            target,
          };
    }
    case 'gdd': {
      const actual_gdd = calcGddTotal(tracker, locations, algorithm);
      if (typeof actual_gdd !== 'number')
        return {
          trackerKind: tracker.kind,
          trackerName: tracker.name,
          kind: 'ErrorCalculatingGdd',
        };
      const target = tracker.target_gdd;
      return target <= actual_gdd
        ? {
            actual: actual_gdd,
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            kind: 'TargetReached',
            target,
          }
        : {
            actual: actual_gdd,
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            kind: 'Running',
            target,
          };
    }
    case 'timed': {
      const target = addDays(
        tracker.start_date_unix_ms,
        tracker.duration_days,
      ).valueOf();
      return target <= curDateUnixMs
        ? {
            actual: curDateUnixMs,
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            kind: 'TargetReached',
            target,
          }
        : {
            actual: curDateUnixMs,
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            kind: 'Running',
            target,
          };
    }
  }
}
