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
import {
  GDDAlgorithm,
  UnitOfMeasure,
  gddAlgorithmToText,
  unitOfMeasureToText,
} from '../state/State';
import {AppDrawerScreenProps} from '../navigation/Root';
import {ScrollView, View} from 'react-native';
import DialogContent from 'react-native-paper/lib/typescript/components/Dialog/DialogContent';
import {setGestureState} from 'react-native-reanimated';
import GenericSelectionDialog from '../components/SelectionDialog';

const ALGORITHMS = [GDDAlgorithm.VariantA, GDDAlgorithm.VariantB];
const UNITS_OF_MEASURE = [UnitOfMeasure.Imperial, UnitOfMeasure.Metric];

export default function SettingsScreen({
  route,
}: AppDrawerScreenProps<'Settings'>) {
  const {settings, setSettings} = useContext(SettingsContext);
  const [baseTempDialogVisible, setBaseTempDialogVisible] = useState(false);
  const [unitOfMeasureDialogVisible, setUnitOfMeasureDialogVisible] =
    useState(false);
  const [algorithmDialogVisible, setAlgorithmDialogVisible] = useState(false);

  function ShowAlgorithmDialog() {
    setAlgorithmDialogVisible(true);
  }
  function ShowUnitOfMeasureDialog() {
    setUnitOfMeasureDialogVisible(true);
  }
  function setDarkMode(value: boolean) {
    if (setSettings !== undefined)
      setSettings({...settings, dark_mode_enabled: value});
  }
  function setAutoDarkMode(value: boolean) {
    if (setSettings !== undefined)
      setSettings({...settings, auto_dark_mode: value});
  }
  function setAlgorithm(value: GDDAlgorithm) {
    if (setSettings !== undefined) setSettings({...settings, algorithm: value});
  }
  function setUnitOfMeasure(value: UnitOfMeasure) {
    if (setSettings !== undefined)
      setSettings({...settings, unit_of_measure: value});
  }
  return (
    <ScrollView>
      <List.Section>
        <List.Item
          onPress={ShowAlgorithmDialog}
          title="Algorithm"
          description={gddAlgorithmToText(settings.algorithm)}
        />
        <List.Item
          onPress={ShowUnitOfMeasureDialog}
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
            setBaseTempDialogVisible(true);
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
        <GenericSelectionDialog<number>
          visible={baseTempDialogVisible}
          setVisible={x => {
            setBaseTempDialogVisible(x);
          }}
          curValue={1}
          setCurValue={(set: string) => {}}
          values={[
            {label: '123', value: 1},
            {label: '1234', value: 2},
          ]}
        />
        <GenericSelectionDialog<GDDAlgorithm>
          visible={algorithmDialogVisible}
          setVisible={x => {
            setAlgorithmDialogVisible(x);
          }}
          curValue={settings.algorithm}
          setCurValue={(set: string) => {
            setAlgorithm(Number(set));
          }}
          values={ALGORITHMS.map(x => ({label: GDDAlgorithm[x], value: x}))}
        />
        <GenericSelectionDialog<UnitOfMeasure>
          visible={unitOfMeasureDialogVisible}
          setVisible={x => {
            setUnitOfMeasureDialogVisible(x);
          }}
          curValue={settings.unit_of_measure}
          setCurValue={(set: string) => {
            setUnitOfMeasure(Number(set));
          }}
          values={UNITS_OF_MEASURE.map(x => ({
            label: UnitOfMeasure[x],
            value: x,
          }))}
        />
      </Portal>
    </ScrollView>
  );
}
