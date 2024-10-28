import {addDays, differenceInCalendarDays, startOfDay} from 'date-fns';
import {calcGddTotal} from '../../knowledge/Gdd';
import {GddAlgorithm, GddBaseTemp} from '../settingscontext/Types';
import {Location} from './Locations';
import {v4 as uuidv4} from 'uuid';
import * as v from 'valibot';
import {MAX_HISTORY_DAYS} from '../../Consts';

export const TRACKERS_SCHEMA_VERSION = '0.1';
export const TRACKER_STATUSES = ['Stopped', 'Running'] as const;
export const MAX_DESC_LENGTH = 40;
export const MAX_NAME_LENGTH = 20;

// These types are valibot validated
// due to deserializing from AsyncStorage
// and form validation
export const TrackerNameSchema = v.pipe(
  v.string(),
  v.minLength(1, 'Name is mandatory'),
  v.maxLength(
    MAX_NAME_LENGTH,
    `Name must be less than ${MAX_NAME_LENGTH} characters`,
  ),
);
export const TrackerDescSchema = v.pipe(
  v.string(),
  v.maxLength(
    MAX_DESC_LENGTH,
    `Description must be less than ${MAX_DESC_LENGTH} characters`,
  ),
);
/**
 * Disallow adding GDD tracker older than API history window
 */
export const AddGddTrackerStartDateSchema = v.pipe(
  v.optional(
    v.pipe(
      v.date(),
      v.minValue(addDays(startOfDay(new Date()), -MAX_HISTORY_DAYS)),
    ),
  ),
  v.transform(d => (d ? Number(d) : Date.now())),
);
/**
 * Disallow adding Calendar tracker older than today - no point!
 */
export const AddCalendarTrackerStartDateSchema = v.pipe(
  v.optional(
    v.pipe(
      v.date(),
      v.minValue(
        startOfDay(new Date()),
        'Calendar tracker date must be in the future',
      ),
    ),
  ),
  v.transform(d => (d ? Number(d) : Date.now())),
);
export const PositiveIntegerSchema = v.pipe(
  v.number('Not a number'),
  v.safeInteger('Whole numbers only'),
  v.minValue(0, 'Number too low'),
);
export const AddGddTrackerTargetSchema = v.pipe(
  v.string('Target must be a number'),
  v.minLength(1, 'Target is mandatory'),
  v.transform(v => Number(v)),
  PositiveIntegerSchema,
);
/**
 * No date restrictions for timed tracker
 */
export const AddTimedTrackerStartDateSchema = v.pipe(
  v.optional(v.date()),
  v.transform(d => (d ? Number(d) : Date.now())),
);
export const AddTimedTrackerDurationDaysSchema = v.pipe(
  v.string('Duration must be a number'),
  v.minLength(1, 'Duration is mandatory'),
  v.transform(v => Number(v)),
  PositiveIntegerSchema,
);
export const StringToNumberSchema = v.pipe(v.string(), v.transform(Number));
export const TrackerStatusSchema = v.picklist(TRACKER_STATUSES);
export const NotificationStatusSchema = v.strictObject({
  lastCheckedUnixMs: v.optional(v.number()),
  lastNotificationId: v.optional(v.number()),
  lastNotificationStatus: v.optional(v.picklist(['Active', 'Cleared'])),
});
/**
 * Base storage validation schema
 */
export const BaseTrackerSchema = v.strictObject({
  name: TrackerNameSchema,
  description: TrackerDescSchema,
  uuid: v.pipe(v.string(), v.uuid()),
  trackerStatus: TrackerStatusSchema,
  lastSnoozedUnixMs: v.optional(v.number()),
  notificationStatus: NotificationStatusSchema,
});
/**
 * Base form validation schema
 */
export const BaseAddTrackerSchema = v.strictObject({
  name: TrackerNameSchema,
  description: TrackerDescSchema,
});
/**
 * Form validation schema
 */
export const AddGddTrackerSchema = v.object({
  ...BaseAddTrackerSchema.entries,
  ...v.strictObject({
    kind: v.literal('gdd'),
    target_gdd: AddGddTrackerTargetSchema,
    base_temp: StringToNumberSchema,
    start_date_unix_ms: AddGddTrackerStartDateSchema,
    locationId: v.number(),
  }).entries,
});
/**
 * Storage validation schema
 */
export const GddTrackerSchema = v.object({
  ...BaseTrackerSchema.entries,
  ...v.strictObject({
    kind: v.literal('gdd'),
    target_gdd: v.number(),
    base_temp: v.number(),
    start_date_unix_ms: v.number(),
    locationId: v.number(),
  }).entries,
});
/**
 * Storage validation schema
 */
export const CalendarTrackerSchema = v.object({
  ...BaseTrackerSchema.entries,
  ...v.strictObject({
    kind: v.literal('calendar'),
    target_date_unix_ms: v.number(),
  }).entries,
});
/**
 * Form validation schema
 */
