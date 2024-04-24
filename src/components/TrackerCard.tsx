import {ColorValue, StyleSheet, View} from 'react-native';
import {Button, Card, Chip, Icon, Text} from 'react-native-paper';
import {CARD_TITLE_VARIANT} from '../Styles.ts';
import styles from '../Styles';
import {Tracker, trackerStatus} from '../providers/statecontext/Trackers.ts';
import {HomeLocationsTabScreenProps} from '../navigation/Root';
import {RotateInUpLeft} from 'react-native-reanimated';
import {TrackerPropsToCardProps} from './trackercard/Types.ts';
import {LeftCallout} from './trackercard/LeftCallout.tsx';
import {useContext} from 'react';
import {SettingsContext} from '../providers/SettingsContext.tsx';
import {StateContext} from '../providers/StateContext.tsx';
import {addDays, differenceInCalendarDays, startOfDay} from 'date-fns';

export const CARD_TEXT_ICON_SIZE = 20;

type CardPropsParamList = {
  item: Tracker;
  navigation: HomeLocationsTabScreenProps<'Home'>['navigation'];
  onDelete: () => void;
  onReset: () => void;
  onStop: () => void;
  onResume: () => void;
  onCancelSnooze: () => void;
};
export function TrackerCard({
  item,
  onReset,
  onDelete,
  onStop,
  onResume,
  onCancelSnooze,
  navigation,
}: CardPropsParamList) {
  const {settings} = useContext(SettingsContext);
  const {locations} = useContext(StateContext);
  const props = TrackerPropsToCardProps(
    item,
    settings,
    locations,
    onDelete,
    onReset,
    onStop,
    onResume,
    navigation,
  );

  // Snooze until day after snooze pressed.
  const snoozeUntilDate = item.lastSnoozedUnixMs
    ? differenceInCalendarDays(item.lastSnoozedUnixMs, new Date()) <= 0
      ? addDays(startOfDay(item.lastSnoozedUnixMs), 1)
      : undefined
    : undefined;
  if (props === undefined) return;
  return (
    <Card
      mode="elevated"
      style={styles.listCard}
      onPress={() => {
        console.log('Pressed card');
        props.onPress();
      }}>
      <Card.Title
        title={props.heading}
        subtitle={props.subheading}
        titleVariant={CARD_TITLE_VARIANT}
        left={() => {
          if (props.leftCalloutProps) {
            return (
              <LeftCallout
                status={props.leftCalloutProps?.status}
                text={props.leftCalloutProps?.text}
                backgroundColor={props.leftCalloutProps?.backgroundColor}
              />
            );
          }
        }}
        right={() => (
          <View style={{paddingRight: 10}}>
            <Icon source={props.rightIcon} size={CARD_TEXT_ICON_SIZE * 2} />
          </View>
        )}
      />
      <Card.Content style={{alignItems: 'flex-start'}}>
        {props.lines.map((l, i) => (
          <Text key={i}>
            <Icon source={l.icon} size={CARD_TEXT_ICON_SIZE} />
            {l.title}: {l.text}
          </Text>
        ))}
        {snoozeUntilDate ? (
          <Chip icon="sleep" onClose={onCancelSnooze}>
            {'Snoozed until '}
            {snoozeUntilDate.toLocaleDateString()}
          </Chip>
        ) : undefined}
      </Card.Content>
      <Card.Actions>
        {props.actions.map((a, i) => (
          <Button key={i} onPress={a.callback}>
            <Icon source={a.icon} size={CARD_TEXT_ICON_SIZE} />
            {a.name}
          </Button>
        ))}
      </Card.Actions>
    </Card>
  );
}
