import React, {useContext, useState} from 'react';
import {
  Appbar,
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
  const [location, setLocation] = useState<Location>();
  const [coordinate, setCoordinate] = useState([0.5, 0.5]);
  const [ref, setRef] = useState<MapView | null>();

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        SaveButton(false, () => {
          navigation.navigate('Drawer', {
            screen: 'HomeLocationsTabs',
            params: {
              screen: 'Locations',
              params: {
                add_location: {
                  name: 'test',
                  latitude: coordinate[0],
                  longitude: coordinate[1],
                },
              },
            },
          });
        }),
    });
  }, [coordinate]);

  return (
    <View style={mapstyles.page}>
      <MapLibreGL.MapView
        ref={ref => {
          setRef(ref);
        }}
        style={mapstyles.map}
        logoEnabled={true}
        onPress={feat => {
          const coords = feat.geometry.coordinates;
          console.log(`Handling onPress on map, coords ${coords}`);
          setCoordinate(coords);
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
        onUserLocationUpdate={loc => {
          setLocation(loc);
          console.log(`set location to ${JSON.stringify(loc)}`);
        }}
        styleURL="https://demotiles.maplibre.org/style.json">
        <MapLibreGL.UserLocation />
        <MapLibreGL.Camera centerCoordinate={[50, 50]} />
        <MapLibreGL.MarkerView coordinate={coordinate}>
          <View>
            <Icon size={40} source="map-marker" />
          </View>
        </MapLibreGL.MarkerView>
        <MapLibreGL.PointAnnotation id="pt-ann" coordinate={coordinate}>
          <Icon size={40} source="camera" />
        </MapLibreGL.PointAnnotation>
      </MapLibreGL.MapView>
    </View>
  );
}
