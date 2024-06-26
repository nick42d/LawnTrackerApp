import {
  Button,
  Card,
  Dialog,
  FAB,
  Icon,
  Portal,
  Text,
} from 'react-native-paper';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {TrackerCard} from '../components/TrackerCard';
import {HomeLocationsTabScreenProps} from '../navigation/Root';
import styles from '../Styles';
import {StateContext} from '../providers/StateContext';
import ConfirmationDialog from '../components/ConfirmationDialog';

export default function HomeScreen({
  route,
  navigation,
}: HomeLocationsTabScreenProps<'Home'>) {
  const [refreshing, setRefreshing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  // Required to use a higher order function due to type signature of useState.
  const [dialogCallback, setDialogCallback] = useState(() => () => {});
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const {
    trackers,
    refreshWeather,
    deleteTrackerId,
    resetTrackerId,
    stopTrackerId,
    resumeTrackerId,
    cancelSnoozeTrackerId,
  } = React.useContext(StateContext);

  const onRefresh = React.useCallback(() => {
    // TODO: Consider double refresh
    console.log('Refreshing Home screen');
    setRefreshing(true);
    refreshWeather()
      .then(_ => setRefreshing(false))
      .catch(e => setRefreshing(false));
  }, [refreshWeather]);

  function onDelete(name: string) {
    // Required to use a higher order function due to type signature of useState.
    setDialogCallback(() => () => {
      deleteTrackerId(name);
      setShowDialog(false);
    });
    setDialogTitle('Confirm delete tracker');
    setDialogMessage('Are you sure you want to delete?');
    setShowDialog(true);
  }
  function onReset(name: string) {
    // Required to use a higher order function due to type signature of useState.
    setDialogCallback(() => () => {
      resetTrackerId(name);
      setShowDialog(false);
    });
    setDialogTitle('Confirm reset tracker');
    setDialogMessage(
      'Are you sure you want to reset? Tracker start date will be set to today',
    );
    setShowDialog(true);
  }
  function onStop(name: string) {
    // Required to use a higher order function due to type signature of useState.
    setDialogCallback(() => () => {
      stopTrackerId(name);
      setShowDialog(false);
    });
    setDialogTitle('Confirm stop tracker');
    setDialogMessage('Are you sure you want to stop?');
    setShowDialog(true);
  }
  return (
    <View style={{flex: 1}}>
      <FlatList
        data={trackers}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <TrackerCard
            item={item}
            navigation={navigation}
            onDelete={() => onDelete(item.uuid)}
            onReset={() => onReset(item.uuid)}
            onStop={() => onStop(item.uuid)}
            // These cases don't need validation, no ill effects can occur.
            onResume={() => resumeTrackerId(item.uuid)}
            onCancelSnooze={() => cancelSnoozeTrackerId(item.uuid)}
          />
        )}
      />
      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? 'close' : 'plus'}
        actions={[
          {
            label: 'Calendar Tracker',
            icon: 'calendar-clock',
            onPress: () => {
              console.log('Pressed add Calendar Tracker button');
              navigation.navigate('AddTracker', {kind: 'calendar'});
            },
          },
          {
            label: 'Timed Tracker',
            icon: 'clock-start',
            onPress: () => {
              console.log('Pressed add Timed Tracker button');
              navigation.navigate('AddTracker', {kind: 'timed'});
            },
          },
          {
            label: 'GDD Tracker',
            icon: 'weather-cloudy-clock',
            onPress: () => {
              console.log('Pressed add GDD Tracker button');
              navigation.navigate('AddTracker', {kind: 'gdd'});
            },
          },
        ]}
        onStateChange={({open}) => setFabOpen(open)}
        onPress={() => {
          console.log('Pressed add button on home screen a second time');
        }}
      />
      <Portal>
        <ConfirmationDialog
          title={dialogTitle}
          message={dialogMessage}
          visible={showDialog}
          hideDialog={() => setShowDialog(false)}
          onOk={dialogCallback}
        />
      </Portal>
    </View>
  );
}
