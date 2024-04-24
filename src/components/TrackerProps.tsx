import {View} from 'react-native';
import {Tracker, getTrackerType} from '../providers/statecontext/Trackers';
import {List} from 'react-native-paper';
import {useContext} from 'react';
import {StateContext} from '../providers/StateContext';

export type TrackerProps = {
  tracker: Tracker;
};
export function TrackerProps({tracker}: TrackerProps) {
  const {locations} = useContext(StateContext);
  // Could instead be a function of the StateContext
  function getLocationText(locationId: number) {
    const l = locations.find(l => l.apiId === locationId);
    return l ? l.name : 'Error';
  }
  return (
    <View>
      <List.Section>
        <List.Item title="Tracker type" description={getTrackerType(tracker)} />
        <List.Item title="Name" description={tracker.name} />
        <List.Item title="Description" description={tracker.description} />
        {
          // GDD specific items
          tracker.kind === 'gdd' ? (
            <View>
              <List.Item
                title="Location"
                description={getLocationText(tracker.locationId)}
              />
              <List.Item
                title="Start date"
                description={new Date(
                  tracker.start_date_unix_ms,
                ).toLocaleDateString()}
              />
              <List.Item title="Target" description={tracker.target_gdd} />
            </View>
          ) : undefined
        }
        {
          // Calendar specific items
          tracker.kind === 'calendar' ? (
            <List.Item
              title="Target date"
              description={new Date(tracker.target_date_unix_ms).toDateString()}
            />
          ) : undefined
        }
        {
          // GDD specific items
          tracker.kind === 'timed' ? (
            <View>
              <List.Item
                title="Start date"
                description={new Date(
                  tracker.start_date_unix_ms,
                ).toLocaleDateString()}
              />
              <List.Item
                title="Target duration"
                description={`${tracker.duration_days} days`}
              />
            </View>
          ) : undefined
        }
        <List.Item title="Tracker status" description={tracker.trackerStatus} />
      </List.Section>
    </View>
  );
}
