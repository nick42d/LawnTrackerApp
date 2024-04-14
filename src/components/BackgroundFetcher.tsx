// Module intended to contain the back-end worker
// Sync app with Async Storage
// Issue notifications

import BackgroundFetch from 'react-native-background-fetch';
import {
  displayNotification,
  displayNotificationAction,
  displayTrackerNotification,
} from '../Notification';
import {BACKGROUND_REFRESH_INTERVAL} from '../Consts';
import {GetStoredState} from '../providers/statecontext/EffectHandlers';
import {trackerStatus} from '../providers/statecontext/Trackers';
import {GDDAlgorithm} from '../providers/settingscontext/Types';
import {AppState} from 'react-native';
import {PropsWithChildren, useEffect} from 'react';

/// Initiate background event handler.
// Generally would call this on app load, so consider what impact there would be running it multiple times on succession.
// NOTE: the foreground/background event handler is here, but the headless event handler is in HeadlessCallback module and registered in index.
// NOTE: This can update app state (from both foreground and background)
export function BackgroundFetcher(
  props: PropsWithChildren<{
    refreshWeatherCallback: () => Promise<void>;
  }>,
) {
  useEffect(() => {
    initBackgroundFetch();
  }, []);
  // BackgroundFetch event handler.
  async function onEvent(taskId: string) {
    console.log(
      '[BackgroundFetch] task event: ',
      taskId,
      ' state: ',
      AppState.currentState,
    );
    // Important:  await asychronous tasks when using HeadlessJS.
    await props.refreshWeatherCallback().then(async _ => {
      if (AppState.currentState === 'active') return;
      await notifyFromStoredState();
    });
    // IMPORTANT:  You must signal to the OS that your task is complete.
    console.log('[BackgroundFetch] executed');
    BackgroundFetch.finish(taskId);
  }
  // Timeout callback is executed when your Task has exceeded its allowed running-time.
  // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
  async function onTimeout(taskId: string) {
    console.warn('[BackgroundFetch] TIMEOUT task: ', taskId);
    BackgroundFetch.finish(taskId);
  }
  async function initBackgroundFetch() {
    let status = await BackgroundFetch.configure(
      {
        minimumFetchInterval: BACKGROUND_REFRESH_INTERVAL,
        // Begin Android-only options
        enableHeadless: true,
        stopOnTerminate: false,
        startOnBoot: true,
        // End Android-only options
      },
      onEvent,
      onTimeout,
    );
    console.log('[BackgroundFetch] configure status: ', status);
  }
  return props.children;
}

export async function notifyFromStoredState() {
  const bgFetch = await GetStoredState();
  const bgCheck = bgFetch?.trackers.map(t =>
    trackerStatus(t, Date.now(), bgFetch.locations, GDDAlgorithm.VariantA),
  );
  console.log(JSON.stringify(bgCheck));
  if (bgCheck) {
    const p = bgCheck.map(async b => {
      displayTrackerNotification(b);
    });
    await Promise.all(p);
  }
}
