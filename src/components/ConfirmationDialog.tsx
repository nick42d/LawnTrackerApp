import {VisibilityEnum} from '@maplibre/maplibre-react-native/javascript/utils/MaplibreStyles';
import {useState} from 'react';
import {Button, Dialog, Text} from 'react-native-paper';

export default function ConfirmationDialog(props: {
  title: string;
  message: string;
  visible: boolean;
  hideDialog: () => void;
  onOk: () => void;
}): React.JSX.Element {
  // TODO: Consider adding state
  return (
    <Dialog visible={props.visible} onDismiss={() => props.hideDialog()}>
      <Dialog.Title>{props.title}</Dialog.Title>
      <Dialog.Content>
        <Text>{props.message}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => props.hideDialog()}>Cancel</Button>
        <Button
          onPress={() => {
            props.hideDialog();
            props.onOk();
          }}>
          Ok
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
