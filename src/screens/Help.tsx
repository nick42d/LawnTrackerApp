import React from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Markdown from 'react-native-markdown-display';
import {Text, useTheme} from 'react-native-paper';
import styles from '../Styles';

const HELP_TEXT_MD = `
## Support
As the app is free software and I am a hobbyist, I have limited time to support different use cases. However, please private message me [on GitHub](https://github.com/nick42d), and I will help where I can.
## Lodging issues
Issues, bugs and feature requests can be [logged on GitHub](https://github.com/nick42d/LawnTrackerApp/issues).
## Types of trackers
There are 3 currently implemented tracker types.
- GDD: A GDD (Growing Degree Day) tracker is designed to keep track of lawn tasks that are growing degree sensitive (for example PGR application). You will get a notification when the GDD target has been reached. When the product is re-applied, you can Reset the tracker to set the start date to the current date.
- Timed: A timed tracker is designed to keep track of lawn tasks that are periodic (for example fertiliser application). You will get a notification when the duration has been met. When the product is re-applied, you can Reset the tracker to set the start date to the current date.
- Calendar: A calendar tracker is designed to keep track of infrequent tasks that occur on a certain date (for example renovation). You will get a notification on the date.
## Information about GDD Trackers
### Projection types 
There are 3 methods used to calculated a projected GDD target date.
- Historical: Based on historical weather data, the GDD target was met on the historical date.
- Forecast: Based on historical weather data and/or weather forecasts, the GDD target will be met on the forecasted date.
- Estimated: The GDD target will be met beyond the latest weather forecast. An average of historical and forecasted weather is used to project the estimated date.
### GDD algorithm
There are two varieties of GDD algorithm to use. Please see [the Wikipedia article on Growing Degree Days](https://en.wikipedia.org/wiki/Growing_degree-day) for more details.
### Base temp
Base temp is dependant on the grass variety, for example, cool seasons grasses generally see growth at the lower temperature.
## License
This app is free software licensed under the GPL v2 license.
Weather data by [Open-Meteo.com](https://www.open-meteo.com)
`;
export default function HelpScreen() {
  const theme = useTheme();
  return (
    <ScrollView>
      <View style={styles.marginView}>
        <Markdown
          style={{
            link: {color: theme.colors.primary},
            body: {color: theme.colors.onBackground},
          }}>
          {HELP_TEXT_MD}
        </Markdown>
      </View>
    </ScrollView>
  );
}
