import {useContext} from 'react';
import {GddTracker} from './Types';
import {LocationsContext} from './providers/LocationsContext';
import {calcGdd} from './Knowledge';
import {T_BASE} from './Consts';
import {SettingsContext} from './providers/SettingsContext';
import {Button, Card, Icon, Text} from 'react-native-paper';
import {Image, StyleSheet, View} from 'react-native';
import {Location} from './state/State';
import {HomeLocationsTabScreenProps} from './navigation/Root';
import * as central_styles from './Styles';

const TITLE_VARIANT = 'titleLarge';

type CardPropsParamList = {
  item: GddTracker;
  navigation: HomeLocationsTabScreenProps<'Home'>['navigation'];
  onDelete: () => void;
  onReset: () => void;
};

type LocationsCardProps = {
  location: Location;
  navigation: HomeLocationsTabScreenProps<'Locations'>['navigation'];
};

export function LocationsCard({location, navigation}: LocationsCardProps) {
  // Unsure if this is better than prop drilling
  const {deleteLocationName} = useContext(LocationsContext);
  function onDelete() {
    // TODO: Check that no GddCards use this location
    if (deleteLocationName !== undefined) deleteLocationName(location.name);
  }
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
        titleVariant={TITLE_VARIANT}
        left={() => (
          <Text>{location.weather.historical?.pop()?.maxtemp_c}°</Text>
        )}
        right={() => (
          <Image
            source={require('../assets/weather_icons/64x64/day/353.png')}
          />
        )}
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
      <Card.Actions>
        <Button onPress={onDelete}>
          <Icon source="delete" size={20} />
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );
}

function calc_gdd_total(
  item: GddTracker,
  locations: Location[],
): number | undefined {
  let itemsLocation = locations.find(loc => loc.name === item.location_name);
  if (itemsLocation === undefined) return undefined;
  if (itemsLocation.weather.historical === undefined) return undefined;
  const daily_gdds_filter = itemsLocation.weather.historical.filter(
    this_item =>
      // Locations has unix seconds time but item has unix ms
      this_item.date_unix >= item.start_date_unix_ms / 1000,
  );
  const daily_gdds_arr = daily_gdds_filter.map(item_2 =>
    calcGdd(item_2.mintemp_c, item_2.maxtemp_c, item.base_temp),
  );
  return Math.round(daily_gdds_arr.reduce((res, cur) => res + cur, 0));
}

export function GddCard({
  item,
  onReset,
  onDelete,
  navigation,
}: CardPropsParamList) {
  const {settings} = useContext(SettingsContext);
  const {locations} = useContext(LocationsContext);
  const actual_gdd = calc_gdd_total(item, locations);
  return (
    <Card
      mode="elevated"
      style={central_styles.default.listCard}
      onPress={() => {
        console.log('Pressed card');
        navigation.navigate('ViewGddCard', {
          gddCard: item,
        });
      }}>
      <Card.Title
        title={item.name}
        subtitle={item.description}
        titleVariant={TITLE_VARIANT}
        left={() => (
          <View
            style={{
              borderRadius: 5,
              ...GetGddTitleStyle(
                settings.warning_threshold_perc,
                actual_gdd as number,
                item.target_gdd,
              ),
            }}>
            <Text
              style={{textAlign: 'center', textAlignVertical: 'center'}}
              variant="bodyLarge">
              {actual_gdd}
            </Text>
          </View>
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
          Start date: {new Date(item.start_date_unix_ms).toDateString()}
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
