import React from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Markdown from 'react-native-markdown-display';
import {Text, useTheme} from 'react-native-paper';
import styles from '../Styles';

const HELP_TEXT_MD = `
## Help with projection types 
There are 3 methods used to calculated a projected GDD target date.
- Historical: Based on historical weather data, the GDD target was met on the historical date.
- Forecast: Based on historical weather data and/or weather forecasts, the GDD target will be met on the forecasted date.
- Estimated: The GDD target will be met beyond the latest weather forecast. An average of historical and forecasted weather is used to project the estimated date.

## Help with GDD algorithm
There are two varieties of GDD algorithm in use. Please see wikipedia for more details.

## Help with base temp
Base temp is dependant on the grass variety.
`;
export default function HelpScreen() {
  const theme = useTheme();
  return (
    <ScrollView style={styles.helpViewStyle}>
      <Markdown style={{body: {color: theme.colors.onBackground}}}>
        {HELP_TEXT_MD}
      </Markdown>
    </ScrollView>
  );
}
