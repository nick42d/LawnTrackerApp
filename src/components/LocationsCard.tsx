import {Image} from 'react-native';
import {Button, Card, Icon, Text} from 'react-native-paper';
import {CARD_TITLE_VARIANT} from '../Styles';
import * as central_styles from '../Styles';
import {HomeLocationsTabScreenProps} from '../navigation/Root';
import {
  Location,
  prettyPrintLocation,
} from '../providers/statecontext/Locations';
import {useContext} from 'react';
import {WEATHER_IMAGES} from '../../assets/weather_icons/WeatherImages';
import {WeatherAppCondition} from '../providers/statecontext/Locations';
import {WeatherLeftCallout} from './locationscard/LeftCallout';
import {SettingsContext} from '../providers/SettingsContext';
import {celsiustoFarenheit, farenheitToCelsius} from '../Knowledge';

type LocationsCardProps = {
  location: Location;
  navigation: HomeLocationsTabScreenProps<'Locations'>['navigation'];
  onDelete: () => void;
};

export function LocationsCard({
  location,
  navigation,
  onDelete,
}: LocationsCardProps) {
  const {settings} = useContext(SettingsContext);
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
    ? getWeatherImagesObject(location.weather.currentCondition)
    : undefined;
  const weatherStatus =
    location.weatherStatus.status === 'Refreshing'
      ? 'Refreshing'
      : location.weatherStatus.status === 'Initialised'
        ? 'Initialised'
        : undefined;
  // Convert weather unit if required.
  const TemperatureConverter =
    settings.unit_of_measure === 'Imperial'
      ? celsiustoFarenheit
      : farenheitToCelsius;
  const convertedTemperature =
    location.weather !== undefined
      ? location.weather.temperatureUnit !== settings.unit_of_measure
        ? TemperatureConverter(location.weather.currentCondition.temp)
        : location.weather.currentCondition.temp
      : undefined;
  const loggingStartUnixMs = location.weather?.weatherArray.at(0)?.dateUnixMs;
  return (
    <Card
      mode="elevated"
      style={central_styles.default.listCard}
      onPress={() => {
        console.log('Pressed location card');
        navigation.navigate('ViewLocation', {location});
      }}>
      <Card.Title
        title={prettyPrintLocation(location)}
        subtitle={weatherImages?.desc}
        titleVariant={CARD_TITLE_VARIANT}
        left={() => (
          <WeatherLeftCallout
            status={weatherStatus}
            unitOfMeasure={
              location.weather ? settings.unit_of_measure : undefined
            }
            temperature={convertedTemperature}
          />
        )}
        right={() => {
          if (weatherImages) return <Image source={weatherImages.img} />;
        }}
      />
      <Card.Content>
        <Text>
          <Icon source="latitude" size={20} />
          Latitude: {location.latitude.toFixed(4)}
        </Text>
        <Text>
          <Icon source="longitude" size={20} />
          Longitude: {location.longitude.toFixed(4)}
        </Text>
        <Text>
          <Icon source="calendar-start" size={20} />
          Logging start:{' '}
          {loggingStartUnixMs
            ? new Date(loggingStartUnixMs).toDateString()
            : ''}
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
