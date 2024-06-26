import React, {useContext, useEffect, useState} from 'react';
import {FAB, Portal, Snackbar, Text} from 'react-native-paper';
import {FlatList, RefreshControl, ScrollView, View} from 'react-native';
import styles from '../Styles';
import {LocationsCard} from '../components/LocationsCard';
import {HomeLocationsTabScreenProps} from '../navigation/Root';
import {StateContext} from '../providers/StateContext';
import {StateContextError} from '../providers/statecontext/Error';

const WARNING_SNACKBAR_DURATION_MS = 10000;

export default function LocationsScreen({
  route,
  navigation,
}: HomeLocationsTabScreenProps<'Locations'>): React.JSX.Element {
  const {locations, refreshWeather, deleteLocationId} =
    useContext(StateContext);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  useEffect(() => {
    if (route.params?.displayErrorOnLoad) {
      setAlert(route.params.displayErrorOnLoad);
      setShowAlert(true);
      navigation.setParams({displayErrorOnLoad: undefined});
    }
  }, [route.params?.displayErrorOnLoad]);
  const onRefresh = React.useCallback(() => {
    console.log('Refreshing on Locations screen');
    setRefreshing(true);
    refreshWeather()
      .then(_ => setRefreshing(false))
      .catch(e => setRefreshing(false));
  }, [refreshWeather]);

  function onDelete(id: number) {
    try {
      deleteLocationId(id);
    } catch (e) {
      if (e instanceof StateContextError) {
        setAlert(e.message);
        setShowAlert(true);
      } else {
        throw e;
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
            onDelete={() => onDelete(item.apiId)}
            location={item}
            navigation={navigation}
          />
        )}
      />
      <FAB
        icon={'plus'}
        onPress={() => {
          console.log('Pressed plus button on locations screen');
          navigation.navigate('AddLocation');
        }}
        style={[styles.fabStyle]}
      />
      <Portal>
        <Snackbar
          // 10 seconds
          duration={WARNING_SNACKBAR_DURATION_MS}
          visible={showAlert}
          action={{label: 'Dismiss', onPress: () => setShowAlert(false)}}
          onDismiss={() => setShowAlert(false)}>
          {alert}
        </Snackbar>
      </Portal>
    </View>
  );
}
