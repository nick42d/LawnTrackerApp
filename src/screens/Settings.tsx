import React, {useContext, useEffect, useState} from 'react';
import {Divider, List, MD3DarkTheme, Switch, Text} from 'react-native-paper';
import {SettingsContext} from '../providers/SettingsContext';
import {gddAlgorithmToText, unitOfMeasureToText} from '../state/State';
import {AppDrawerScreenProps} from '../navigation/Root';
import {View} from 'react-native';

export default function SettingsScreen({
  route,
}: AppDrawerScreenProps<'Settings'>) {
  const {settings, setDarkMode, setAutoDarkMode} = useContext(SettingsContext);
  return (
    // TODO: ScrollView
    <List.Section>
      <List.Item
        onPress={() => {}}
        title="Algorithm"
        description={gddAlgorithmToText(settings.algorithm)}
      />
      <List.Item
        onPress={() => {}}
        title="Unit of measure"
        description={unitOfMeasureToText(settings.unit_of_measure)}
      />
      <List.Item
        onPress={() => {}}
        title="Dark mode"
        description={'Will not turn off automatically'}
        right={() => (
          <Switch
            value={settings.dark_mode_enabled}
            onValueChange={chg => {
              if (setDarkMode !== undefined) {
                setDarkMode(chg);
              }
            }}
          />
        )}
      />
      <List.Item
        onPress={() => {}}
        title="Auto dark mode"
        description={
          'Whether system settings will automatically put app into dark mode'
        }
        right={() => (
          <Switch
            value={settings.auto_dark_mode}
            onValueChange={chg => {
              if (setAutoDarkMode !== undefined) {
                setAutoDarkMode(chg);
              }
            }}
          />
        )}
      />
      <List.Item
        onPress={() => {}}
        title="Default base temp"
        description="Default base temp to use when adding GDD trackers"
        right={() => <Text>{settings.default_base_temp}</Text>}
      />
      <List.Item
        onPress={() => {}}
        title="Warning threshold percentage"
        description="Percentage completion to trigger amber status"
        right={() => <Text>{settings.warning_threshold_perc}</Text>}
      />
      <List.Item
        onPress={() => {}}
        title="API Key"
        description="Enter your weatherapi.com API"
      />
    </List.Section>
  );
}
