import { StyleSheet, View } from 'react-native';
import styles from '../../Styles';
import { ActivityIndicator, Text } from 'react-native-paper';

const LEFT_CALLOUT_TEXT_VARIANT = 'bodyLarge';
export type LeftCalloutParamList = {
  params: {
    refreshing?: boolean;
    text?: string;
    backgroundColor?: string;
  };
};

export function LeftCallout({ params }: LeftCalloutParamList) {
  if (params.refreshing) {
    return (
      <View style={styles.trackerCardLeftCallout}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <View
      style={StyleSheet.compose(
        {
          backgroundColor: params.backgroundColor,
        },
        styles.trackerCardLeftCallout,
      )}>
      <Text style={styles.trackerCardLeftCalloutText} variant={LEFT_CALLOUT_TEXT_VARIANT}>{params.text}</Text>
    </View>
  );
}
