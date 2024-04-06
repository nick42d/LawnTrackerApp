import {StyleSheet, View} from 'react-native';
import styles from '../../Styles';
import {ActivityIndicator, Icon, Text} from 'react-native-paper';
import {CARD_TEXT_ICON_SIZE} from '../TrackerCard';

const LEFT_CALLOUT_TEXT_VARIANT = 'bodyLarge';
export type LeftCalloutProps = {
  status?: 'Refreshing' | 'Stopped' | 'Initialized';
  text?: string;
  backgroundColor?: string;
};

export function LeftCallout({status, text, backgroundColor}: LeftCalloutProps) {
  if (status === 'Refreshing') {
    return (
      <View style={styles.trackerCardLeftCallout}>
        <ActivityIndicator />
      </View>
    );
  }
  if (status === 'Initialized') {
    return (
      <View style={styles.trackerCardLeftCallout}>
        <ActivityIndicator animating={false} />
      </View>
    );
  }
  if (status === 'Stopped') {
    return (
      <View style={styles.trackerCardLeftCallout}>
        <Icon source="stop" size={CARD_TEXT_ICON_SIZE} />{' '}
      </View>
    );
  }
  return (
    <View
      style={StyleSheet.compose(
        {
          backgroundColor,
        },
        styles.trackerCardLeftCallout,
      )}>
      <Text
        style={styles.trackerCardLeftCalloutText}
        variant={LEFT_CALLOUT_TEXT_VARIANT}>
        {text}
      </Text>
    </View>
  );
}
