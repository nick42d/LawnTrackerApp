import React, {useContext, useEffect, useState} from 'react';
import {Divider, HelperText, TextInput} from 'react-native-paper';
import {ScrollView, View} from 'react-native';
import {DatePickerInput} from 'react-native-paper-dates';
import {newCalendarTracker} from '../providers/statecontext/Trackers';
import {AppScreenProps} from '../navigation/Root';
import {DATE_PICKER_LOCALE} from '../Consts';
import SaveButton from '../components/SaveButton';
import {StateContext} from '../providers/StateContext';
import {startOfDay} from 'date-fns';

export default function AddCalendarTrackerScreen({
  navigation,
}: AppScreenProps<'AddCalendarTracker'>) {
  const {addTracker} = useContext(StateContext);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [targetDate, setTargetDate] = useState(new Date());

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <SaveButton
          disabled={!validateInput()}
          onPress={() => {
            // Assume all fields are valid, as you can't click the button otherwise.
            addTracker(newCalendarTracker(name, desc, targetDate));
            navigation.goBack();
          }}
        />
      ),
    });
  }, [name, targetDate, desc]);

  // Date can't be in the past
  // Consider - should be in future
  function dateInRange(): boolean {
    const firstAcceptableDate = startOfDay(new Date());
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
          error={!nameEntered()}
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
          value={targetDate}
          onChange={d => setTargetDate(d as Date)}
          inputMode="start"
          hasError={!dateInRange()}
        />
        <HelperText type="error" visible={!dateInRange()}>
          Date must be in the future
        </HelperText>
      </View>
    </ScrollView>
  );
}
