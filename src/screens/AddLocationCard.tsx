import React, {useContext, useState} from 'react';
import {Icon, List, Searchbar, Text} from 'react-native-paper';
import {ScrollView, StyleSheet, View} from 'react-native';
import {AppScreenNavigationProp, AppScreenProps} from '../navigation/Root';
import SaveButton from '../components/SaveButton';
import MapLibreGL, {
  MarkerView,
  Location,
  MapView,
} from '@maplibre/maplibre-react-native';
import styles from '../Styles';
import {StateContext} from '../providers/StateContext';
import {fetchLocations} from '../Api';
import {WeatherAppLocation} from '../api/Types';

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
  route,
  navigation,
}: AppScreenProps<'AddLocationCard'>): React.JSX.Element {
  const {addLocation} = useContext(StateContext);
  const [coordinate, setCoordinate] = useState([0.5, 0.5]);
  const [locName, setLocName] = useState('');
  const [locUndefined, setLocUndefined] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<WeatherAppLocation[]>([]);
  const [searchResultsShown, setSearchResultsShown] = useState(false);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        SaveButton(locUndefined, () => {
          addLocation({
            name: locName,
            latitude: coordinate[1],
            longitude: coordinate[0],
            weather: {
              today: undefined,
              historical: undefined,
              forecast: undefined,
            },
          });
          navigation.goBack();
          route.params?.onGoBack(locName);
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
          anchor={{x: 0.5, y: 1}}
          title="Location">
          <Icon source="map-marker" size={40} />
          <MapLibreGL.Callout
            title={`${locName} ${coordinate[1].toFixed(4)}, ${coordinate[0].toFixed(4)}`}
          />
        </MapLibreGL.PointAnnotation>
      </MapLibreGL.MapView>
      <View style={{position: 'absolute', top: 10}}>
        <Searchbar
          onChangeText={t => {
            setSearch(t);
            fetchLocations(search, 5).then(l => {
              if (l) {
                console.log('setting search results');
                setSearchResults(l.locations);
                setSearchResultsShown(true);
              }
            });
          }}
          onSubmitEditing={_ =>
            fetchLocations(search, 5).then(l => {
              if (l) {
                console.log('setting search results');
                // DUPLICATE CODE
                setSearchResults(l.locations);
                setSearchResultsShown(true);
              }
            })
          }
          value={search}
          style={{width: 380}}
        />
        {searchResultsShown ? (
          <List.Section
            style={{borderRadius: 10, backgroundColor: 'black', opacity: 0.8}}>
            {searchResults.map((s, i) => {
              return (
                <List.Item
                  title={s.name}
                  key={i}
                  description={s.admin1 + ', ' + s.country}
                  right={() => <List.Icon icon="magnify" />}
                  onPress={_ => {
                    setCoordinate([s.longitude, s.latitude]);
                    setSearchResultsShown(false);
                  }}
                />
              );
            })}
          </List.Section>
        ) : (
          <View></View>
        )}
      </View>
      <View style={{position: 'absolute', bottom: 0}}>
        <Text style={{color: 'black'}} variant="titleLarge">
          {locName}: {coordinate[0].toFixed(2)},{coordinate[1].toFixed(2)}
        </Text>
      </View>
    </View>
  );
}
