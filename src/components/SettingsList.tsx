import React, {useContext, useEffect, useState} from 'react';
import {List, Portal, Switch, Text} from 'react-native-paper';
import {SettingsContext} from '../providers/SettingsContext';
import {
  GddBaseTemp,
  GddAlgorithm,
  UNITS_OF_MEASURE,
  UnitOfMeasure,
  isUnitOfMeasure,
} from '../providers/settingscontext/Types';
import {ScrollView, View} from 'react-native';
import GenericSelectionDialog, {
  SliderSelectionDialog,
} from '../components/SelectionDialog';
import ConfirmationDialog from '../components/ConfirmationDialog';
import {StateContext} from '../providers/StateContext';
import SettingsListItem from './settingslist/SettingsListItem';
import {SettingsListProps} from './settingslist/Types';
import SettingsListDialog from './settingslist/SettingsListDialog';

export default function SettingsList(props: {list: SettingsListProps[]}) {
  const [state, setState] = useState(props.list);
  /**
   * NOTE: Array bounds not checked
   * @param idx
   * @param newState
   */
  function updateIndex(idx: number, newState: SettingsListProps) {
    setState(s => {
      const clonedState = [...s];
      clonedState[idx] = newState;
      return clonedState;
    });
  }
  return (
    <ScrollView>
      <List.Section>
        {state.map((l, idx) => (
          <SettingsListItem
            item={l}
            stateUpdater={(newState: SettingsListProps) =>
              updateIndex(idx, newState)
            }
          />
        ))}
      </List.Section>
      <Portal>
        {state.map((l, idx) => {
          if (l.kind === 'list' || l.kind === 'slider' || l.kind === 'press')
            return (
              <SettingsListDialog
                item={l}
                stateUpdater={(newState: SettingsListProps) =>
                  updateIndex(idx, newState)
                }
              />
            );
        })}
      </Portal>
    </ScrollView>
  );
}
