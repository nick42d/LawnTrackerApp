import {View} from 'react-native';
import {Text} from 'react-native-paper';

export type PlotLegendItem = {
  color: string;
  name: string;
};
export type PlotLegendParams = {
  points: PlotLegendItem[];
};
export function PlotLegend({points}: PlotLegendParams) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 10,
      }}>
      {points.map((p, i) => (
        <View
          key={i}
          style={{
            flexWrap: 'wrap',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              backgroundColor: p.color,
              marginRight: 8,
            }}
          />
          <Text
            style={{
              height: 25,
            }}>
            {p.name}
          </Text>
        </View>
      ))}
    </View>
  );
}