export const AddCalendarTrackerSchema = v.object({
  ...BaseAddTrackerSchema.entries,
  ...v.strictObject({
    kind: v.literal('calendar'),
    target_date_unix_ms: AddCalendarTrackerStartDateSchema,
  }).entries,
});
export const TimedTrackerSchema = v.object({
  ...BaseTrackerSchema.entries,
  ...v.strictObject({
    kind: v.literal('timed'),
    start_date_unix_ms: v.number(),
    duration_days: v.number(),
  }).entries,
});
export const AddTimedTrackerSchema = v.object({
  ...BaseAddTrackerSchema.entries,
  ...v.strictObject({
    kind: v.literal('timed'),
    start_date_unix_ms: AddTimedTrackerStartDateSchema,
    duration_days: AddTimedTrackerDurationDaysSchema,
  }).entries,
});
export const TrackerSchema = v.variant('kind', [
  CalendarTrackerSchema,
  TimedTrackerSchema,
  GddTrackerSchema,
]);
export const TrackersSchema = v.strictObject({
  apiVersion: v.literal(TRACKERS_SCHEMA_VERSION),
  trackers: v.array(TrackerSchema),
});
export const AddTrackerSchema = v.variant('kind', [
  AddCalendarTrackerSchema,
  AddTimedTrackerSchema,
  AddGddTrackerSchema,
]);

export type NotificationStatus = v.InferOutput<typeof NotificationStatusSchema>;
export type CalendarTracker = v.InferOutput<typeof CalendarTrackerSchema>;
export type TrackerStatus = v.InferOutput<typeof TrackerStatusSchema>;
export type TimedTracker = v.InferOutput<typeof TimedTrackerSchema>;
export type GddTracker = v.InferOutput<typeof GddTrackerSchema>;
export type AddTrackerInput = v.InferInput<typeof AddTrackerSchema>;
export type AddGddTrackerInput = v.InferInput<typeof AddGddTrackerSchema>;
export type AddCalendarTrackerInput = v.InferInput<
  typeof AddCalendarTrackerSchema
>;
export type AddTimedTrackerInput = v.InferInput<typeof AddTimedTrackerSchema>;
export type AddTracker = v.InferOutput<typeof AddTrackerSchema>;
export type Tracker = v.InferOutput<typeof TrackerSchema>;
export type Trackers = v.InferOutput<typeof TrackersSchema>;
export type TrackerKind = Tracker['kind'];

// Should be in a different module
/**
 * Result of checking if notifications are due.
 *
 */
export type TrackerStatusCheck =
  | {
      kind: 'Stopped' | 'Running' | 'ErrorCalculatingGdd' | 'Snoozed';
      trackerKind: TrackerKind;
      trackerName: string;
      trackerId: string;
    }
  | {
      kind: 'TargetReached' | 'Running';
      trackerKind: TrackerKind;
      trackerName: string;
      trackerId: string;
      stringTarget: string;
      stringActual: string;
    };

type DefaultAddTrackerInputProps = {
  kind: TrackerKind;
  locationId: number;
  baseTemp: number;
};
export function getEditTrackerInput(tracker: Tracker): AddTrackerInput {
  switch (tracker.kind) {
    case 'gdd':
      return {
        kind: 'gdd',
        name: tracker.name,
        description: tracker.description,
        start_date_unix_ms: new Date(tracker.start_date_unix_ms),
        locationId: tracker.locationId,
        base_temp: tracker.base_temp.toFixed(0),
        target_gdd: tracker.target_gdd.toFixed(0),
      };
    case 'timed':
      return {
        kind: 'timed',
        name: tracker.name,
        description: tracker.description,
        start_date_unix_ms: new Date(tracker.start_date_unix_ms),
        duration_days: tracker.duration_days.toFixed(0),
      };
    case 'calendar':
      return {
        kind: 'calendar',
        name: tracker.name,
        description: tracker.description,
        target_date_unix_ms: new Date(tracker.target_date_unix_ms),
      };
  }
}
export function defaultAddTrackerInput(
  props: DefaultAddTrackerInputProps,
): AddTrackerInput {
  switch (props.kind) {
    case 'gdd':
      return {
        kind: 'gdd',
        name: '',
        description: '',
        start_date_unix_ms: new Date(),
        locationId: props.locationId,
        base_temp: props.baseTemp.toFixed(0),
        target_gdd: '',
      };
    case 'timed':
      return {
        kind: 'timed',
        name: '',
        description: '',
        start_date_unix_ms: new Date(),
        duration_days: '',
      };
    case 'calendar':
      return {
        kind: 'calendar',
        name: '',
        description: '',
        target_date_unix_ms: new Date(),
      };
  }
}
export function editTracker(
  tracker: Tracker,
  editTracker: AddTracker,
): Tracker {
  if (tracker.kind !== editTracker.kind)
    throw new Error("Tracker edit params don't match tracker type");
  switch (editTracker.kind) {
    case 'gdd': {
      // Safety - asserted above
      const gddAssertedTracker = tracker as GddTracker;
      return {
        ...gddAssertedTracker,
        start_date_unix_ms: editTracker.start_date_unix_ms,
        name: editTracker.name,
        description: editTracker.description,
        locationId: editTracker.locationId,
        target_gdd: editTracker.target_gdd,
        base_temp: editTracker.base_temp,
      };
    }
    case 'timed': {
      // Safety - asserted above
      const timedAssertedTracker = tracker as TimedTracker;
      return {
        ...timedAssertedTracker,
        start_date_unix_ms: editTracker.start_date_unix_ms,
        name: editTracker.name,
        description: editTracker.description,
        duration_days: editTracker.duration_days,
      };
    }
    case 'calendar': {
      // Safety - asserted above
      const calendarAssertedTracker = tracker as CalendarTracker;
      return {
        ...calendarAssertedTracker,
        target_date_unix_ms: editTracker.target_date_unix_ms,
        name: editTracker.name,
        description: editTracker.description,
      };
    }
  }
}
export function newTracker(addTracker: AddTracker) {
  switch (addTracker.kind) {
    case 'gdd': {
      return newGddTracker(
        addTracker.name,
        addTracker.description,
        addTracker.locationId,
        addTracker.target_gdd,
        addTracker.base_temp,
        addTracker.start_date_unix_ms,
      );
    }
    case 'timed': {
      return newTimedTracker(
        addTracker.name,
        addTracker.description,
        addTracker.start_date_unix_ms,
        addTracker.duration_days,
      );
    }
    case 'calendar': {
      return newCalendarTracker(
        addTracker.name,
        addTracker.description,
        addTracker.target_date_unix_ms,
      );
    }
  }
}
export function newGddTracker(
  name: string,
  description: string,
  locationId: number,
  target_gdd: number,
  base_temp: number,
  start_date_unix_ms: number,
): GddTracker {
  return {
    kind: 'gdd',
    locationId,
    description,
    name,
    uuid: uuidv4(),
    target_gdd,
    base_temp,
    start_date_unix_ms,
    trackerStatus: 'Running',
    notificationStatus: newNotificationStatus(),
  };
}

