import React, {useContext, useEffect, useState} from 'react';
import {
  AddTrackerInput,
  AddTrackerSchema,
  defaultAddTrackerInput,
} from '../providers/statecontext/Trackers';
import {AppScreenProps} from '../navigation/Root';
import AppBarIconButton from '../components/AppBarIconButton';
import {StateContext} from '../providers/StateContext';
import * as v from 'valibot';
import AddTrackerList from '../components/AddTrackerList';
import {ScrollView} from 'react-native-gesture-handler';
import {getAddTrackerProps} from './addtracker/AddTrackerProps';
import {SettingsContext} from '../providers/SettingsContext';

export default function AddTrackerScreen({
  route,
  navigation,
}: AppScreenProps<'AddTracker'>) {
  const {addTracker, locations} = useContext(StateContext);
  const {settings} = useContext(SettingsContext);
  // TODO: Safety for locationId
  const [state, setState] = useState<AddTrackerInput>(() =>
    defaultAddTrackerInput({
      kind: route.params.kind,
      locationId: locations.at(0)?.apiId ?? -1,
      baseTemp: settings.default_base_temp,
    }),
  );
  const [showLocationsDialog, setShowLocationsDialog] = useState(false);
  // If we navigated here from Add Locations Screen, make sure the dialog is shown
  // and set the added location as selected.
  useEffect(() => {
    const params = route.params;
    if (
      params !== undefined &&
      params.kind === 'gdd' &&
      params.fromAddLocationId !== undefined &&
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
                addTracker(parse.output);
                navigation.goBack();
              }
            }}
          />
        );
      },
    });
  }, [state]);
  const addTrackerProps = getAddTrackerProps(
    locations,
    state,
    showLocationsDialog,
    setState,
    setShowLocationsDialog,
    () => navigation.navigate('AddLocation', {fromScreen: 'AddTracker'}),
  );
  return (
    <ScrollView>
      <AddTrackerList list={addTrackerProps} />
    </ScrollView>
  );
}
