import {Image, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import styles from '../Styles';

export default function LoadingScreen() {
  return (
    <View style={styles.loadScreenContainer}>
      <Text variant="displayMedium">LawnTracker</Text>
      <Image
        style={styles.loadScreenLogo}
        source={require('../../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.webp')}
      />
      <View style={styles.loadScreenText}>
        <Text variant="displaySmall">Loading</Text>
        <ActivityIndicator size="small" />
      </View>
    </View>
  );
}
