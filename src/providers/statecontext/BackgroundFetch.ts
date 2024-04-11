// Module intended to contain the back-end worker
// Sync app with Async Storage
// Issue notifications

import BackgroundFetch from 'react-native-background-fetch';
import {onDisplayNotification} from '../../Notification';
import {BACKGROUND_REFRESH_INTERVAL} from '../../Consts';
import {GetStoredState} from './EffectHandlers';
import {trackerStatus} from './Trackers';
import {GDDAlgorithm} from '../settingscontext/Types';

/// Initiate background event handler.
// Generally would call this on app load, so consider what impact there would be running it multiple times on succession.
// NOTE: the foreground/background event handler is here, but the headless event handler is in HeadlessCallback module and registered in index.
export async function initBackgroundFetch() {
  // BackgroundFetch event handler.
  const onEvent = async (taskId: string) => {
    console.log('[BackgroundFetch] task: ', taskId);
    // Do your background work...
    // Perform an example HTTP request.
    // Important:  await asychronous tasks when using HeadlessJS.
    console.log('[BackgroundFetch] executed');
    const notify = await onFetch();
    // IMPORTANT:  You must signal to the OS that your task is complete.
    BackgroundFetch.finish(taskId);
  };

  // Timeout callback is executed when your Task has exceeded its allowed running-time.
  // You must stop what you're doing immediately BackgroundFetch.finish(taskId)
  const onTimeout = async (taskId: string) => {
    console.warn('[BackgroundFetch] TIMEOUT task: ', taskId);
    BackgroundFetch.finish(taskId);
  };

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

export async function onFetch() {
  const bgFetch = await GetStoredState();
  const bgCheck = bgFetch?.trackers.map(t =>
    trackerStatus(t, Date.now(), bgFetch.locations, GDDAlgorithm.VariantA),
  );
  console.log(JSON.stringify(bgCheck));
  if (bgCheck)
    await onDisplayNotification(
      bgCheck[1].kind,
      JSON.stringify(bgCheck[1].target),
    );
}
