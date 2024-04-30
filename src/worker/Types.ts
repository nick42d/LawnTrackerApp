import * as v from 'valibot';

export const BackgroundTaskManagerSchema = v.object({
  recentTimesCheckedUnixMs: v.array(v.number()),
  recentTimesNotifiedUnixMs: v.array(v.number()),
  recentErrors: v.array(v.string()),
});

export type BackgroundTaskManager = v.Output<
  typeof BackgroundTaskManagerSchema
>;
