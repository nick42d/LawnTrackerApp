import React from 'react';
import {Divider, Text, TextInput} from 'react-native-paper';
import {ScrollView, View} from 'react-native';
import {DatePickerInput} from 'react-native-paper-dates';

function AddNewScreen() {
  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [startDate, setStartDate] = React.useState(undefined);

  return (
    <ScrollView>
      <View>
        <Text>Add new tracked GDD</Text>
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
          left={<TextInput.Icon icon="bell-plus" />}
        />
        <Divider />
        <DatePickerInput
          locale="en-GB"
          label="Start date"
          value={startDate}
          onChange={d => setStartDate(d)}
          inputMode="start"
        />
        <Divider />
        <Text>Target GDD</Text>
        <Text>Base temp</Text>
      </View>
    </ScrollView>
  );
}

export default AddNewScreen;
