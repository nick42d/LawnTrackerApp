import {
  HelperText,
  List,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';
import {
  AddTrackerListCalendarItemProps,
  AddTrackerListLocationsItemProps,
  AddTrackerListProps,
  AddTrackerListSelectionItemProps,
  AddTrackerListTextInputItemProps,
} from './Types';
import {TouchableHighlight, View} from 'react-native';
import * as v from 'valibot';
import {DatePickerInput} from 'react-native-paper-dates';
import {DATE_PICKER_LOCALE} from '../../Consts';
import {prettyPrintLocation} from '../../providers/statecontext/Locations';

export default function AddTrackerListItem(props: {item: AddTrackerListProps}) {
  switch (props.item.kind) {
    case 'locations': {
      return <AddTrackerListLocationsItem item={props.item} />;
    }
    case 'textInput': {
      return <AddTrackerListTextInputItem item={props.item} />;
    }
    case 'calendar': {
      return <AddTrackerListCalendarItem item={props.item} />;
    }
    case 'selection': {
      return <AddTrackerListSelectionItem item={props.item} />;
    }
  }
}

function AddTrackerListTextInputItem(props: {
  item: AddTrackerListTextInputItemProps;
}) {
  // TODO: disabled option
  const parser = props.item.validation
    ? v.safeParse(props.item.validation, props.item.value)
    : undefined;
  const parserError = parser && !parser.success ? parser.issues : undefined;
  return (
    <View>
      <TextInput
        label={props.item.label}
        value={props.item.value}
        inputMode={props.item.inputMode}
        error={parserError !== undefined}
        disabled={props.item.disabled}
        onChangeText={v => props.item.onChange(v)}
        left={
          props.item.icon ? (
            <TextInput.Icon icon={props.item.icon} />
          ) : undefined
        }
      />
      {props.item.validation ? (
        <HelperText visible={parserError !== undefined} type={'error'}>
          {parserError !== undefined ? parserError[0].message : ''}
        </HelperText>
      ) : undefined}
    </View>
  );
}
function AddTrackerListSelectionItem(props: {
  item: AddTrackerListSelectionItemProps;
}) {
  // TODO: disabled option
  return (
    <View style={{flexDirection: 'row'}}>
      <View style={{flex: 1.5}}>
        <List.Item title={props.item.label} />
      </View>
      <View style={{flex: 1, justifyContent: 'center', paddingRight: 10}}>
        <SegmentedButtons
          value={props.item.value.toString()}
          onValueChange={props.item.onChange}
          buttons={props.item.values.map(el => ({
            value: el.toString(),
            label: el.toString(),
          }))}
        />
      </View>
    </View>
  );
}
function AddTrackerListCalendarItem(props: {
  item: AddTrackerListCalendarItemProps;
}) {
  const parse = props.item.validation
    ? v.safeParse(props.item.validation, props.item.value)
    : undefined;
  const errors =
    parse !== undefined && parse.success === false
      ? parse.issues.map(i => i.message).join(', ')
      : undefined;
  return (
    <View>
      <DatePickerInput
        label={props.item.label}
        value={props.item.value}
        inputMode="start"
        disabled={props.item.disabled}
        hasError={errors !== undefined}
        onChange={v => {
          const replaced = v === undefined ? new Date() : v;
          props.item.onChange(replaced);
        }}
        locale={DATE_PICKER_LOCALE}
      />
      {props.item.validation ? (
        <HelperText visible={errors !== undefined} type={'error'}>
          {errors}
        </HelperText>
      ) : undefined}
    </View>
  );
}
function AddTrackerListLocationsItem(props: {
  item: AddTrackerListLocationsItemProps;
}) {
  const selectedLocation = props.item.locations.find(
    l => l.apiId === props.item.selectedLocationId,
  );
  const selectedLocationPrettyName = selectedLocation
    ? prettyPrintLocation(selectedLocation)
    : '';
  return (
    <TouchableHighlight onPress={() => props.item.setShowLocationsDialog(true)}>
      <TextInput
        label="Select Location"
        value={selectedLocationPrettyName}
        disabled={props.item.disabled}
        error={!selectedLocation}
        right={
          props.item.icon ? (
            <TextInput.Icon
              icon={props.item.icon}
              // If this isn't done, clicking the icon will do nothing.
              // Potential a standard <Icon> would work better.
              onPress={() => props.item.setShowLocationsDialog(true)}
            />
          ) : undefined
        }
        editable={false}
      />
    </TouchableHighlight>
  );
}
