import React, {useContext, useState} from 'react';
import {List, Searchbar, Text, useTheme} from 'react-native-paper';
import {Keyboard, StyleSheet, TextInput, View} from 'react-native';
import {AppScreenProps} from '../navigation/Root';
import AppBarIconButton from '../components/AppBarIconButton';
import MapLibreGL from '@maplibre/maplibre-react-native';
import {StateContext} from '../providers/StateContext';
import {fetchLocations} from '../api/Api';
import {WeatherApiLocation, prettyPrintLocationDescription} from '../api/Types';
import styles from '../Styles';
import {StateContextError} from '../providers/statecontext/Error';

const NUMBER_SEARCH_RESULTS = 5;
export default function AddLocationScreen({
  route,
  navigation,
}: AppScreenProps<'AddLocation'>): React.JSX.Element {
  const {addLocation} = useContext(StateContext);
  const [currentLocation, setCurrentLocation] = useState<
    WeatherApiLocation | undefined
  >();
  const [searchState, setSearchState] = useState({
    query: '',
    loading: false,
    showSuggestions: false,
  });
  const [searchResults, setSearchResults] = useState<WeatherApiLocation[]>([]);
  const theme = useTheme();

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AppBarIconButton
          disabled={currentLocation === undefined}
          icon="content-save"
          onPress={() => {
            if (currentLocation)
              addLocation({
                name: currentLocation.name,
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                country: currentLocation.country,
                admin1: currentLocation.admin1,
                apiId: currentLocation.id,
                weather: undefined,
                weatherStatus: {
                  status: 'Initialised',
                  lastRefreshedUnixMs: undefined,
                },
              }).catch(e => {
                if (e instanceof StateContextError) {
                  navigation.navigate('Drawer', {
                    screen: 'HomeLocationsTabs',
                    params: {
                      screen: 'Locations',
                      params: {displayErrorOnLoad: e.message},
                    },
                  });
                } else throw e;
              });
            if (route.params && currentLocation !== undefined) {
              if (route.params.fromScreen === 'AddTracker')
                navigation.navigate('AddTracker', {
                  kind: 'gdd',
                  fromAddLocationId: currentLocation?.id,
                });
              if (route.params.fromScreen === 'EditTracker')
                navigation.navigate('EditTracker', {
                  trackerId: route.params.trackerId,
                  fromAddLocationId: currentLocation?.id,
                });
            } else {
              navigation.goBack();
            }
          }}
        />
      ),
    });
  }, [currentLocation]);

  // Handle state updates to provide search suggestions whilst handling race conditions.
  React.useEffect(() => {
    let active = true;
    if (searchState.query.length !== 0) {
      console.log('Requesting search results');
      setSearchState({...searchState, query: searchState.query, loading: true});
      fetchLocations(searchState.query, NUMBER_SEARCH_RESULTS).then(l => {
        if (active === true) {
          if (l) {
            console.log('Setting search results');
            setSearchResults(l.results);
          } else {
            console.log('Error in search results, so setting to empty');
            setSearchResults([]);
          }
          setSearchState({
            ...searchState,
            query: searchState.query,
            loading: false,
          });
        }
      });
    } else
      setSearchState({
        query: searchState.query,
        loading: false,
        showSuggestions: false,
      });
    return () => {
      active = false;
      console.log('Closing search suggestions effect');
    };
  }, [searchState.query]);

  function prettyLocTooltip(): string {
    if (currentLocation === undefined) return '';
    return `${currentLocation.name} ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`;
  }
  function latLongArray(): number[] {
    return currentLocation
      ? [currentLocation.longitude, currentLocation.latitude]
      : [0, 0];
  }

  return (
    <View style={styles.addLocationsPage}>
      <MapLibreGL.MapView
        style={styles.map}
        logoEnabled={true}
        zoomEnabled={false}
        scrollEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        styleURL="https://demotiles.maplibre.org/style.json">
        <MapLibreGL.Camera
          zoomLevel={currentLocation ? 2 : 1}
          centerCoordinate={latLongArray()}
        />
        {currentLocation ? (
          // NOTE: Icon looks shit in light mode - greyed out when selected and black when not.
          <MapLibreGL.PointAnnotation
            id="pt-ann"
            key="pt-ann"
            coordinate={latLongArray()}
            selected={false}
            anchor={{x: 0.5, y: 1}}
            title="Location">
            <View></View>
          </MapLibreGL.PointAnnotation>
        ) : undefined}
      </MapLibreGL.MapView>
      <View style={{position: 'absolute', top: 10}}>
        <Searchbar
          onChangeText={t => {
            setSearchState({...searchState, showSuggestions: true, query: t});
          }}
          onSubmitEditing={_ =>
            setSearchState({...searchState, showSuggestions: true})
          }
          value={searchState.query}
          style={{width: 380}}
          loading={searchState.loading}
        />
        {searchState.showSuggestions && searchResults.length !== 0 ? (
          <List.Section
            style={{
              borderRadius: 10,
              backgroundColor: theme.colors.background,
              opacity: 0.85,
            }}>
            {searchResults.map(s => {
              return (
                <List.Item
                  title={s.name}
                  key={s.id}
                  description={prettyPrintLocationDescription(s)}
                  right={() => <List.Icon icon="magnify" />}
                  onPress={_ => {
                    Keyboard.dismiss(), setCurrentLocation(s);
                    setSearchState({
                      ...searchState,
                      query: '',
                      showSuggestions: false,
                    });
                  }}
                />
              );
            })}
          </List.Section>
        ) : undefined}
      </View>
      <View style={{position: 'absolute', bottom: 0}}>
        <Text style={{color: 'black'}} variant="titleLarge">
          {prettyLocTooltip()}
        </Text>
      </View>
    </View>
  );
}
