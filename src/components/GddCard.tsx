import {StyleSheet, View} from 'react-native';
import {Button, Card, Icon, Text} from 'react-native-paper';
import {CARD_TITLE_VARIANT} from '../Components';
import * as central_styles from '../Styles';
import {GddTracker} from '../Types';
import {HomeLocationsTabScreenProps} from '../navigation/Root';
import {GDDAlgorithm, Location} from '../state/State';
import {calcGdd} from '../Knowledge';
import {useContext} from 'react';
import {SettingsContext} from '../providers/SettingsContext';
import {LocationsContext} from '../providers/LocationsContext';
import {WeatherSource, getGddEstimate, getGraphPlot} from '../plot/Gdd';

type CardPropsParamList = {
  item: GddTracker;
  navigation: HomeLocationsTabScreenProps<'Home'>['navigation'];
  onDelete: () => void;
  onReset: () => void;
};
function calc_gdd_total(
  item: GddTracker,
  locations: Location[],
  algorithm: GDDAlgorithm,
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
    calcGdd(item_2.mintemp_c, item_2.maxtemp_c, item.base_temp, algorithm),
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
  const actual_gdd = calc_gdd_total(item, locations, settings.algorithm);
  // TODO: Fix undefined case
  const estimateTemp = getGddEstimate(
    getGraphPlot(item, locations, settings.algorithm),
    item.target_gdd,
  );
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
        titleVariant={CARD_TITLE_VARIANT}
        left={() => (
          <View
            style={{
              borderRadius: 6,
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
          Projected end date:{' '}
          {new Date(estimateTemp?.estimateDateUnixMs).toDateString()}
        </Text>
        <Text>
          <Icon source="chart-timeline-variant-shimmer" size={20} />
          Projection type: {WeatherSource[estimateTemp?.estimateType]}
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
