import ConfirmationDialog from '../ConfirmationDialog';
import GenericSelectionDialog, {
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
  stateUpdater: (newState: SettingsListProps) => void;
}) {
  switch (props.item.kind) {
    case 'list': {
      return <SettingsListListDialog item={props.item} />;
    }
    case 'slider': {
      return <SettingsListSliderDialog item={props.item} />;
    }
    case 'press': {
      return (
        <SettingsListPressDialog
          item={props.item}
          stateUpdater={props.stateUpdater}
        />
      );
    }
  }
}

function SettingsListPressDialog(props: {
  item: SettingsListPressProps;
  stateUpdater: (newState: SettingsListProps) => void;
}) {
  if (props.item.warningDialog) {
    const dialog = props.item.warningDialog;
    return (
      <ConfirmationDialog
        title={dialog.title}
        message={dialog.message}
        visible={dialog.visible}
        setVisible={v =>
          props.stateUpdater({
            ...props.item,
            warningDialog: {...dialog, visible: v},
          })
        }
        onOk={props.item.onPress}
      />
    );
  }
}
function SettingsListListDialog(props: {item: SettingsListListProps}) {
  return (
    <GenericSelectionDialog<string>
      title="Select Unit of Measure"
      visible={props.item.dialogShown}
      setVisible={x => {}}
      values={props.item.list}
      curValue={props.item.value}
      setCurValue={() => {}}
      stringConverter={s => s}
    />
  );
}
function SettingsListSliderDialog(props: {item: SettingsListSliderProps}) {
  return (
    <SliderSelectionDialog
      title="Select Warning Threshold Perc"
      setCurValue={() => {}}
      setVisible={() => {}}
      visible={props.item.dialogShown}
      curValue={props.item.value}
      minValue={props.item.minValue}
      maxValue={props.item.maxValue}
      step={props.item.step}
      textConverter={props.item.stringConverter}
    />
  );
}
