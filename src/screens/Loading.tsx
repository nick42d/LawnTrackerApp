import {Image, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import ViewLocationCardScreen from './ViewLocationCard';

export default function LoadingScreen() {
  return (
    <View style={loadScreenStyles.container}>
      <Text variant="displayMedium">LawnTracker</Text>
      <Image
        style={loadScreenStyles.logo}
        source={require('../../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png')}
      />
      <View style={loadScreenStyles.loadingText}>
        <Text variant="displaySmall">Loading</Text>
        <ActivityIndicator size="small" />
      </View>
    </View>
  );
}

const loadScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    flexDirection: 'row',
    gap: 20,
  },
  logo: {
    width: 200,
    height: 200,
  },
});
