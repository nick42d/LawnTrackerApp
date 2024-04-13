import notifee, {Event} from '@notifee/react-native';
import {TrackerStatusCheck} from './providers/statecontext/Trackers';

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
    await displayNotification(msg, detail, ['snooze', 'stop']);
  }
}
export async function displayNotification(
  msg: string,
  detail: string,
  actionsList: NotificationAction[],
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
    // TODO: iOS config
    android: {
      smallIcon: 'ic_launcher',
      channelId,
      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: 'default',
      },
      actions,
    },
  });
}

/// Handle a background event recieved by notifee
/// Even creating a notification triggers an event
export async function BackgroundEventCallback({type, detail}: Event) {
  const {notification, pressAction} = detail;
  console.log(
    'Notifee Background Event Handler called, type: ',
    type,
    ', notification: ',
    notification,
    ', pressAction: ',
    pressAction,
  );
}
