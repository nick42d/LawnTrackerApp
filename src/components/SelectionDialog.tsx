import Slider from '@react-native-community/slider';
import {View} from 'react-native';
import {Button, Dialog, RadioButton, Text} from 'react-native-paper';

/**
 * Generic selection dialog.
 * NOTE: All values in the list must be able to be uniquely converted into a string.
 * This won't throw, but some values may not be selectable.
 * @param props
 * @returns
 */
export default function GenericSelectionDialog<T>(props: {
  title: string;
  visible: boolean;
  setVisible: (set: boolean) => void;
  values: readonly T[];
  curValue: T;
  stringConverter: (value: T) => string;
  setCurValue: (value: T) => void;
}): React.JSX.Element {
  const stringMappedValues = props.values.map((_, idx) => `${idx}`);
  return (
    <Dialog visible={props.visible} onDismiss={() => props.setVisible(false)}>
      <Dialog.Title>{props.title}</Dialog.Title>
      <Dialog.Content>
        <RadioButton.Group
          value={props.stringConverter(props.curValue)}
          onValueChange={val => {
            const valIndex = stringMappedValues.indexOf(val);
            props.setCurValue(props.values[valIndex]);
            return console.log(`Radio button pressed, ${val}`);
          }}>
          {props.values.map((value, idx) => {
            return (
              <RadioButton.Item
                key={idx}
                label={props.stringConverter(value)}
                value={`${idx}`}
              />
            );
          })}
        </RadioButton.Group>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => props.setVisible(false)}>Done</Button>
      </Dialog.Actions>
    </Dialog>
  );
}
export function SliderSelectionDialog(props: {
  title: string;
  visible: boolean;
  setVisible: (set: boolean) => void;
  curValue: number;
  setCurValue: (set: number) => void;
  minValue: number;
  maxValue: number;
  step: number;
  // Convert to string and display on rhs
  textConverter: (value: number) => string;
}): React.JSX.Element {
  return (
    <Dialog visible={props.visible} onDismiss={() => props.setVisible(false)}>
      <Dialog.Title>{props.title}</Dialog.Title>
      <Dialog.Content>
        <Text>{props.textConverter(props.curValue)}</Text>
        <Slider
          value={props.curValue}
          minimumValue={props.minValue}
          maximumValue={props.maxValue}
          onValueChange={x => props.setCurValue(x)}
          step={props.step}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => props.setVisible(false)}>Done</Button>
      </Dialog.Actions>
    </Dialog>
  );
}
