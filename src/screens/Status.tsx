import {useCallback, useContext, useEffect, useState} from 'react';
import {View} from 'react-native';
import {
  BackgroundTaskManager,
  getStoredBackgroundTaskManager,
} from '../worker/Types';
import {ActivityIndicator, List} from 'react-native-paper';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {
  differenceInCalendarDays,
  differenceInHours,
  differenceInSeconds,
  getHours,
  getMinutes,
} from 'date-fns';
import {useFocusEffect} from '@react-navigation/native';
import {SettingsContext} from '../providers/SettingsContext';
import {fetchLocations, fetchLocationsWeather} from '../api/Api';
import {Settings} from '../providers/settingscontext/Types';

export default function StatusScreen() {
  const {settings} = useContext(SettingsContext);
  const [backgroundTaskManager, setBackgroundTaskManager] = useState<
    'loading' | BackgroundTaskManager
  >('loading');
  const [notificationStatus, setNotificationStatus] = useState<
    'loading' | AuthorizationStatus
  >('loading');
  const [apiStatus, setApiStatus] = useState<MetricStatus | 'loading'>(
    'loading',
  );
  useFocusEffect(
    useCallback(() => {
      getStoredBackgroundTaskManager().then(m => {
        if (m) setBackgroundTaskManager(m);
      });
      notifee
        .getNotificationSettings()
        .then(n => setNotificationStatus(n.authorizationStatus));
      fetchLocations('Perth', 10)
        .then(_ => setApiStatus('green'))
        .catch(_ => setApiStatus('red'));
    }, []),
  );
  if (
    apiStatus === 'loading' ||
    backgroundTaskManager === 'loading' ||
    notificationStatus === 'loading'
  )
    return <ActivityIndicator size={'large'} />;
  const recentTimesCheckedUnixMs =
    backgroundTaskManager.recentTimesCheckedUnixMs;
  const recentTimesNotificationDueUnixMs =
    backgroundTaskManager.recentTimesNotificationDueUnixMs;
  const lastDue = recentTimesNotificationDueUnixMs.at(-1);
  const lastChecked = recentTimesCheckedUnixMs.at(-1);
  const averageNotificationDueTime =
    recentTimesNotificationDueUnixMs.length !== 0
      ? backgroundTaskManager.recentTimesNotificationDueUnixMs.reduce(
          (acc, e) => acc + (getHours(e) * 60 + getMinutes(e)) / 60,
          0,
        ) / recentTimesNotificationDueUnixMs.length
      : undefined;
  const averageGapBetween =
    recentTimesCheckedUnixMs.length >= 1
      ? recentTimesCheckedUnixMs
          .slice(0, -1)
          .map(
            (v, idx) =>
              differenceInSeconds(recentTimesCheckedUnixMs[idx + 1], v) / 3600,
          )
          .reduce((acc, e) => acc + e, 0) /
        (recentTimesCheckedUnixMs.length - 1)
      : undefined;
  const now = new Date();
  return (
    <View>
      <List.Section>
        <List.Subheader>Notification metrics</List.Subheader>
        <List.Item
          title="Last checked"
          description={
            lastChecked ? new Date(lastChecked).toLocaleString() : ''
          }
          right={() => (
            <View
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                backgroundColor: metric_lastChecked(lastChecked, now),
              }}
            />
          )}
        />
        <List.Item
          title="Average gap between time checked (hrs)"
          description={averageGapBetween?.toFixed(2)}
          right={() => (
            <View
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                backgroundColor: metric_averageTimeBetween(
                  averageGapBetween,
                  settings,
                ),
              }}
            />
          )}
        />
        <List.Item
          title="Last due"
          description={lastDue ? new Date(lastDue).toLocaleString() : ''}
          right={() => (
            <View
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                backgroundColor: metric_lastDue(lastDue, now),
              }}
            />
          )}
        />
        <List.Item
          title="Average time of day notifications due (24h)"
          description={
            averageNotificationDueTime
              ? `${Math.trunc(averageNotificationDueTime)}:${((averageNotificationDueTime - Math.trunc(averageNotificationDueTime)) * 60).toFixed(0).padStart(2, '0')}`
              : ''
          }
          right={() => (
            <View
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                backgroundColor: metric_averageTimeDue(
                  averageNotificationDueTime,
                  settings,
                ),
              }}
            />
          )}
        />
        <List.Item
          title="Notification status"
          description={prettyPrintAuthorizationStatus(notificationStatus)}
          right={() => (
            <View
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                backgroundColor: metric_authorizationStatus(notificationStatus),
              }}
            />
          )}
        />
        <List.Subheader>Weather API metrics</List.Subheader>
        <List.Item
          title="API status"
          description="Check API receives weather correctly"
          right={() => (
            <View
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                backgroundColor: apiStatus,
              }}
            />
          )}
        />
      </List.Section>
    </View>
  );
}

export type MetricStatus = 'green' | 'orange' | 'red';

function metric_lastChecked(
  lastChecked: number | undefined,
  now: Date,
): MetricStatus {
  if (lastChecked === undefined) return 'orange';
  if (differenceInCalendarDays(now, lastChecked) > 1) return 'red';
  return 'green';
}
function metric_lastDue(lastDue: number | undefined, now: Date): MetricStatus {
  if (lastDue === undefined) return 'orange';
  if (differenceInCalendarDays(now, lastDue) > 1) return 'red';
  return 'green';
}
function metric_averageTimeBetween(
  averageGapBetween: number | undefined,
  settings: Settings,
): MetricStatus {
  if (averageGapBetween === undefined) return 'orange';
  if (Math.abs(averageGapBetween - settings.backgroundTaskIntervalHrs) >= 0.5)
    return 'red';
  return 'green';
}
function metric_averageTimeDue(
  averageNotificationDueTime: number | undefined,
  settings: Settings,
): MetricStatus {
  if (averageNotificationDueTime === undefined) return 'orange';
  if (
    Math.abs(
      averageNotificationDueTime - settings.earliestNotificationTimeHrs,
    ) >= 2
  )
    return 'red';
  return 'green';
}
function metric_authorizationStatus(
  authorizationStatus: AuthorizationStatus,
): MetricStatus {
  switch (authorizationStatus) {
    case AuthorizationStatus.NOT_DETERMINED:
      return 'orange';
    case AuthorizationStatus.DENIED:
      return 'red';
    case AuthorizationStatus.AUTHORIZED:
      return 'green';
    case AuthorizationStatus.PROVISIONAL:
      return 'orange';
  }
}

function prettyPrintAuthorizationStatus(
  authorizationStatus: AuthorizationStatus,
): string {
  switch (authorizationStatus) {
    case AuthorizationStatus.NOT_DETERMINED:
      return 'Unknown';
    case AuthorizationStatus.DENIED:
      return 'Denied';
    case AuthorizationStatus.AUTHORIZED:
      return 'Authorized';
    case AuthorizationStatus.PROVISIONAL:
      return 'Partial';
  }
}
