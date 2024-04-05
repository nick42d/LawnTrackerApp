import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  Divider,
  HelperText,
  Portal,
  RadioButton,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';
import { ScrollView, TouchableHighlight, View } from 'react-native';
import { DatePickerInput } from 'react-native-paper-dates';
import { BASE_TEMPS_C } from '../Knowledge';
import { newCalendarTracker, newGddTracker } from '../Types';
import { AppScreenProps } from '../navigation/Root';
import { MAX_HISTORY_DAYS } from '../Consts';
import SaveButton from '../components/SaveButton';
import { StateContext } from '../providers/StateContext';

export default function AddCalendarTrackerScreen({
  navigation,
}: AppScreenProps<'AddCalendarTracker'>) {
  const { addTracker } = useContext(StateContext);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [targetDate, setTargetDate] = useState(new Date());

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        SaveButton(!validateInput(), () => {
          // Assume all fields are valid, as you can't click the button otherwise.
          addTracker(
            newCalendarTracker(
              name,
              desc,
              targetDate,
            ),
          );
          navigation.goBack();
        }),
    });
  }, [name, targetDate, desc]);

  // Date can't be in the past
  // Consider - should be in future
  function dateInRange(): boolean {
    const firstAcceptableDate = new Date();
    return targetDate >= firstAcceptableDate;
  }
  function nameEntered(): boolean {
    return name.length !== 0;
  }
  function validateInput(): boolean {
    if (!nameEntered()) {
      return false;
    }
    if (!dateInRange()) {
      return false;
    }
    return true;
  }

  return (
    <ScrollView>
      <View>
        <Divider />
        <TextInput
          label="Name"
          value={name}
          onChangeText={name => setName(name)}
        />
        <HelperText type="error" visible={!nameEntered()}>
          Name must be entered
        </HelperText>
        <TextInput
          label="Description"
          value={desc}
          onChangeText={desc => setDesc(desc)}
          // TODO: Better icon
          left={<TextInput.Icon icon="menu" />}
        />
        <Divider />
        <DatePickerInput
          locale="en-GB"
          label="Start date"
          value={targetDate}
          onChange={d => setTargetDate(d as Date)}
          inputMode="start"
        />
        <HelperText type="error" visible={!dateInRange()}>
          Date must be in the future
        </HelperText>
      </View>
    </ScrollView>
  );
}
