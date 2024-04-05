import { ColorValue, StyleSheet, View } from 'react-native';
import { Button, Card, Icon, Text } from 'react-native-paper';
import { CARD_TITLE_VARIANT } from '../Components';
import styles from '../Styles';
import { Tracker } from '../Types';
import { HomeLocationsTabScreenProps } from '../navigation/Root';
import { RotateInUpLeft } from 'react-native-reanimated';
import { TrackerPropsToCardProps } from './trackercard/Types.ts';

const CARD_TEXT_ICON_SIZE = 20;

type CardPropsParamList = {
  item: Tracker;
  navigation: HomeLocationsTabScreenProps<'Home'>['navigation'];
  onDelete: () => void;
  onReset: () => void;
};
export function TrackerCard({
  item,
  onReset,
  onDelete,
  navigation,
}: CardPropsParamList) {
  const props = TrackerPropsToCardProps(item, navigation);
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
        left={() => (
          <View
            style={StyleSheet.compose(
              {
                backgroundColor: props.leftcalloutcolour
              },
              styles.trackerCardLeftCallout,
            )}>
            <Text
              style={{ textAlign: 'center', textAlignVertical: 'center' }}
              variant="bodyLarge">
              {props.leftcallout}
            </Text>
          </View>
        )}
        right={() => (
          <View>
            <Icon source={props.righticon} size={CARD_TEXT_ICON_SIZE * 2} />
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

