import React, {useContext, useEffect, useState} from 'react';
import {List, Portal, Switch, Text} from 'react-native-paper';
import {ScrollView, View} from 'react-native';
import SettingsListItem from './settingslist/SettingsListItem';
import {SettingsListProps} from './settingslist/Types';
import SettingsListDialog from './settingslist/SettingsListDialog';

export default function SettingsList(props: {list: SettingsListProps[]}) {
  const [dialogShown, setDialogShown] = useState<number | undefined>(undefined);
  function showDialog(idx: number) {
    setDialogShown(idx);
  }
  function hideDialog(idx: number) {
    setDialogShown(undefined);
  }
  function dialogVisible(idx: number): boolean {
    if (dialogShown === idx) return true;
    return false;
  }
  return (
    <ScrollView>
      <List.Section>
        {props.list.map((l, idx) => (
          <SettingsListItem
            key={l.key}
            item={l}
            showDialog={() => showDialog(idx)}
          />
        ))}
      </List.Section>
      <Portal>
        {props.list.map((l, idx) => {
          if (l.kind === 'list' || l.kind === 'slider' || l.kind === 'press')
            return (
              <SettingsListDialog
                key={l.key}
                item={l}
                visible={dialogVisible(idx)}
                hideDialog={() => hideDialog(idx)}
              />
            );
        })}
      </Portal>
    </ScrollView>
  );
}
