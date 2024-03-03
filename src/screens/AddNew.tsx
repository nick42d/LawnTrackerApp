import React from 'react';
import {
  Button,
  Divider,
  MaterialBottomTabScreenProps,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';
import {ScrollView, View} from 'react-native';
import {DatePickerInput} from 'react-native-paper-dates';
import {BASE_TEMPS_C} from '../Knowledge';
import {newGddTracker} from '../Types';
import {AppScreenProps} from './Navigation';

function AddNewScreen({navigation}: AppScreenProps<'Add'>) {
  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [target, setTarget] = React.useState('');
  const [toggle, setToggle] = React.useState('0');
  const [startDate, setStartDate] = React.useState(new Date());
  const [addButtonDisabled, setAddButtonDisabled] = React.useState(true);

  React.useEffect(() => {
    setAddButtonDisabled(!validateInput());
  }, [name, location, startDate, target, desc, toggle]);

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
        <TextInput
          label="Location"
          value={location}
          onChangeText={location => setLocation(location)}
          // TODO: Better icon
          left={<TextInput.Icon icon="map-marker" />}
        />
        <Divider />
        <TextInput
          label="Target"
          value={target}
          onChangeText={target => setTarget(target)}
          // TODO: Better icon
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
        <Button
          disabled={addButtonDisabled}
          icon="plus-box"
          mode="contained"
          // Button only shows if inputs are valid, so we know the Gdd object is safe to create.
          onPress={() => {
            navigation.navigate('HomeWeather', {
              screen: 'Home',
              params: {
                add_gdd: newGddTracker(
                  name,
                  desc,
                  location,
                  Number(target),
                  Number(toggle),
                  startDate,
                ),
              },
            });
          }}>
          Add
        </Button>
      </View>
    </ScrollView>
  );
}

export default AddNewScreen;
