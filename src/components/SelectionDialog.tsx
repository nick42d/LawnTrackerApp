import {Button, Dialog, RadioButton} from 'react-native-paper';

export default function GenericSelectionDialog<T>(props: {
  visible: boolean;
  setVisible: (set: boolean) => void;
  values: {label: string; value: T}[];
  curValue: T;
  setCurValue: (set: string) => void;
}): React.JSX.Element {
  return (
    <Dialog visible={props.visible} onDismiss={() => props.setVisible(false)}>
      <Dialog.Title>Select Base Temp</Dialog.Title>
      <Dialog.Content>
        <RadioButton.Group
          // All types in JavaSCript can be converted to a string, so this is safe.
          value={String(props.curValue)}
          onValueChange={val => {
            // TODO: fix typing
            props.setCurValue(val);
            return console.log(`Radio button pressed, ${JSON.stringify(val)}`);
          }}>
          {props.values.map(value => {
            return (
              <RadioButton.Item
                label={value.label}
                value={String(value.value)}
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
