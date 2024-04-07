import {StyleSheet, View} from 'react-native';
import styles from '../../Styles';
import {ActivityIndicator, Icon, Text} from 'react-native-paper';
import {CARD_TEXT_ICON_SIZE} from '../TrackerCard';
import {
  UnitOfMeasure,
  unitOfMeasureAbbreviate,
} from '../../providers/settingscontext/Types';

const LEFT_CALLOUT_TEXT_VARIANT = 'bodyMedium';

export type WeatherLeftCalloutProps = {
  status?: 'Refreshing' | 'Initialised';
  text?: string;
  unitOfMeasure?: UnitOfMeasure;
};

export function WeatherLeftCallout({
  status,
  text,
  unitOfMeasure,
}: WeatherLeftCalloutProps) {
  if (status === 'Refreshing') {
    return (
      <View style={styles.trackerCardLeftCallout}>
        <ActivityIndicator />
      </View>
    );
  }
  if (status === 'Initialised') {
    return <View style={styles.trackerCardLeftCallout}></View>;
  }
  return (
    <View style={styles.trackerCardLeftCallout}>
      <Text
        style={styles.trackerCardLeftCalloutText}
        variant={LEFT_CALLOUT_TEXT_VARIANT}>
        {text}
        {'\n'}°{unitOfMeasure ? unitOfMeasureAbbreviate(unitOfMeasure) : ''}
      </Text>
    </View>
  );
}
