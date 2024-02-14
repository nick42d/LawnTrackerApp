import React from 'react';
import {Divider, SegmentedButtons, Text, TextInput} from 'react-native-paper';
import {ScrollView, View} from 'react-native';
import {DatePickerInput} from 'react-native-paper-dates';

function AddNewScreen() {
  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [target, setTarget] = React.useState('');
  const [toggle, setToggle] = React.useState('0');
  const [startDate, setStartDate] = React.useState(new Date());

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
          value={desc}
          onChangeText={location => setLocation(location)}
          // TODO: Better icon
          left={<TextInput.Icon icon="map-marker" />}
        />
        <Divider />
        <TextInput
          label="Target"
          value={desc}
          onChangeText={target => setTarget(target)}
          // TODO: Better icon
          left={<TextInput.Icon icon="target" />}
        />
        <Text>Base Temp</Text>
        <SegmentedButtons
          value={toggle}
          onValueChange={setToggle}
          buttons={[
            {value: '0', label: '0°'},
            {value: '10', label: '10°'},
          ]}
        />
      </View>
    </ScrollView>
  );
}

export default AddNewScreen;
