import {useContext} from 'react';
import {GddTracker} from './Types';
import {WeatherContext} from './providers/WeatherContext';
import {calcGdd} from './Knowledge';
import {T_BASE} from './Consts';
import {SettingsContext} from './providers/SettingsContext';
import {Button, Card, Icon, Text} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import {Location} from './state/State';
import {HomeWeatherTabScreenProps} from './navigation/Root';
import * as central_styles from './Styles';

type CardPropsParamList = {
  item: GddTracker;
  navigation: HomeWeatherTabScreenProps<'Home'>['navigation'];
  onDelete: () => void;
  onReset: () => void;
};

type LocationsCardProps = {
  location: Location;
  navigation: HomeWeatherTabScreenProps<'Locations'>['navigation'];
};

export function LocationsCard({location, navigation}: LocationsCardProps) {
  return (
    <Card
      mode="elevated"
      style={central_styles.default.listCard}
      onPress={() => {
        console.log('Pressed location card');
      }}>
      <Card.Title
        title={location.name}
        subtitle={location.weather.today?.description}
        left={() => <Text>20</Text>}
      />
      <Card.Content>
        <Text>
          <Icon source="latitude" size={20} />
          {location.latitude}
        </Text>
        <Text>
          <Icon source="longitude" size={20} />
          {location.longitude}
        </Text>
        <Text>
          <Icon source="calendar-start" size={20} />
          Insert start date
        </Text>
      </Card.Content>
    </Card>
  );
}

export function GddCard({
  item,
  onReset,
  onDelete,
  navigation,
}: CardPropsParamList) {
  function calc_gdd_total() {
    const daily_gdds = useContext(WeatherContext);
    const daily_gdds_filter = daily_gdds.historical.forecasts.filter(
      this_item => this_item.date >= item.start_date,
    );
    const daily_gdds_arr = daily_gdds_filter.map(item_2 =>
      calcGdd(item_2.mintemp_c, item_2.maxtemp_c, T_BASE),
    );
    return Math.round(daily_gdds_arr.reduce((res, cur) => res + cur, 0));
  }
  const actual_gdd = calc_gdd_total();
  const settings = useContext(SettingsContext);
  return (
    <Card
      mode="elevated"
      style={central_styles.default.listCard}
      onPress={() => {
        console.log('Pressed card');
        navigation.navigate('ViewCard', {
          gddCard: item,
        });
      }}>
      <Card.Title
        title={item.name}
        subtitle={item.description}
        left={() => (
          <Text
            variant="bodyLarge"
            style={GetGddTitleStyle(
              settings.warning_threshold_perc,
              actual_gdd,
              item.target_gdd,
            )}>
            {actual_gdd}
          </Text>
        )}
      />
      <Card.Content>
        <Text>
          <Icon source="map-marker" size={20} />
          Location: {item.location_name}
        </Text>
        <Text>
          <Icon source="target" size={20} />
          Target GDD: {item.target_gdd}
        </Text>
        <Text>
          <Icon source="calendar-start" size={20} />
          Start date: {item.start_date.toDateString()}
        </Text>
        <Text>
          <Icon source="calendar-end" size={20} />
          Projected end date: tbc
        </Text>
        <Text>
          <Icon source="chart-timeline-variant-shimmer" size={20} />
          Projection type: tbc
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={onReset}>
          <Icon source="rotate-left" size={20} />
          Reset
        </Button>
        <Button onPress={onDelete}>
          <Icon source="delete" size={20} />
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );
}
const styles = StyleSheet.create({
  cardTitleAmber: {
    backgroundColor: 'orange',
  },
  cardTitleRed: {
    backgroundColor: 'red',
  },
  cardTitle: {},
  fabStyle: {
    bottom: 16,
    right: 16,
    position: 'absolute',
  },
});

function GetGddTitleStyle(
  warning_threshold_perc: number,
  cur: number,
  target: number,
) {
  const progress = cur / target;
  if (progress >= 1) {
    return styles.cardTitleRed;
  } else if (progress >= warning_threshold_perc) {
    return styles.cardTitleAmber;
  } else {
    return styles.cardTitle;
  }
}
