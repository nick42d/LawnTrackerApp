import AsyncStorage from '@react-native-async-storage/async-storage';
import * as v from 'valibot';
import {StoredState} from '../providers/statecontext/Types';
import {Settings} from '../providers/settingscontext/Types';
import {differenceInCalendarDays, getHours} from 'date-fns';

const BACKGROUND_TASK_MANAGER_SCHEMA_VERSION = '0.1';
const BACKGROUND_TASK_MANAGER_STORAGE_KEY = 'BGTASK';
const MAX_RECENT_TIMES_CHECKED = 100;
const MAX_RECENT_TIMES_NOTIFIED = 10;

export const BackgroundTaskManagerSchema = v.object({
  recentTimesCheckedUnixMs: v.array(v.number()),
  recentTimesNotificationDueUnixMs: v.array(v.number()),
  recentErrors: v.array(v.string()),
  apiVersion: v.literal(BACKGROUND_TASK_MANAGER_SCHEMA_VERSION),
});

export const DEFAULT_BACKGROUND_TASK_MANAGER: BackgroundTaskManager = {
  recentTimesCheckedUnixMs: [],
  recentTimesNotificationDueUnixMs: [],
  recentErrors: [],
  apiVersion: BACKGROUND_TASK_MANAGER_SCHEMA_VERSION,
};

export type BackgroundTaskManager = v.Output<
  typeof BackgroundTaskManagerSchema
>;

/**
 * Checks if notifications are due.
 * Returns an updated backgroundTaskManager.
 * @param state
 * @param settings
 * @param backgroundTaskManager
 */
export function checkIfNotificationsDue(
  settings: Settings,
  backgroundTaskManager: BackgroundTaskManager,
): [BackgroundTaskManager, boolean] {
  const now = Date.now();
  const lastNotificationDue =
    backgroundTaskManager.recentTimesNotificationDueUnixMs.at(-1);
  const isNowPastCutoff = getHours(now) >= settings.earliestNotificationTimeHrs;
  const notificationDueNow = lastNotificationDue
    ? differenceInCalendarDays(now, lastNotificationDue) >= 1 && isNowPastCutoff
    : isNowPastCutoff;
  const recentTimesCheckedUnixMs = [
    ...backgroundTaskManager.recentTimesCheckedUnixMs.slice(
      -MAX_RECENT_TIMES_CHECKED + 1,
    ),
    now,
  ];
  const recentTimesNotificationDueUnixMs = notificationDueNow
    ? [
        ...backgroundTaskManager.recentTimesNotificationDueUnixMs.slice(
          -MAX_RECENT_TIMES_NOTIFIED + 1,
        ),
        now,
      ]
    : backgroundTaskManager.recentTimesNotificationDueUnixMs;
  return [
    {
      apiVersion: backgroundTaskManager.apiVersion,
      recentTimesCheckedUnixMs,
      recentTimesNotificationDueUnixMs,
      recentErrors: backgroundTaskManager.recentErrors,
    },
    notificationDueNow,
  ];
}
export async function writeBackgroundTaskManager(
  backgroundTaskManager: BackgroundTaskManager,
) {
  console.log('Writing background task manager');
  AsyncStorage.setItem(
    BACKGROUND_TASK_MANAGER_STORAGE_KEY,
    JSON.stringify(backgroundTaskManager),
  )
    .then(() => console.log('Wrote background task manager'))
    .catch(() => console.log('Error writing background task manager'));
}

export async function getStoredBackgroundTaskManager(): Promise<
  BackgroundTaskManager | undefined
> {
  console.log('Attempting to get Background Task Manager from device');
  const maybeBackgroundTaskManager = await AsyncStorage.getItem(
    BACKGROUND_TASK_MANAGER_STORAGE_KEY,
  );
  if (maybeBackgroundTaskManager !== null) {
    try {
      // Assuming this is type safe since it has annotation
      // NOTE: Parse could fail if someone else writes to the key!
      const settings: BackgroundTaskManager = v.parse(
        BackgroundTaskManagerSchema,
        JSON.parse(maybeBackgroundTaskManager),
      );
      return settings;
    } catch (e) {
      console.warn('Error parsing stored background task manager: ', e);
      return undefined;
    }
  }
  console.log('Background task manager was not found on device');
  return undefined;
}
