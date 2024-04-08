import React, {useContext, useEffect, useState} from 'react';
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
import {ScrollView, TouchableHighlight, View} from 'react-native';
import {DatePickerInput} from 'react-native-paper-dates';
import {BASE_TEMPS_C} from '../Knowledge';
import {
  newCalendarTracker,
  newGddTracker,
  newTimedTracker,
} from '../providers/statecontext/Trackers';
import {AppScreenProps} from '../navigation/Root';
import {MAX_HISTORY_DAYS} from '../Consts';
import SaveButton from '../components/SaveButton';
import {StateContext} from '../providers/StateContext';
import {DATE_PICKER_LOCALE} from '../Consts';

export default function AddTimedTrackerScreen({
  navigation,
}: AppScreenProps<'AddTimedTracker'>) {
  const {addTracker} = useContext(StateContext);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [durationDays, setDurationDays] = useState('7');

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <SaveButton
          disabled={!validateInput()}
          onPress={() => {
            // Assume all fields are valid, as you can't click the button otherwise.
            addTracker(
              newTimedTracker(
                name,
                desc,
                startDate,
                // Safe as input is checked
                Number(durationDays),
              ),
            );
            navigation.goBack();
          }}
        />
      ),
    });
  }, [name, startDate, desc, durationDays]);

  // Date can't be in the past
  // Consider - maybe this is OK
  function dateInRange(): boolean {
    const firstAcceptableDate = new Date();
    return startDate >= firstAcceptableDate;
  }
  function nameEntered(): boolean {
    return name.length !== 0;
  }
  function durationEntered(): boolean {
    return !(isNaN(Number(durationDays)) || durationDays.length === 0);
  }
  function validateInput(): boolean {
    if (!nameEntered()) {
      return false;
    }
    if (!dateInRange()) {
      return false;
    }
    if (!durationEntered()) {
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
          locale={DATE_PICKER_LOCALE}
          label="Start date"
          value={startDate}
          onChange={d => setStartDate(d as Date)}
          inputMode="start"
        />
        <HelperText type="error" visible={!dateInRange()}>
          Start Date must be in the future
        </HelperText>
        <Divider />
        <TextInput
          label="Duration (days)"
          value={durationDays}
          onChangeText={d => setDurationDays(d)}
          left={<TextInput.Icon icon="target" />}
        />
        <HelperText type="error" visible={!durationEntered()}>
          Number must be entered as a Target
        </HelperText>
      </View>
    </ScrollView>
  );
}
