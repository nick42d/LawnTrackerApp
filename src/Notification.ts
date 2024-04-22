import notifee, {Event, EventType} from '@notifee/react-native';
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

export async function NotifeeBackgroundEventCallback({type, detail}: Event) {
  console.log('Notifee background event handler called');
  await NotifeeGenericEventCallback({type, detail});
}

/// Handle a background event recieved by notifee
/// Even creating a notification triggers an event
async function NotifeeGenericEventCallback({type, detail}: Event) {
  console.log('Notifee foreground event handler called');
  switch (type) {
    case EventType.ACTION_PRESS:
      console.log('User pressed action: ', detail.pressAction);
      if (detail.pressAction && detail.notification?.data) {
        console.warn("Haven't handled this pressAction yet!");
      } else {
        console.warn("Expected a pressAction but it wasn't there.");
      }
      return;
    case EventType.DISMISSED:
      console.log('User dismissed notification');
      return;
    case EventType.PRESS:
      if (detail.notification?.data) {
        // Validate data - ideally this is done elsewhere
        if (
          !detail.notification.data.trackerId ||
          typeof detail.notification.data.trackerId !== 'string'
        ) {
          console.log(
            "Didn't get a tracker id with my notification or it wasn't a string",
          );
          return;
        }
        await Linking.openURL(
          `lawntracker://tracker/view/${detail.notification.data.trackerId}`,
        );
      } else {
        console.warn("Expected a pressAction but it wasn't there.");
      }
      console.log('User pressed notification');
      return;
    default:
      console.log('Unhandled event type: ', EventType[type]);
  }
}
