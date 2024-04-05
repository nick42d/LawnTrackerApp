import {
  Button,
  Card,
  Dialog,
  FAB,
  Icon,
  Portal,
  Text,
} from 'react-native-paper';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { TrackerCard } from '../components/TrackerCard';
import { HomeLocationsTabScreenProps } from '../navigation/Root';
import styles from '../Styles';
import { StateContext } from '../providers/StateContext';
import ConfirmationDialog from '../components/ConfirmationDialog';

export default function HomeScreen({
  route,
  navigation,
}: HomeLocationsTabScreenProps<'Home'>) {
  const [refreshing, setRefreshing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  // Required to use a higher order function due to type signature of useState.
  const [dialogCallback, setDialogCallback] = useState(() => () => { });
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const {
    trackers: gddTrackers,
    refreshWeather,
    deleteTrackerName: deleteGddTrackerName,
    resetGddTrackerName,
  } = React.useContext(StateContext);

  const onRefresh = React.useCallback(() => {
    console.log('Refreshing Home screen');
    setRefreshing(true);
    if (refreshWeather !== undefined) {
      refreshWeather();
    } else {
      console.log('Refresh callback not set, doing nothing');
    }
    setRefreshing(false);
  }, [refreshWeather]);

  function onDelete(name: string) {
    // Required to use a higher order function due to type signature of useState.
    setDialogCallback(() => () => {
      deleteGddTrackerName(name);
      setShowDialog(false);
    });
    setDialogTitle('Confirm deletion');
    setDialogMessage('Are you sure you want to delete?');
    setShowDialog(true);
  }
  function onReset(name: string) {
    // Required to use a higher order function due to type signature of useState.
    setDialogCallback(() => () => {
      resetGddTrackerName(name);
      setShowDialog(false);
    });
    setDialogTitle('Confirm reset');
    setDialogMessage('Are you sure you want to reset?');
    setShowDialog(true);
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={gddTrackers}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TrackerCard
            item={item}
            navigation={navigation}
            onDelete={() => onDelete(item.name)}
            onReset={() => onReset(item.name)}
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
              navigation.navigate('AddCalendarTracker');
            },
          },
          {
            label: 'Timed Tracker',
            icon: 'clock-start',
            onPress: () => {
              console.log('Pressed add Timed Tracker button');
              navigation.navigate('AddTimedTracker');
            },
          },
          {
            label: 'GDD Tracker',
            icon: 'weather-cloudy-clock',
            onPress: () => {
              console.log('Pressed add GDD Tracker button');
              navigation.navigate('AddGddTracker');
            },
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
        onPress={() => {
          console.log('Pressed add button on home screen a second time');
        }}
      />
      <Portal>
        <ConfirmationDialog
          title={dialogTitle}
          message={dialogMessage}
          visible={showDialog}
          setVisible={setShowDialog}
          onOk={dialogCallback}
        />
      </Portal>
    </View>
  );
}
