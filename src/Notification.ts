import notifee, {
  Event,
  EventType,
  Notification,
  NotificationPressAction,
} from '@notifee/react-native';
import {TrackerStatusCheck} from './providers/statecontext/Trackers';
import {Linking} from 'react-native';

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
    const detail = `Target: ${status.target}, Current: ${status.actual}`;
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
async function handleBackgroundNotificationPressAction(
  pressAction: NotificationPressAction,
) {
  console.log('User pressed action: ', pressAction);
  // TODO
  return;
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
/// Handle a background event recieved by notifee
/// Even creating a notification triggers an event
export async function onBackgroundNotificationEvent({type, detail}: Event) {
  const {notification, pressAction} = detail;
  console.log('Notification background event handler called');
  switch (type) {
    case EventType.ACTION_PRESS:
      if (!notification || !pressAction) {
        console.warn('Notification details missing for action press');
        return;
      }
      await handleBackgroundNotificationPressAction(pressAction);
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
