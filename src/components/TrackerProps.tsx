import {View} from 'react-native';
import {Tracker, getTrackerType} from '../providers/statecontext/Trackers';
import {List, Text, TextInput} from 'react-native-paper';

export type TrackerProps = {
  tracker: Tracker;
};
export function TrackerProps({tracker}: TrackerProps) {
  return (
    <View>
      <List.Section>
        <List.Item title="Tracker type" description={getTrackerType(tracker)} />
        <List.Item title="Name" description={tracker.name} />
        <List.Item title="Description" description={tracker.description} />
        <List.Item title="Tracker status" description={tracker.trackerStatus} />
        <List.Item
          title="Notification status"
          description={tracker.notificationStatus.lastNotificationStatus}
        />
        <List.Item
          title="Notifications last checked"
          description={
            tracker.notificationStatus.lastCheckedUnixMs
              ? new Date(
                  tracker.notificationStatus.lastCheckedUnixMs,
                ).toLocaleString()
              : ''
          }
        />
      </List.Section>
    </View>
  );
}
