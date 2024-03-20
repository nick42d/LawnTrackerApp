import React, {useContext} from 'react';
import {Text} from 'react-native-paper';
import {LineChart} from 'react-native-gifted-charts';
import {View} from 'react-native';
import {calcGdd} from '../Knowledge';
import {GRAPH_WIDTH} from '../Consts';
import {AppScreenProps} from '../navigation/Root';
import {GddTracker} from '../Types';
import {Location} from '../state/State';

export default function ViewLocationCardScreen({
  route,
}: AppScreenProps<'ViewLocationCard'>) {
  const item = route.params.location;
  return (
    <View>
      <Text>{item.name}</Text>
      <View>
        <LineChart
        // data={data}
        // lineSegments={segments}
        // width={GRAPH_WIDTH}
        // showReferenceLine1
        // referenceLine1Config={{
        //   thickness: 3,
        //   color: 'red',
        //   dashWidth: 10,
        //   dashGap: -10,
        // }}
        // referenceLine1Position={item.target_gdd}
        // isAnimated
        // curved
        // spacing={25}
        // thickness={3}
        // showScrollIndicator
        // color="green"
        // dataPointsColor="green"
        // hideDataPoints
        />
      </View>
    </View>
  );
}
