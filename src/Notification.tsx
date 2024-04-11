import notifee, {Event} from '@notifee/react-native';

export async function onDisplayNotification(msg: string, detail: string) {
  console.log('Called onDisplayNotification');
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // Display a notification
  await notifee.displayNotification({
    title: msg,
    body: detail,
    // TODO: iOS config
    android: {
      smallIcon: 'ic_launcher',
      channelId,
      // pressAction is needed if you want the notification to open the app when pressed
      // pressAction: {
      //   id: 'default',
      // },
      actions: [
        {
          title: 'Snooze 24h',
          pressAction: {
            id: 'snooze',
          },
        },
        {
          title: 'Stop',
          pressAction: {
            id: 'stop',
          },
        },
      ],
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
