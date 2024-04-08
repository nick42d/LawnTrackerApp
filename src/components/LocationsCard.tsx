import {Image, StyleSheet, View} from 'react-native';
import {Button, Card, Icon, Text} from 'react-native-paper';
import {CARD_TITLE_VARIANT} from '../Components';
import * as central_styles from '../Styles';
import {HomeLocationsTabScreenProps} from '../navigation/Root';
import {Location} from '../providers/statecontext/Locations';
import {useContext} from 'react';
import {
  WEATHER_IMAGES,
  WeatherImagesObject,
} from '../../assets/weather_icons/WeatherImages';
import {StateContext} from '../providers/StateContext';
import {WeatherAppCondition} from '../api/Types';
import {WeatherLeftCallout} from './locationscard/LeftCallout';
import {format} from 'date-fns';
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
    ? getWeatherImagesObject(location.weather.current_condition)
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
      ? location.weather.temperature_unit !== settings.unit_of_measure
        ? TemperatureConverter(location.weather.current_condition.temp)
        : location.weather.current_condition.temp
      : undefined;
  return (
    <Card
      mode="elevated"
      style={central_styles.default.listCard}
      onPress={() => {
        console.log('Pressed location card');
        // For debugging purposes
        const debugPrintLocation = {
          ...location,
          weather: {
            ...location.weather,
            weather_array: location.weather?.weather_array.map(w => ({
              date: format(
                new Date(w.date_unix * 1000),
                'dd/MM/yy HH:mm:ss.SSS',
              ),
              weather_type: w.weather_type,
              maxtemp: w.maxtemp,
              mintemp: w.mintemp,
            })),
          },
        };
        console.log(JSON.stringify(debugPrintLocation, null, ' '));
      }}>
      <Card.Title
        title={location.name}
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
          Logging start: Insert start date
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
