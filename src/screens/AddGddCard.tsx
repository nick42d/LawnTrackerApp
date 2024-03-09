import React, {useContext, useState} from 'react';
import {
  Appbar,
  Divider,
  HelperText,
  MD3DarkTheme,
  MD3LightTheme,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {ScrollView, View} from 'react-native';
import {DatePickerInput} from 'react-native-paper-dates';
import {BASE_TEMPS_C} from '../Knowledge';
import {newGddTracker} from '../Types';
import {AppScreenNavigationProp, AppScreenProps} from '../navigation/Root';
import {MAX_HISTORY_DAYS} from '../Consts';
import {onDisplayNotification} from '../Notification';
import {GddTracker} from '../Types';
import {LocationsContext} from '../providers/LocationsContext';
import {PaperSelect} from 'react-native-paper-select';
import SaveButton from '../components/SaveButton';

export default function AddGddCardScreen({
  navigation,
}: AppScreenProps<'AddGddCard'>) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [target, setTarget] = useState('');
  const [toggle, setToggle] = useState('0');
  const [startDate, setStartDate] = useState(new Date());
  const {locations} = useContext(LocationsContext);
  const [pickableLocations, setPickableLocations] = useState({
    value: locations[0].name,
    list: locations.map((loc, idx) => ({_id: idx.toString(), value: loc.name})),
    selectedList: [{_id: '0', value: locations[0].name}],
    error: '',
  });

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        SaveButton(!validateInput(), () => {
          navigation.navigate('Drawer', {
            screen: 'HomeLocationsTabs',
            params: {
              screen: 'Home',
              params: {
                // Assume all fields are valid, as you can't click the button otherwise.
                add_gdd: newGddTracker(
                  name,
                  desc,
                  pickableLocations.value,
                  Number(target),
                  Number(toggle),
                  startDate,
                ),
              },
            },
          });
        }),
    });
  }, [name, pickableLocations.value, startDate, target, desc, toggle]);

  function dateInRange(): boolean {
    return false;
  }
  function locationSelected(): boolean {
    return pickableLocations.value.length !== 0;
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
    if (startDate === new Date()) {
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
          locale="en-GB"
          label="Start date"
          value={startDate}
          onChange={d => setStartDate(d as Date)}
          inputMode="start"
        />
        <HelperText type="error" visible={!dateInRange()}>
          Date too far in the past - minimum range {MAX_HISTORY_DAYS}
        </HelperText>
        <PaperSelect
          label="Select location"
          value={pickableLocations.value}
          onSelection={value => {
            setPickableLocations({
              ...pickableLocations,
              value: value.text,
              selectedList: value.selectedList,
              error: '',
            });
          }}
          arrayList={[...pickableLocations.list]}
          selectedArrayList={pickableLocations.selectedList}
          multiEnable={false}
        />
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
        <HelperText type="error" visible={!nameEntered()}>
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
    </ScrollView>
  );
}
