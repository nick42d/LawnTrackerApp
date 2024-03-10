import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

export default function HelpScreen() {
  return (
    <View>
      <Text>{`
Help with projection types: 
There are 3 methods used to calculated a projected GDD target date.
Estimated: An average of the historical and forecasted weather is taken to estimate the completion date.
Forecast: The forecasted weather is taken to estimate the completion.
Actual: The GDD target has already been met.

Help with GDD algorithm:
There are two varieties of GDD algorithm in use. Please see wikipedia for more details.

Help with base temp:
Base temp is dependant on the grass variety.
`}</Text>
    </View>
  );
}
