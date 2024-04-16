import Slider from '@react-native-community/slider';
import {useEffect} from 'react';
import {View} from 'react-native';
import {Button, Dialog, RadioButton, Text} from 'react-native-paper';

/**
 * Generic selection dialog.
 * NOTE: All values in the list must be able to be uniquely converted into a string.
 * Otherwise this will through due to key duplication.
 * @param props
 * @returns
 */
export function GenericSelectionDialog<T>(props: {
  title: string;
  visible: boolean;
  hideDialog: () => void;
  values: readonly T[];
  curValue: T;
  stringConverter: (value: T) => string;
  onChange: (value: T) => void;
}): React.JSX.Element {
  const stringMappedValues = props.values.map((_, idx) => `${idx}`);
  return (
    <Dialog visible={props.visible} onDismiss={() => props.hideDialog()}>
      <Dialog.Title>{props.title}</Dialog.Title>
      <Dialog.Content>
        <RadioButton.Group
          value={`${props.values.indexOf(props.curValue)}`}
          onValueChange={val => {
            const valIndex = stringMappedValues.indexOf(val);
            props.onChange(props.values[valIndex]);
            return console.log(`Radio button pressed, ${val}`);
          }}>
          {props.values.map((value, idx) => {
            return (
              <RadioButton.Item
                key={props.stringConverter(value)}
                label={props.stringConverter(value)}
                value={`${idx}`}
              />
            );
          })}
        </RadioButton.Group>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => props.hideDialog()}>Done</Button>
      </Dialog.Actions>
    </Dialog>
  );
}
export function SliderSelectionDialog(props: {
  title: string;
  visible: boolean;
  hideDialog: () => void;
  curValue: number;
  onChange: (set: number) => void;
  minValue: number;
  maxValue: number;
  step: number;
  // Convert to string and display on rhs
  stringConverter: (value: number) => string;
}): React.JSX.Element {
  return (
    <Dialog visible={props.visible} onDismiss={() => props.hideDialog()}>
      <Dialog.Title>{props.title}</Dialog.Title>
      <Dialog.Content>
        <Text>{props.stringConverter(props.curValue)}</Text>
        <Slider
          value={props.curValue}
          minimumValue={props.minValue}
          maximumValue={props.maxValue}
          onValueChange={x => props.onChange(x)}
          step={props.step}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => props.hideDialog()}>Done</Button>
      </Dialog.Actions>
    </Dialog>
  );
}