export function newCalendarTracker(
  name: string,
  description: string,
  target_date_unix_ms: number,
): CalendarTracker {
  return {
    kind: 'calendar',
    description,
    name,
    uuid: uuidv4(),
    target_date_unix_ms,
    trackerStatus: 'Running',
    notificationStatus: newNotificationStatus(),
  };
}

export function newTimedTracker(
  name: string,
  description: string,
  start_date_unix_ms: number,
  duration_days: number,
): TimedTracker {
  return {
    kind: 'timed',
    description,
    name,
    uuid: uuidv4(),
    start_date_unix_ms,
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

/**
 *
 * Snoozes tracker at current datetime
 * @param tracker
 * @returns
 */
export function snoozeTracker(tracker: Tracker): Tracker {
  return {...tracker, lastSnoozedUnixMs: Date.now()};
}
/**
 *
 * Cancels snooze for tracker
 * @param tracker
 * @returns
 */
export function cancelSnoozeTracker(tracker: Tracker): Tracker {
  return {...tracker, lastSnoozedUnixMs: undefined};
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
  if (
    tracker.lastSnoozedUnixMs &&
    differenceInCalendarDays(curDateUnixMs, tracker.lastSnoozedUnixMs) <= 0
  ) {
    return {
      trackerKind: tracker.kind,
      trackerName: tracker.name,
      trackerId: tracker.uuid,
      kind: 'Snoozed',
    };
  }
  switch (tracker.kind) {
    case 'calendar': {
      const target = tracker.target_date_unix_ms;
      return target <= curDateUnixMs
        ? {
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            trackerId: tracker.uuid,
            kind: 'TargetReached',
            stringTarget: new Date(target).toLocaleDateString(),
            stringActual: new Date(curDateUnixMs).toLocaleDateString(),
          }
        : {
            stringActual: new Date(curDateUnixMs).toLocaleDateString(),
            stringTarget: new Date(target).toLocaleDateString(),
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            trackerId: tracker.uuid,
            kind: 'Running',
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
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            trackerId: tracker.uuid,
            kind: 'TargetReached',
            stringActual: actual_gdd.toFixed(0),
            stringTarget: target.toFixed(0),
          }
        : {
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            trackerId: tracker.uuid,
            kind: 'Running',
            stringActual: actual_gdd.toFixed(0),
            stringTarget: target.toFixed(0),
          };
    }
    case 'timed': {
      const target = addDays(
        tracker.start_date_unix_ms,
        tracker.duration_days,
      ).valueOf();
      return target <= curDateUnixMs
        ? {
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            trackerId: tracker.uuid,
            kind: 'TargetReached',
            stringTarget: new Date(target).toLocaleDateString(),
            stringActual: new Date(curDateUnixMs).toLocaleDateString(),
          }
        : {
            trackerKind: tracker.kind,
            trackerName: tracker.name,
            trackerId: tracker.uuid,
            kind: 'Running',
            stringTarget: new Date(target).toLocaleDateString(),
            stringActual: new Date(curDateUnixMs).toLocaleDateString(),
          };
    }
  }
}
