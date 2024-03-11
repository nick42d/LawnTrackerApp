import React, {useContext, useEffect, useState} from 'react';
import {
  Button,
  Dialog,
  Divider,
  List,
  MD3DarkTheme,
  Portal,
  RadioButton,
  Switch,
  Text,
} from 'react-native-paper';
import {SettingsContext} from '../providers/SettingsContext';
import {gddAlgorithmToText, unitOfMeasureToText} from '../state/State';
import {AppDrawerScreenProps} from '../navigation/Root';
import {ScrollView, View} from 'react-native';
import DialogContent from 'react-native-paper/lib/typescript/components/Dialog/DialogContent';
import {setGestureState} from 'react-native-reanimated';

export default function SettingsScreen({
  route,
}: AppDrawerScreenProps<'Settings'>) {
  const {settings, setDarkMode, setAutoDarkMode} = useContext(SettingsContext);
  const [tempDialogVisible, setTempDialogVisible] = useState(false);

  return (
    <ScrollView>
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
          onPress={() => {
            setTempDialogVisible(true);
          }}
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
      <Portal>
        <BaseTempDialog
          visible={tempDialogVisible}
          setVisible={x => {
            setTempDialogVisible(x);
          }}
        />
      </Portal>
    </ScrollView>
  );
}

function BaseTempDialog(props: {
  visible: boolean;
  setVisible: (set: boolean) => void;
}): React.JSX.Element {
  return (
    <Dialog visible={props.visible} onDismiss={() => props.setVisible(false)}>
      <Dialog.Title>Select Base Temp</Dialog.Title>
      <Dialog.Content>
        <RadioButton.Group
          value="second"
          onValueChange={val =>
            console.log(`Radio button pressed, ${JSON.stringify(val)}`)
          }>
          <RadioButton.Item label="111" value="first" status="checked" />
          <RadioButton.Item label="111" value="second" status="checked" />
        </RadioButton.Group>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => props.setVisible(false)}>Done</Button>
      </Dialog.Actions>
    </Dialog>
  );
}
