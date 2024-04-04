import React, {useContext, useState} from 'react';
import {FAB, Portal, Snackbar, Text} from 'react-native-paper';
import {FlatList, RefreshControl, ScrollView, View} from 'react-native';
import styles from '../Styles';
import {LocationsCard} from '../components/LocationsCard';
import {HomeLocationsTabScreenProps} from '../navigation/Root';
import {StateContext} from '../providers/StateContext';
import {StateContextError} from '../providers/statecontext/Error';

export default function LocationsScreen({
  route,
  navigation,
}: HomeLocationsTabScreenProps<'Locations'>): React.JSX.Element {
  const {locations, refreshWeather, deleteLocationName} =
    useContext(StateContext);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const onRefresh = React.useCallback(() => {
    console.log('Refreshing on Locations screen');
    setRefreshing(true);
    if (refreshWeather !== undefined) {
      refreshWeather();
    } else {
      console.log('Refresh callback not set, doing nothing');
    }
    setRefreshing(false);
  }, [refreshWeather]);

  function onDelete(name: string) {
    // TODO: Check that no GddCards use this location
    if (deleteLocationName !== undefined) {
      try {
        deleteLocationName(name);
      } catch (e) {
        if (e instanceof StateContextError) {
          setAlert(e.message);
          setShowAlert(true);
        } else {
          throw e;
        }
      }
    }
  }
  return (
    <View style={{flex: 1}}>
      <FlatList
        data={locations}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <LocationsCard
            onDelete={() => onDelete(item.name)}
            location={item}
            navigation={navigation}
          />
        )}
      />
      <FAB
        icon={'plus'}
        onPress={() => {
          console.log('Pressed plus button on locations screen');
          navigation.navigate('AddLocationCard');
        }}
        style={[styles.fabStyle]}
      />
      <Portal>
        <Snackbar
          // Unsure if duration does anything
          duration={6000}
          visible={showAlert}
          action={{label: 'Dismiss', onPress: () => setShowAlert(false)}}
          onDismiss={() => setShowAlert(false)}>
          {alert}
        </Snackbar>
      </Portal>
    </View>
  );
}
