import React, {useContext, useState} from 'react';
import {Icon, List, Searchbar, Text, useTheme} from 'react-native-paper';
import {Keyboard, StyleSheet, TextInput, View} from 'react-native';
import {AppScreenProps} from '../navigation/Root';
import SaveButton from '../components/SaveButton';
import MapLibreGL from '@maplibre/maplibre-react-native';
import {StateContext} from '../providers/StateContext';
import {fetchLocations} from '../Api';
import {WeatherAppLocation} from '../api/Types';
import styles from '../Styles';

const NUMBER_SEARCH_RESULTS = 5;
type AddLocationCardState = {
  name: string;
  apiId: number;
  latitude: number;
  longitude: number;
  admin1: string;
  country: string;
};
export default function AddLocationCardScreen({
  route,
  navigation,
}: AppScreenProps<'AddLocationCard'>): React.JSX.Element {
  const {addLocation} = useContext(StateContext);
  const [state, setState] = useState<AddLocationCardState | undefined>();
  const [searchState, setSearchState] = useState({
    query: '',
    loading: false,
    showSuggestions: false,
  });
  const [searchResults, setSearchResults] = useState<WeatherAppLocation[]>([]);
  const theme = useTheme();

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <SaveButton
          disabled={state === undefined}
          onPress={() => {
            if (state)
              try {
                addLocation({
                  name: state.name,
                  latitude: state.latitude,
                  longitude: state.longitude,
                  country: state.country,
                  admin1: state.admin1,
                  apiId: state.apiId,
                  weather: undefined,
                  weatherStatus: {
                    status: 'Initialised',
                    lastRefreshedUnixMs: undefined,
                  },
                });
              } catch (e) {
                console.error('Unhandled error: ', e);
              }

            if (route.params?.fromAddGddTracker && state !== undefined) {
              navigation.navigate('AddGddTracker', {
                fromAddLocationId: state?.apiId,
              });
            } else {
              navigation.goBack();
            }
          }}
        />
      ),
    });
  }, [state]);

  // Handle state updates to provide search suggestions whilst handling race conditions.
  React.useEffect(() => {
    let active = true;
    if (searchState.query.length !== 0) {
      console.log('Requesting search results');
      setSearchState({...searchState, query: searchState.query, loading: true});
      fetchLocations(searchState.query, NUMBER_SEARCH_RESULTS).then(l => {
        if (active === true) {
          if (l) {
            console.log('setting search results');
            setSearchResults(l);
          } else {
            console.log('Got no search results');
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
    if (state === undefined) return '';
    return `${state.name} ${state.latitude.toFixed(4)}, ${state.longitude.toFixed(4)}`;
  }
  function latLongArray(): number[] {
    return state ? [state.longitude, state.latitude] : [0, 0];
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
        <MapLibreGL.UserLocation
          onUpdate={loc =>
            console.log(
              `Received location change, set location to ${JSON.stringify(loc)}`,
            )
          }
        />
        <MapLibreGL.Camera
          zoomLevel={state ? 2 : 1}
          centerCoordinate={latLongArray()}
        />
        {state ? (
          // NOTE: Icon looks shit in light mode - greyed out when selected and black when not.
          <MapLibreGL.PointAnnotation
            id="pt-ann"
            key="pt-ann"
            coordinate={latLongArray()}
            selected={false}
            anchor={{x: 0.5, y: 1}}
            title="Location">
            <Icon source="map-marker" size={40} />
            <MapLibreGL.Callout title={prettyLocTooltip()} />
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
                  key={s.apiId}
                  description={s.admin1 + ', ' + s.country}
                  right={() => <List.Icon icon="magnify" />}
                  onPress={_ => {
                    Keyboard.dismiss(),
                      setState({
                        latitude: s.latitude,
                        longitude: s.longitude,
                        name: s.name,
                        country: s.country,
                        apiId: s.apiId,
                        admin1: s.admin1,
                      });
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
