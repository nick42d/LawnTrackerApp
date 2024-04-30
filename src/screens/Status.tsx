import {useEffect, useState} from 'react';
import {View} from 'react-native';
import {getStoredBackgroundTaskManager} from '../worker/Types';
import {List} from 'react-native-paper';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {differenceInHours, getHours} from 'date-fns';

export default function StatusScreen() {
  const [lastChecked, setLastChecked] = useState<number[]>([]);
  const [lastDue, setLastDue] = useState<number[]>([]);
  const [notificationStatus, setNotificationStatus] = useState<
    undefined | AuthorizationStatus
  >();
  // Note - need this to trigger whenever screen opened...
  // TODO: Add loading screen whilst we are fetching.
  // TODO: Add refresh function.
  useEffect(() => {
    getStoredBackgroundTaskManager().then(m => {
      setLastChecked(m?.recentTimesCheckedUnixMs ?? []);
      setLastDue(m?.recentTimesNotificationDueUnixMs ?? []);
    });
    notifee
      .getNotificationSettings()
      .then(n => setNotificationStatus(n.authorizationStatus));
  }, []);
  const averageNotificationDueTime =
    lastDue.reduce((acc, e) => acc + getHours(e), 0) / lastDue.length;
  const averageGapBetween =
    lastChecked
      .map((v, idx) => differenceInHours(v, lastChecked[idx + 1]))
      .slice(0, -1)
      .reduce((acc, e) => acc + e, 0) /
    (lastChecked.length - 1);
  return (
    <View>
      <List.Section>
        <List.Item
          title="Last checked"
          description={new Date(lastChecked.at(-1)).toLocaleString()}
        />
        <List.Item
          title="Average gap between time checked"
          description={averageGapBetween}
        />
        <List.Item
          title="Last due"
          description={new Date(lastDue.at(-1)).toLocaleString()}
        />
        <List.Item
          title="Average time of day notifications due"
          description={averageNotificationDueTime}
        />
        <List.Item
          title="Notification status"
          description={AuthorizationStatus[notificationStatus]}
          onPress={() => notifee.requestPermission()}
        />
        <List.Item
          title="API status"
          description="Check API receives weather correctly"
        />
      </List.Section>
    </View>
  );
}
