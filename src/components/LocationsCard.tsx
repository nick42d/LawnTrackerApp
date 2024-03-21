import {Image, StyleSheet, View} from 'react-native';
import {Button, Card, Icon, Text} from 'react-native-paper';
import {CARD_TITLE_VARIANT} from '../Components';
import * as central_styles from '../Styles';
import {HomeLocationsTabScreenProps} from '../navigation/Root';
import {Location} from '../state/State';
import {useContext} from 'react';
import {
  WEATHER_IMAGES,
  WeatherImagesObject,
} from '../../assets/weather_icons/WeatherImages';
import {StateContext} from '../providers/StateContext';
import {WeatherAppCondition} from '../api/Types';

type LocationsCardProps = {
  location: Location;
  navigation: HomeLocationsTabScreenProps<'Locations'>['navigation'];
};

export function LocationsCard({location, navigation}: LocationsCardProps) {
  // Unsure if this is better than prop drilling
  const {deleteLocationName} = useContext(StateContext);
  function onDelete() {
    // TODO: Check that no GddCards use this location
    if (deleteLocationName !== undefined) deleteLocationName(location.name);
  }
  // TODO: Type checking
  function getWeatherImagesObject(condition: WeatherAppCondition) {
    const weatherImageSrc = WEATHER_IMAGES.find(x => x.code === condition.code);
    if (weatherImageSrc === undefined) return undefined;
    if (condition.isDay) {
      return {img: weatherImageSrc.daySrc, desc: weatherImageSrc.descDay};
    } else {
      return {img: weatherImageSrc.nightSrc, desc: weatherImageSrc.descNight};
    }
  }
  const weatherImages = location.weather
    ? getWeatherImagesObject(location.weather.current_condition)
    : undefined;
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
        subtitle={weatherImages?.desc}
        titleVariant={CARD_TITLE_VARIANT}
        left={() => (
          <Text>{location.weather?.current_condition.temp.toString()}°</Text>
        )}
        right={() => <Image source={weatherImages?.img} />}
      />
      <Card.Content>
        <Text>
          <Icon source="latitude" size={20} />
          {location.latitude.toFixed(4)}
        </Text>
        <Text>
          <Icon source="longitude" size={20} />
          {location.longitude.toFixed(4)}
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
