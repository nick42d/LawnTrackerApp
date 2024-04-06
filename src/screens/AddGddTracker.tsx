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
import {newGddTracker} from '../providers/statecontext/Trackers';
import {AppScreenProps} from '../navigation/Root';
import {DATE_PICKER_LOCALE, MAX_HISTORY_DAYS} from '../Consts';
import SaveButton from '../components/SaveButton';
import {StateContext} from '../providers/StateContext';

export default function AddGddTrackerScreen({
  navigation,
}: AppScreenProps<'AddGddTracker'>) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [target, setTarget] = useState('');
  const [toggle, setToggle] = useState('0');
  const [startDate, setStartDate] = useState(new Date());
  const {locations, addTracker: addGddTracker} = useContext(StateContext);
  // TODO: Handle no locations
  const [location, setLocation] = useState(locations[0].name);
  const [tempDialogShown, setTempDialogShown] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        SaveButton(!validateInput(), () => {
          // Assume all fields are valid, as you can't click the button otherwise.
          addGddTracker(
            newGddTracker(
              name,
              desc,
              location,
              Number(target),
              Number(toggle),
              startDate,
            ),
          );
          navigation.goBack();
        }),
    });
  }, [name, location, startDate, target, desc, toggle]);

  function dateInRange(): boolean {
    const firstAcceptableDate = new Date();
    // TODO set to midnight
    firstAcceptableDate.setDate(startDate.getDate() - MAX_HISTORY_DAYS);
    return startDate >= firstAcceptableDate;
  }
  function locationSelected(): boolean {
    return location.length !== 0;
  }
  function nameEntered(): boolean {
    return name.length !== 0;
  }
  function targetEntered(): boolean {
    return !(isNaN(Number(target)) || target.length === 0);
  }

  function validateInput(): boolean {
    if (!nameEntered()) {
      return false;
    }
    if (!locationSelected()) {
      return false;
    }
    // TODO: Put this as part of dateInRange if its required
    if (startDate === new Date()) {
      return false;
    }
    if (!dateInRange) {
      return false;
    }
    if (!targetEntered()) {
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
          Date too far in the past - minimum range {MAX_HISTORY_DAYS}
        </HelperText>
        <TouchableHighlight onPress={_ => setTempDialogShown(true)}>
          <TextInput
            label="Select Location"
            value={location}
            right={
              <TextInput.Icon
                icon="map-marker"
                // If this isn't done, clicking the icon will do nothing.
                // Potential a standard <Icon> would work better.
                onPress={_ => setTempDialogShown(true)}
              />
            }
            editable={false}
          />
        </TouchableHighlight>
        <HelperText type="error" visible={!locationSelected()}>
          Location must be selected
        </HelperText>
        <Divider />
        <TextInput
          label="Target"
          value={target}
          onChangeText={target => setTarget(target)}
          left={<TextInput.Icon icon="target" />}
        />
        <HelperText type="error" visible={!targetEntered()}>
          Number must be entered as a Target
        </HelperText>
        <Text>Base Temp</Text>
        <SegmentedButtons
          value={toggle}
          onValueChange={setToggle}
          buttons={BASE_TEMPS_C.map(el => ({
            value: el.toString(),
            label: el.toString(),
          }))}
        />
      </View>
      <Portal>
        <Dialog
          visible={tempDialogShown}
          onDismiss={() => setTempDialogShown(false)}>
          <Dialog.Title>Select Location</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              // All types in JavaSCript can be converted to a string, so this is safe.
              value={location}
              onValueChange={val => {
                setLocation(val);
                return console.log(
                  `Radio button pressed, ${JSON.stringify(val)}`,
                );
              }}>
              {locations.map((l, i) => {
                return (
                  <RadioButton.Item key={i} label={l.name} value={l.name} />
                );
              })}
            </RadioButton.Group>
            <Button
              icon="plus"
              onPress={_ => {
                setTempDialogShown(false);
                navigation.navigate('AddLocationCard', {
                  onGoBack: locName => {
                    setTempDialogShown(true);
                    // TODO: Safety checks
                    setLocation(locName);
                  },
                });
              }}>
              Add location
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setTempDialogShown(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}
