import ConfirmationDialog from '../ConfirmationDialog';
import {
  GenericSelectionDialog,
  SliderSelectionDialog,
} from '../SelectionDialog';
import {
  SettingsListListProps,
  SettingsListPressProps,
  SettingsListProps,
  SettingsListSliderProps,
} from './Types';

export default function SettingsListDialog(props: {
  item:
    | SettingsListListProps
    | SettingsListSliderProps
    | SettingsListPressProps;
  visible: boolean;
  hideDialog: () => void;
}) {
  switch (props.item.kind) {
    case 'list': {
      return (
        <SettingsListListDialog
          shown={props.visible}
          hideDialog={props.hideDialog}
          item={props.item}
        />
      );
    }
    case 'slider': {
      return (
        <SettingsListSliderDialog
          shown={props.visible}
          hideDialog={props.hideDialog}
          item={props.item}
        />
      );
    }
    case 'press': {
      return (
        <SettingsListPressDialog
          item={props.item}
          shown={props.visible}
          hideDialog={props.hideDialog}
        />
      );
    }
  }
}

function SettingsListPressDialog(props: {
  item: SettingsListPressProps;
  hideDialog: () => void;
  shown: boolean;
}) {
  if (props.item.warningDialog) {
    const dialog = props.item.warningDialog;
    return (
      <ConfirmationDialog
        title={dialog.title}
        message={dialog.message}
        visible={props.shown}
        hideDialog={props.hideDialog}
        onOk={props.item.onPress}
      />
    );
  }
}
function SettingsListListDialog(props: {
  item: SettingsListListProps;
  hideDialog: () => void;
  shown: boolean;
}) {
  return props.item.listProps(i => (
    <GenericSelectionDialog
      title={props.item.title}
      visible={props.shown}
      hideDialog={props.hideDialog}
      values={i.list}
      curValue={i.value}
      onChange={i.onChange}
      stringConverter={i.stringConverter}
    />
  ));
}
function SettingsListSliderDialog(props: {
  item: SettingsListSliderProps;
  hideDialog: () => void;
  shown: boolean;
}) {
  return (
    <SliderSelectionDialog
      title={props.item.title}
      onChange={props.item.onChange}
      hideDialog={props.hideDialog}
      visible={props.shown}
      curValue={props.item.value}
      minValue={props.item.minValue}
      maxValue={props.item.maxValue}
      step={props.item.step}
      stringConverter={props.item.stringConverter}
    />
  );
}
