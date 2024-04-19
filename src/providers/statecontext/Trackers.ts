import {addDays} from 'date-fns';
import {calcGddTotal} from '../../knowledge/Gdd';
import {GddAlgorithm, GddBaseTemp} from '../settingscontext/Types';
import {Location} from './Locations';
import {v4 as uuidv4} from 'uuid';
import * as v from 'valibot';

// These types are valibot validated
// due to deserializing from AsyncStorage
export const TRACKER_STATUSES = ['Stopped', 'Running'] as const;
export const TrackerStatusSchema = v.picklist(TRACKER_STATUSES);
export const NotificationStatusSchema = v.object(
  {
    lastCheckedUnixMs: v.optional(v.number()),
    lastNotificationId: v.optional(v.number()),
    lastNotificationStatus: v.optional(v.picklist(['Active', 'Cleared'])),
  },
  v.never(),
);
export const CalendarTrackerSchema = v.object(
  {
    kind: v.literal('calendar'),
    name: v.string(),
    description: v.string(),
    uuid: v.string(),
    target_date_unix_ms: v.number(),
    trackerStatus: TrackerStatusSchema,
    notificationStatus: NotificationStatusSchema,
  },
  v.never(),
);
export const TimedTrackerSchema = v.object(
  {
    kind: v.literal('timed'),
    name: v.string(),
    description: v.string(),
    uuid: v.string(),
    start_date_unix_ms: v.number(),
    duration_days: v.number(),
    trackerStatus: TrackerStatusSchema,
    notificationStatus: NotificationStatusSchema,
  },
  v.never(),
);
export const GddTrackerSchema = v.object(
  {
    kind: v.literal('gdd'),
    name: v.string(),
    description: v.string(),
    uuid: v.string(),
    target_gdd: v.number(),
    base_temp: v.number(),
    start_date_unix_ms: v.number(),
    locationId: v.number(),
    trackerStatus: TrackerStatusSchema,
    notificationStatus: NotificationStatusSchema,
  },
  v.never(),
);
export const TrackerSchema = v.variant('kind', [
  CalendarTrackerSchema,
  TimedTrackerSchema,
  GddTrackerSchema,
]);
export type NotificationStatus = v.Output<typeof NotificationStatusSchema>;
export type CalendarTracker = v.Output<typeof CalendarTrackerSchema>;
export type TrackerStatus = v.Output<typeof TrackerStatusSchema>;
export type TimedTracker = v.Output<typeof TimedTrackerSchema>;
export type GddTracker = v.Output<typeof GddTrackerSchema>;
export type Tracker = v.Output<typeof TrackerSchema>;

/**
 * Result of checking if notifications are due.
 *
 */
// Should be in a different module
export type TrackerStatusCheck =
  | {
      kind: 'Stopped' | 'Running' | 'ErrorCalculatingGdd';
      trackerKind: 'gdd' | 'timed' | 'calendar';
      trackerName: string;
      trackerId: string;
    }
  | {
      kind: 'TargetReached' | 'Running';
      trackerKind: 'gdd' | 'timed' | 'calendar';
      trackerName: string;
      trackerId: string;
      target: number;
      actual: number;
    };

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
    uuid: uuidv4(),
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
    uuid: uuidv4(),
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
    uuid: uuidv4(),
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

export function getTrackerType(tracker: Tracker): string {
  switch (tracker.kind) {
    case 'calendar':
      return 'Calendar';
    case 'timed':
      return 'Timed';
    case 'gdd':
      return 'Gdd';
  }
}

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
      trackerId: tracker.uuid,
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
            trackerId: tracker.uuid,
            kind: 'TargetReached',
            target,
          }
        : {
            actual: curDateUnixMs,
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            trackerId: tracker.uuid,
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
          trackerId: tracker.uuid,
          kind: 'ErrorCalculatingGdd',
        };
      const target = tracker.target_gdd;
      return target <= actual_gdd
        ? {
            actual: actual_gdd,
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            trackerId: tracker.uuid,
            kind: 'TargetReached',
            target,
          }
        : {
            actual: actual_gdd,
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            trackerId: tracker.uuid,
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
            trackerId: tracker.uuid,
            kind: 'TargetReached',
            target,
          }
        : {
            actual: curDateUnixMs,
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            trackerId: tracker.uuid,
            kind: 'Running',
            target,
          };
    }
  }
}
