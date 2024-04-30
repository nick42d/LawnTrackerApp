import notifee, {
  Event,
  EventType,
  Notification,
  NotificationPressAction,
} from '@notifee/react-native';
import {Tracker, TrackerStatusCheck} from '../providers/statecontext/Trackers';
import {Linking} from 'react-native';
import {
  getStoredState,
  writeTrackers,
} from '../providers/statecontext/AsyncStorage';

export const NOTIFICATION_ACTIONS = ['snooze', 'stop'] as const;
export type NotificationAction = (typeof NOTIFICATION_ACTIONS)[number];
export function displayNotificationAction(n: NotificationAction): string {
  switch (n) {
    case 'snooze': {
      return 'Snooze 1 day';
    }
    case 'stop': {
      return 'Stop tracking';
    }
  }
}

export async function displayTrackerNotification(status: TrackerStatusCheck) {
  const msg = `Tracker '${status.trackerName}' target exceeded`;
  if (status.kind === 'TargetReached') {
    const detail = `Target: ${status.stringTarget}, Current: ${status.stringActual}`;
    const data = {trackerId: status.trackerId};
    await displayNotification(msg, detail, ['snooze', 'stop'], data);
  }
}
export async function displayNotification(
  msg: string,
  detail: string,
  actionsList: NotificationAction[],
  data?: {[key: string]: string},
) {
  console.log('Called onDisplayNotification');
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });
  const actions = actionsList.map(a => ({
    title: displayNotificationAction(a),
    pressAction: {
      id: a,
    },
  }));
  // Display a notification
  await notifee.displayNotification({
    title: msg,
    body: detail,
    data,
    // TODO: iOS config
    android: {
      smallIcon: 'ic_notification',
      channelId,
      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: 'default',
      },
      actions,
    },
  });
}
/**
 * Handle notification event.
 * Note: it's possible for notification pressActions to modify
 * app local state when app is also in foreground.
 * We don't do that here as that triggers AppState events that we would like to avoid.
 * Therefore this can be simplified to write to AsyncStorage only.
 */
export async function onNotificationEvent({type, detail}: Event) {
  const {notification, pressAction} = detail;
  console.log('Notification background event handler called');
  switch (type) {
    case EventType.ACTION_PRESS:
      if (!notification || !pressAction) {
        console.warn('Notification details missing for action press');
        return;
      }
      await handleNotificationPressAction(pressAction, notification);
      return;
    case EventType.DISMISSED:
      console.log('User dismissed notification');
      return;
    case EventType.PRESS:
      if (!notification) {
        console.warn('Notification details missing for notification open');
        return;
      }
      await handleNotificationOpened(notification);
      return;
    default:
      console.log('Unhandled event type: ', EventType[type]);
  }
}
/**
 * Handle notification pressAction.
 * Note: it's possible for notification pressActions to modify
 * app local state when app is also in foreground.
 * We don't do that here as that triggers AppState events that we would like to avoid.
 * Therefore this can be simplified to write to AsyncStorage only.
 */
// https://github.com/invertase/notifee/issues/529
async function handleNotificationPressAction(
  pressAction: NotificationPressAction,
  notification: Notification,
) {
  console.log('User pressed action: ', pressAction);
  const trackerId = getNotificationTrackerId(notification);
  if (!trackerId) {
    console.warn('Press action was missing a trackerId');
    return;
  }
  // Cases are located in Notification.ts
  switch (pressAction.id) {
    case 'snooze': {
      await backgroundSnoozeTrackerId(trackerId);
      return;
    }
    case 'stop': {
      await backgroundStopTrackerId(trackerId);
      return;
    }
    default:
      console.error('Received unhandled pressAction: ', pressAction.id);
  }
}
/**
 * Mark a tracker in Stored State as snoozed
 * @param trackerId
 * @returns
 */
export async function backgroundSnoozeTrackerId(trackerId: string) {
  const state = await getStoredState();
  if (!state) {
    console.warn('No local state on device');
    return;
  }
  const idx = state.trackers.findIndex(t => t.uuid === trackerId);
  if (idx === -1) {
    console.warn("Couldn't find tracker ", trackerId);
    return;
  }
  const newTrackers = [...state.trackers];
  const newTracker: Tracker = {
    ...state.trackers[idx],
    lastSnoozedUnixMs: Date.now(),
  };
  newTrackers.splice(idx, 1, newTracker);
  await writeTrackers(newTrackers);
}
/**
 * Mark a tracker in Stored State as stopped.
 * @param trackerId
 * @returns
 */
export async function backgroundStopTrackerId(trackerId: string) {
  const state = await getStoredState();
  if (!state) {
    console.warn('No local state on device');
    return;
  }
  const idx = state.trackers.findIndex(t => t.uuid === trackerId);
  if (idx === -1) {
    console.warn("Couldn't find tracker ", trackerId);
    return;
  }
  const newTrackers = [...state.trackers];
  const newTracker: Tracker = {
    ...state.trackers[idx],
    trackerStatus: 'Stopped',
  };
  newTrackers.splice(idx, 1, newTracker);
  await writeTrackers(newTrackers);
}
/**
 * Use both from foreground and background
 */
export async function handleNotificationOpened(notification: Notification) {
  console.log('User pressed notification');
  const trackerId = getNotificationTrackerId(notification);
  if (!trackerId) {
    console.warn('Notification details missing for notification open');
    return;
  }
  await openTrackerId(trackerId);
}

/**
 * Via deep linking open the passed tracker id.
 * Works from background and foreground.
 * @param trackerId
 */
async function openTrackerId(trackerId: string) {
  await Linking.openURL(`lawntracker://tracker/view/${trackerId}`);
}

/**
 * Very specific function to get the trackerId from a notification
 * If it exists.
 * TODO: Genericize
 */
export function getNotificationTrackerId(
  notification: Notification,
): string | undefined {
  const maybeTrackerId = notification.data?.trackerId;
  if (typeof maybeTrackerId === 'string') return maybeTrackerId;
  return undefined;
}
