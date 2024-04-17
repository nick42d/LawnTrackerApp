import {ColorValue, StyleSheet, View} from 'react-native';
import {Button, Card, Icon, Text} from 'react-native-paper';
import {CARD_TITLE_VARIANT} from '../Styles.ts';
import styles from '../Styles';
import {Tracker} from '../providers/statecontext/Trackers.ts';
import {HomeLocationsTabScreenProps} from '../navigation/Root';
import {RotateInUpLeft} from 'react-native-reanimated';
import {TrackerPropsToCardProps} from './trackercard/Types.ts';
import {LeftCallout} from './trackercard/LeftCallout.tsx';

export const CARD_TEXT_ICON_SIZE = 20;

type CardPropsParamList = {
  item: Tracker;
  navigation: HomeLocationsTabScreenProps<'Home'>['navigation'];
  onDelete: () => void;
  onReset: () => void;
  onStop: () => void;
  onResume: () => void;
};
export function TrackerCard({
  item,
  onReset,
  onDelete,
  onStop,
  onResume,
  navigation,
}: CardPropsParamList) {
  const props = TrackerPropsToCardProps(
    item,
    onDelete,
    onReset,
    onStop,
    onResume,
    navigation,
  );
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
      <Card.Content>
        {props.lines.map((l, i) => (
          <Text key={i}>
            <Icon source={l.icon} size={CARD_TEXT_ICON_SIZE} />
            {l.title}: {l.text}
          </Text>
        ))}
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
