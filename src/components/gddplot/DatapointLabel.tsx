import {View} from 'react-native';
import {Text, useTheme, withTheme} from 'react-native-paper';

export default function DatapointLabel(props: {
  line1: string;
  line2: string;
  bgColor: string;
}) {
  return (
    <View
      style={{
        backgroundColor: props.bgColor,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 4,
      }}>
      <Text>{props.line1}</Text>
      <Text>{props.line2}</Text>
    </View>
  );
}
