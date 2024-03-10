import {Image, StyleSheet, View} from 'react-native';
import {Button, Card, Icon, Text} from 'react-native-paper';
import {CARD_TITLE_VARIANT} from '../Components';
import * as central_styles from '../Styles';
import {GddTracker} from '../Types';
import {HomeLocationsTabScreenProps} from '../navigation/Root';
import {Location} from '../state/State';
import {calcGdd} from '../Knowledge';
import {useContext} from 'react';
import {SettingsContext} from '../providers/SettingsContext';
import {LocationsContext} from '../providers/LocationsContext';
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
        navigation.navigate('ViewLocationCard', {location});
      }}>
      <Card.Title
        title={location.name}
        subtitle={location.weather.today?.description}
        titleVariant={CARD_TITLE_VARIANT}
        left={() => (
          <Text>{location.weather.historical?.pop()?.maxtemp_c}°</Text>
        )}
        right={() => (
          <Image
            source={require('../../assets/weather_icons/64x64/day/353.png')}
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
