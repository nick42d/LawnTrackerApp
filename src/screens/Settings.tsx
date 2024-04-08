import React, {useContext, useEffect, useState} from 'react';
import {List, Portal, Switch, Text} from 'react-native-paper';
import {SettingsContext} from '../providers/SettingsContext';
import {
  BaseTemp,
  GDDAlgorithm,
  UNITS_OF_MEASURE,
  UnitOfMeasure,
  gddAlgorithmToText,
  isUnitOfMeasure,
} from '../providers/settingscontext/Types';
import {ScrollView, View} from 'react-native';
import GenericSelectionDialog, {
  SliderSelectionDialog,
} from '../components/SelectionDialog';

const ALGORITHMS = [GDDAlgorithm.VariantA, GDDAlgorithm.VariantB];
const BASE_TEMPS = [BaseTemp.Zero, BaseTemp.Ten];

export default function SettingsScreen() {
  const {settings, setSettings} = useContext(SettingsContext);
  const [baseTempDialogVisible, setBaseTempDialogVisible] = useState(false);
  const [unitOfMeasureDialogVisible, setUnitOfMeasureDialogVisible] =
    useState(false);
  const [algorithmDialogVisible, setAlgorithmDialogVisible] = useState(false);
  const [thresholdDialogVisible, setThresholdDialogVisible] = useState(false);

  function ShowAlgorithmDialog() {
    setAlgorithmDialogVisible(true);
  }
  function ShowThresholdDialog() {
    setThresholdDialogVisible(true);
  }
  function ShowBaseTempDialog() {
    setBaseTempDialogVisible(true);
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
  function setWarningThreshold(value: number) {
    if (setSettings !== undefined)
      setSettings({...settings, warning_threshold_perc: value});
  }
  function setDefaultBaseTemp(value: BaseTemp) {
    if (setSettings !== undefined)
      setSettings({...settings, default_base_temp: value});
  }
  function setUnitOfMeasure(value: UnitOfMeasure) {
    if (setSettings !== undefined)
      setSettings({...settings, unit_of_measure: value});
  }
  return (
    <ScrollView>
      <List.Section>
        <List.Item
          onPress={ShowThresholdDialog}
          title="Warning threshold percentage"
          description="Percentage completion to trigger amber status"
          right={() => (
            <Text>{(settings.warning_threshold_perc * 100).toFixed(0)}%</Text>
          )}
        />
        <List.Item
          onPress={ShowUnitOfMeasureDialog}
          title="Unit of measure - weather"
          description="Unit of measure for Locations page. Note, will not affect Growing Degree Days (Metric only)."
          right={() => <Text>{settings.unit_of_measure}</Text>}
        />
        <List.Item
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
        <List.Subheader>Growing Degree Days Settings</List.Subheader>
        <List.Item
          onPress={ShowAlgorithmDialog}
          title="GDD Algorithm"
          description="Unit of measure used to calculate GDD. See help page for more details."
          right={() => <Text>{gddAlgorithmToText(settings.algorithm)}</Text>}
        />
        <List.Item
          onPress={ShowBaseTempDialog}
          title="Default base temp"
          description="Default base temp to use when adding GDD trackers"
          right={() => <Text>{settings.default_base_temp}</Text>}
        />
      </List.Section>
      <Portal>
        <GenericSelectionDialog<BaseTemp>
          title="Select Base Temp"
          visible={baseTempDialogVisible}
          setVisible={x => {
            setBaseTempDialogVisible(x);
          }}
          curValue={settings.default_base_temp}
          setCurValue={(set: string) => {
            setDefaultBaseTemp(Number(set));
          }}
          values={BASE_TEMPS.map(x => ({label: BaseTemp[x], value: x}))}
        />
        <GenericSelectionDialog<GDDAlgorithm>
          title="Select Algorithm"
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
          title="Select Unit of Measure"
          visible={unitOfMeasureDialogVisible}
          setVisible={x => {
            setUnitOfMeasureDialogVisible(x);
          }}
          curValue={settings.unit_of_measure}
          setCurValue={(set: string) => {
            // Handle invariant from dialog
            if (isUnitOfMeasure(set)) {
              setUnitOfMeasure(set);
            } else {
              // Should be unreachable.
              throw new Error(
                'Unhandled invariant - tried to set unit of measure to a generic string',
              );
            }
          }}
          values={UNITS_OF_MEASURE.map(x => ({
            label: x,
            value: x,
          }))}
        />
        <SliderSelectionDialog
          title="Select Warning Threshold Perc"
          setCurValue={setWarningThreshold}
          setVisible={setThresholdDialogVisible}
          visible={thresholdDialogVisible}
          curValue={settings.warning_threshold_perc}
        />
      </Portal>
    </ScrollView>
  );
}
