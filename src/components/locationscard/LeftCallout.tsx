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
  temperature?: number;
  unitOfMeasure?: UnitOfMeasure;
};

export function WeatherLeftCallout({
  status,
  temperature,
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
        {temperature?.toFixed(1)}
        {'\n'}°{unitOfMeasure ? unitOfMeasureAbbreviate(unitOfMeasure) : ''}
      </Text>
    </View>
  );
}
