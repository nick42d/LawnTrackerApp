import {VisibilityEnum} from '@maplibre/maplibre-react-native/javascript/utils/MaplibreStyles';
import {useState} from 'react';
import {Button, Dialog, Text} from 'react-native-paper';

export default function ConfirmationDialog(props: {
  title: string;
  message: string;
  visible: boolean;
  setVisible: (val: boolean) => void;
  onOk: () => void;
}): React.JSX.Element {
  // TODO: Consider adding state
  return (
    <Dialog visible={props.visible} onDismiss={() => props.setVisible(false)}>
      <Dialog.Title>{props.title}</Dialog.Title>
      <Dialog.Content>
        <Text>{props.message}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={_ => props.setVisible(false)}>Cancel</Button>
        <Button onPress={_ => props.onOk()}>Ok</Button>
      </Dialog.Actions>
    </Dialog>
  );
}
