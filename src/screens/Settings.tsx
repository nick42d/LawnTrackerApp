import React, {useContext, useEffect, useState} from 'react';
import {SettingsContext} from '../providers/SettingsContext';
import {
  GddBaseTemp,
  GddAlgorithm,
  UNITS_OF_MEASURE,
  UnitOfMeasure,
  GDD_ALGORITHMS,
  gddBaseTempToString,
  GDD_BASE_TEMPS,
} from '../providers/settingscontext/Types';
import {StateContext} from '../providers/StateContext';
import {
  SettingsListProps,
  toSomeSettingsListListProps,
} from '../components/settingslist/Types';
import SettingsList from '../components/SettingsList';
import {defaultSettings} from '../providers/settingscontext/Types';

export default function SettingsScreen() {
  const {settings, setSettings} = useContext(SettingsContext);
  const {clearAll} = useContext(StateContext);
  function resetSettings() {
    setSettings(defaultSettings());
  }
  function setDarkMode(value: boolean) {
    setSettings({...settings, dark_mode_enabled: value});
  }
  function setAutoDarkMode(value: boolean) {
    setSettings({...settings, auto_dark_mode: value});
  }
  function setAlgorithm(value: GddAlgorithm) {
    setSettings({...settings, algorithm: value});
  }
  function setWarningThresholdPercentage(value: number) {
    setSettings({...settings, warning_threshold_perc: value});
  }
  function setWarningThresholdDays(value: number) {
    setSettings({...settings, warning_threshold_days: value});
  }
  function setEarliestNotificationTime(value: number) {
    setSettings({...settings, earliestNotificationTimeHrs: value});
  }
  function setBackgroundTaskInterval(value: number) {
    setSettings({...settings, backgroundTaskIntervalHrs: value});
  }
  function setDefaultBaseTemp(value: GddBaseTemp) {
    setSettings({...settings, default_base_temp: value});
  }
  function setUnitOfMeasure(value: UnitOfMeasure) {
    setSettings({...settings, unit_of_measure: value});
  }
  const SettingsListState: SettingsListProps[] = [
    {
      key: '0',
      title: 'Warning threshold percentage',
      description: 'Percentage completion to trigger amber status',
      kind: 'slider',
      value: settings.warning_threshold_perc,
      onChange: v => setWarningThresholdPercentage(v),
      minValue: 0,
      maxValue: 1,
      step: 0.05,
      stringConverter: v => `${(v * 100).toFixed(0)}%`,
    },
    {
      key: '0.5',
      title: 'Calendar warning threshold (days)',
      description:
        'Calender trackers only - minimum days remaining to trigger amber status',
      kind: 'slider',
      value: settings.warning_threshold_days,
      onChange: v => setWarningThresholdDays(v),
      minValue: 0,
      maxValue: 30,
      step: 1,
      stringConverter: v => `${v.toFixed(0)}`,
    },
    {
      key: '1',
      kind: 'list',
      title: 'Unit of measure - weather',
      description:
        'Unit of measure for Locations page. Note, will not affect Growing Degree Days (Metric only).',
      listProps: toSomeSettingsListListProps({
        value: settings.unit_of_measure,
        onChange: v => setUnitOfMeasure(v),
        list: UNITS_OF_MEASURE,
        stringConverter: v => v,
      }),
    },
    {
      key: '2',
      kind: 'toggle',
      title: 'Dark mode',
      description: 'Will not turn off automatically',
      value: settings.dark_mode_enabled,
      onChange: v => setDarkMode(v),
    },
    {
      key: '3',
      kind: 'toggle',
      title: 'Auto dark mode',
      description:
        'Whether system settings will automatically put app into dark mode',
      value: settings.auto_dark_mode,
      onChange: v => setAutoDarkMode(v),
    },
    {
      key: '4.6',
      kind: 'subheader',
      subheaderTitle: 'Notification Settings',
    },
    {
      key: '4.7',
      kind: 'slider',
      title: 'Background task interval (hrs)',
      description:
        'How often to run the background task that checks if trackers are due. Lower times will mean notifications arrive closer to earliest notification time',
      value: settings.backgroundTaskIntervalHrs,
      onChange: v => setBackgroundTaskInterval(v),
      minValue: 0.5,
      maxValue: 24,
      step: 0.5,
      stringConverter: v => `${v.toFixed(1)}`,
    },
    {
      key: '4.8',
      kind: 'slider',
      title: 'Earliest notification time (24h)',
      description:
        "Earliest time you'll receive a notification. Setting this to too late in the day increases risk you'll not receive a notification",
      value: settings.earliestNotificationTimeHrs,
      onChange: v => setEarliestNotificationTime(v),
      minValue: 0,
      maxValue: 23,
      step: 1,
      stringConverter: v => `${v.toFixed(0)}:00`,
    },
    {
      key: '5',
      kind: 'subheader',
      subheaderTitle: 'Growing Degree Days Settings',
    },
    {
      key: '6',
      kind: 'list',
      title: 'GDD algorithm',
      description:
        'Unit of measure used to calculate GDD. See help page for more details.',
      listProps: toSomeSettingsListListProps({
        value: settings.algorithm,
        list: GDD_ALGORITHMS,
        onChange: v => setAlgorithm(v),
        stringConverter: v => v,
      }),
    },
    {
      key: '7',
      kind: 'list',
      title: 'Default base temp',
      description: 'Default base temp to use when adding GDD trackers',
      listProps: toSomeSettingsListListProps({
        value: settings.default_base_temp,
        list: GDD_BASE_TEMPS,
        onChange: v => setDefaultBaseTemp(v),
        stringConverter: gddBaseTempToString,
      }),
    },
    {
      key: '7.5',
      kind: 'subheader',
      subheaderTitle: 'Reset App Settings',
    },
    {
      key: '8',
      kind: 'press',
      title: 'Clear all',
      description: 'Clear all trackers and locations.',
      warningDialog: {
        title: 'Confirm clear all',
        message:
          'Are you sure you want to clear all? All trackers and locations will be cleared.',
      },
      onPress: clearAll,
    },
    {
      key: '9',
      kind: 'press',
      title: 'Reset settings',
      description: 'Reset to default settings',
      warningDialog: {
        title: 'Confirm reset',
        message: 'Are you sure you want to reset?',
      },
      onPress: resetSettings,
    },
  ];
  return <SettingsList list={SettingsListState} />;
}
