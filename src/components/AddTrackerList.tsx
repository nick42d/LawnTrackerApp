import React, {useContext, useEffect, useState} from 'react';
import {List, Portal, Switch, Text} from 'react-native-paper';
import {ScrollView, View} from 'react-native';
import SettingsListItem from './settingslist/SettingsListItem';
import {SettingsListProps} from './settingslist/Types';
import SettingsListDialog from './settingslist/SettingsListDialog';
import AddLocationsDialog from './addtrackerlist/AddLocationsDialog';
import {
  AddTrackerListLocationsItemProps,
  AddTrackerListProps,
  AddTrackerListSelectionItemProps,
} from './addtrackerlist/Types';
import AddTrackerListItem from './addtrackerlist/AddTrackerListItem';

export default function AddTrackerList(props: {list: AddTrackerListProps[]}) {
  // Currently only cater for one locations dialog.
  // SAFETY: find will only return the correct type here.
  const firstLocation = props.list.find(v => v.kind === 'locations') as
    | AddTrackerListLocationsItemProps
    | undefined;
  const firstLocationDialogShown = firstLocation
    ? firstLocation.showLocationsDialog
    : false;
  return (
    <View>
      <List.Section>
        {props.list.map(l => (
          <AddTrackerListItem key={l.key} item={l} />
        ))}
      </List.Section>
      <Portal>
        {
          // Dialog only relevant if there are locations in the list
          firstLocation && firstLocation.kind === 'locations' ? (
            <AddLocationsDialog
              visible={firstLocationDialogShown}
              locations={firstLocation.locations}
              selectedLocationId={firstLocation.selectedLocationId}
              navigateToLocations={firstLocation.navigateToAddLocation}
              hideDialog={() => {
                if (firstLocation !== undefined)
                  firstLocation.setShowLocationsDialog(false);
              }}
              onChange={firstLocation.onChangeLocationId}
            />
          ) : undefined
        }
      </Portal>
    </View>
  );
}
