import React from 'react';
import {
  Appbar,
  Divider,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';
import {ScrollView, View} from 'react-native';
import {DatePickerInput} from 'react-native-paper-dates';
import {BASE_TEMPS_C} from '../Knowledge';
import {newGddTracker} from '../Types';
import {AppScreenNavigationProp, AppScreenProps} from '../navigation/Root';
import {MAX_HISTORY_DAYS} from '../Consts';
import {onDisplayNotification} from '../Notification';
import {GddTracker} from '../Types';

function AddNewScreen({navigation}: AppScreenProps<'Add'>) {
  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [target, setTarget] = React.useState('');
  const [toggle, setToggle] = React.useState('0');
  const [startDate, setStartDate] = React.useState(new Date());

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        SaveButton(
          !validateInput(),
          navigation,
          newGddTracker(
            name,
            desc,
            location,
            Number(target),
            Number(toggle),
            startDate,
          ),
        ),
    });
  }, [name, location, startDate, target, desc, toggle]);

  function dateInRange(): boolean {
    return false;
  }
  function validateInput(): boolean {
    if (name.length === 0) {
      return false;
    }
    if (location.length === 0) {
      return false;
    }
    if (startDate === new Date()) {
      return false;
    }
    if (isNaN(Number(target)) || target.length === 0) {
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
          value={startDate}
          onChange={d => setStartDate(d as Date)}
          inputMode="start"
        />
        <HelperText type="error" visible={!dateInRange()}>
          Date too far in the past - minimum range {MAX_HISTORY_DAYS}
        </HelperText>
        <TextInput
          label="Location"
          value={location}
          onChangeText={location => setLocation(location)}
          left={<TextInput.Icon icon="map-marker" />}
        />
        <Divider />
        <TextInput
          label="Target"
          value={target}
          onChangeText={target => setTarget(target)}
          left={<TextInput.Icon icon="target" />}
        />
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
    </ScrollView>
  );
}

function SaveButton(
  disabled: boolean,
  navigation: AppScreenNavigationProp<'Add'>,
  new_props: GddTracker,
) {
  return (
    <Appbar.Action
      onPress={() => {
        console.log('Save button on Add screen pressed');
        onDisplayNotification();
        navigation.navigate('Drawer', {
          screen: 'Home',
          params: {
            add_gdd: new_props,
          },
        });
      }}
      disabled={disabled}
      icon="content-save"
    />
  );
}

export default AddNewScreen;
