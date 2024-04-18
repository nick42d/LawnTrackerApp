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
import {newGddTracker} from '../providers/statecontext/Trackers';
import {AppScreenProps} from '../navigation/Root';
import {DATE_PICKER_LOCALE, MAX_HISTORY_DAYS} from '../Consts';
import AppBarIconButton from '../components/AppBarIconButton';
import {StateContext} from '../providers/StateContext';
import {GDD_BASE_TEMPS} from '../providers/settingscontext/Types';
import {SettingsContext} from '../providers/SettingsContext';
import {differenceInCalendarDays} from 'date-fns';

export default function AddGddTrackerScreen({
  route,
  navigation,
}: AppScreenProps<'AddGddTracker'>) {
  const {settings} = useContext(SettingsContext);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [target, setTarget] = useState('');
  const [toggle, setToggle] = useState(settings.default_base_temp.toString());
  const [startDate, setStartDate] = useState(new Date());
  const {locations, addTracker: addGddTracker} = useContext(StateContext);
  const [locationId, setLocationId] = useState(locations.at(0)?.apiId);
  const [tempDialogShown, setTempDialogShown] = useState(false);

  // If we navigated here from Add Locations Screen, make sure the dialog is shown
  // and set the added location as selected.
  useEffect(() => {
    if (route.params) {
      setTempDialogShown(true);
      // TODO: Safety checks
      setLocationId(route.params.fromAddLocationId);
    }
  }, [route.params?.fromAddLocationId]);
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AppBarIconButton
          disabled={!validateInput()}
          icon="content-save"
          onPress={() => {
            // Assume all fields are valid, as you can't click the button otherwise.
            addGddTracker(
              newGddTracker(
                name,
                desc,
                // Asserting non-null
                locationId!,
                Number(target),
                Number(toggle),
                startDate,
              ),
            );
            navigation.goBack();
          }}
        />
      ),
    });
  }, [name, locationId, startDate, target, desc, toggle]);

  function selectedLocationPrettyName(): string {
    return locationId ? locationPrettyName(locationId) : '';
  }
  function locationPrettyName(apiId: number): string {
    const foundLoc = locations.find(l => l.apiId === apiId);
    return foundLoc ? `${foundLoc.name}, ${foundLoc.country}` : '';
  }
  function dateInRange(): boolean {
    const delta = differenceInCalendarDays(new Date(), startDate);
    console.log(delta);
    return delta <= MAX_HISTORY_DAYS;
  }
  function locationSelected(): boolean {
    if (locationId === undefined) return false;
    return true;
  }
  function nameEntered(): boolean {
    return name.length !== 0;
  }
  function targetEntered(): boolean {
    return !isNaN(Number(target)) && Number(target) > 0;
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
          error={!nameEntered()}
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
          hasError={!dateInRange()}
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
            value={selectedLocationPrettyName()}
            error={!locationSelected()}
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
          inputMode="numeric"
          error={!targetEntered()}
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
          buttons={GDD_BASE_TEMPS.map(el => ({
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
            {locationId !== undefined ? (
              <RadioButton.Group
                // All types in JavaSCript can be converted to a string, so this is safe.
                value={locationId.toString()}
                onValueChange={val => {
                  // Hoping that this string -> number -> string conversion is safe.
                  setLocationId(Number(val));
                  return console.log(
                    `Radio button pressed, ${JSON.stringify(val)}`,
                  );
                }}>
                {locations.map(l => {
                  return (
                    <RadioButton.Item
                      key={l.apiId}
                      label={l.name + ', ' + l.country}
                      value={l.apiId.toString()}
                    />
                  );
                })}
              </RadioButton.Group>
            ) : undefined}
            <Button
              icon="plus"
              onPress={_ => {
                setTempDialogShown(false);
                navigation.navigate('AddLocationCard', {
                  fromAddGddTracker: true,
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
