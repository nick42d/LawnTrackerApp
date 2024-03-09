import React, {useContext, useState} from 'react';
import {
  Appbar,
  Banner,
  Divider,
  FAB,
  HelperText,
  Icon,
  MD3DarkTheme,
  MD3LightTheme,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {ScrollView, StyleSheet, View} from 'react-native';
import {DatePickerInput} from 'react-native-paper-dates';
import {BASE_TEMPS_C} from '../Knowledge';
import {newGddTracker} from '../Types';
import {AppScreenNavigationProp, AppScreenProps} from '../navigation/Root';
import {MAX_HISTORY_DAYS} from '../Consts';
import {onDisplayNotification} from '../Notification';
import {GddTracker} from '../Types';
import {LocationsContext} from '../providers/LocationsContext';
import {PaperSelect} from 'react-native-paper-select';
import SaveButton from '../components/SaveButton';
import MapLibreGL, {
  MarkerView,
  Location,
  MapView,
} from '@maplibre/maplibre-react-native';
import styles from '../Styles';
import {fetchWeatherCurrent} from '../Api';

const mapstyles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  map: {
    flex: 1,
    alignSelf: 'stretch',
  },
});

export default function AddLocationCardScreen({
  navigation,
}: AppScreenProps<'AddLocationCard'>): React.JSX.Element {
  const [coordinate, setCoordinate] = useState([0.5, 0.5]);
  const [locName, setLocName] = useState('');
  const [locUndefined, setLocUndefined] = useState(true);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        SaveButton(locUndefined, () => {
          navigation.navigate('Drawer', {
            screen: 'HomeLocationsTabs',
            params: {
              screen: 'Locations',
              params: {
                add_location: {
                  name: locName,
                  latitude: coordinate[1],
                  longitude: coordinate[0],
                },
              },
            },
          });
        }),
    });
  }, [coordinate, locName, locUndefined]);

  return (
    <View style={mapstyles.page}>
      <MapLibreGL.MapView
        style={mapstyles.map}
        logoEnabled={true}
        onPress={feat => {
          const coords = feat.geometry.coordinates;
          console.log(`Handling onPress on map, coords ${coords}`);
          setCoordinate(coords);
          fetchWeatherCurrent(coords[1], coords[0]).then(res => {
            if (res !== undefined) {
              console.log(`Got location name: ${res.location_name}`);
              setLocName(res.location_name);
              setLocUndefined(false);
            } else {
              setLocUndefined(true);
            }
          });
          console.log(`Setting onPress on map, coords ${coordinate}`);
          // ref?.getPointInView(coords).then(point => {
          //   console.log(`Setting marker coords ${point}`);
          //   setCoordinate(point);
          // });
          // ref
          //   ?.getPointInView([1, 1, 1])
          //   .then(json => {
          //     console.log('Component converted coordinates');
          //     setCoordinate(json);
          //     console.log(
          //       `old: ${feat.geometry.coordinates}, new: ${JSON.stringify(json)}`,
          //     );
          //   })
          //   .catch(err => console.log(`Error ${err} received`));
        }}
        styleURL="https://demotiles.maplibre.org/style.json">
        <MapLibreGL.UserLocation
          onUpdate={loc =>
            console.log(
              `Received location change, set location to ${JSON.stringify(loc)}`,
            )
          }
        />
        <MapLibreGL.Camera centerCoordinate={coordinate} />
        <MapLibreGL.PointAnnotation
          id="pt-ann"
          key="pt-ann"
          coordinate={coordinate}
          title="Location">
          <Icon source="map-marker" size={40} />
          <MapLibreGL.Callout
            title={`${locName} ${coordinate[1].toFixed(4)}, ${coordinate[0].toFixed(4)}`}
          />
        </MapLibreGL.PointAnnotation>
      </MapLibreGL.MapView>
    </View>
  );
}
