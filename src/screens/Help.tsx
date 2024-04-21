import React from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Markdown from 'react-native-markdown-display';
import {Text, useTheme} from 'react-native-paper';
import styles from '../Styles';

const HELP_TEXT_MD = `
## Support
As the app is free software and I am a hobbyist, I have limited time to support different use cases. However, I may be able to assist on GitHub - please private message me.
## Lodging issues
Issues, bugs and feature requests can be logged on GitHub, however I may not be able to respond to requests for support.
## Information about GDD Trackers
### Projection types 
There are 3 methods used to calculated a projected GDD target date.
- Historical: Based on historical weather data, the GDD target was met on the historical date.
- Forecast: Based on historical weather data and/or weather forecasts, the GDD target will be met on the forecasted date.
- Estimated: The GDD target will be met beyond the latest weather forecast. An average of historical and forecasted weather is used to project the estimated date.

### GDD algorithm
There are two varieties of GDD algorithm in use. Please see wikipedia for more details.

### Base temp
Base temp is dependant on the grass variety.
## License
This app is free software licensed under the GPL v2 license.
Weather data by [Open-Meteo.com](https://www.open-meteo.com)
`;
export default function HelpScreen() {
  const theme = useTheme();
  return (
    <ScrollView>
      <View style={styles.marginView}>
        <Markdown style={{body: {color: theme.colors.onBackground}}}>
          {HELP_TEXT_MD}
        </Markdown>
      </View>
    </ScrollView>
  );
}
