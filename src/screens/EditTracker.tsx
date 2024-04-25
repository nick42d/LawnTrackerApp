import React, {useContext, useEffect, useState} from 'react';
import {
  AddTrackerInput,
  AddTrackerSchema,
  getEditTrackerInput,
} from '../providers/statecontext/Trackers';
import {AppScreenProps} from '../navigation/Root';
import AppBarIconButton from '../components/AppBarIconButton';
import {StateContext} from '../providers/StateContext';
import * as v from 'valibot';
import AddTrackerList from '../components/AddTrackerList';
import {ScrollView} from 'react-native-gesture-handler';
import {getAddTrackerProps} from './addtracker/AddTrackerProps';
import {SettingsContext} from '../providers/SettingsContext';
import {Text} from 'react-native-paper';

export default function EditTrackerScreen({
  route,
  navigation,
}: AppScreenProps<'EditTracker'>) {
  const {changeTracker, locations, trackers} = useContext(StateContext);
  // TODO: Safety for locationId
  // On load set up state
  const [state, setState] = useState<AddTrackerInput | undefined>(() => {
    const tracker = trackers.find(t => t.uuid === route.params.trackerId);
    if (tracker) return getEditTrackerInput(tracker);
    return undefined;
  });
  const [showLocationsDialog, setShowLocationsDialog] = useState(false);

  // If we navigated here from Add Locations Screen, make sure the dialog is shown
  // and set the added location as selected.
  useEffect(() => {
    const params = route.params;
    if (
      params !== undefined &&
      params.fromAddLocationId &&
      state &&
      state.kind === 'gdd'
    ) {
      setState({...state, locationId: params.fromAddLocationId});
      setShowLocationsDialog(true);
    }
  }, [route.params]);
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        const parse = v.safeParse(AddTrackerSchema, state);
        return (
          <AppBarIconButton
            disabled={!parse.success}
            icon="content-save"
            onPress={() => {
              if (parse.success) {
                changeTracker(parse.output, route.params.trackerId);
                navigation.goBack();
              }
            }}
          />
        );
      },
    });
  }, [state]);
  const addTrackerProps = state
    ? getAddTrackerProps(
        locations,
        state,
        showLocationsDialog,
        setState,
        setShowLocationsDialog,
        () =>
          navigation.navigate('AddLocation', {
            fromScreen: 'EditTracker',
            trackerId: route.params.trackerId,
          }),
      )
    : undefined;
  return (
    <ScrollView>
      {addTrackerProps ? (
        <AddTrackerList list={addTrackerProps} />
      ) : (
        <Text>Error editing tracker</Text>
      )}
    </ScrollView>
  );
}
