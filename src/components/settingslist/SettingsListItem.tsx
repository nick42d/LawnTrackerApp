import {List, Switch, Text} from 'react-native-paper';
import {
  SettingsListProps,
  SettingsListListProps,
  SettingsListPressProps,
  SettingsListSliderProps,
  SettingsListSubheaderProps,
  SettingsListToggleProps,
} from './Types';

export default function SettingsListItem(props: {
  item: SettingsListProps;
  stateUpdater: (newState: SettingsListProps) => void;
}) {
  switch (props.item.kind) {
    case 'list': {
      return (
        <SettingsListListItem
          item={props.item}
          stateUpdater={props.stateUpdater}
        />
      );
    }
    case 'toggle': {
      return (
        <SettingsListToggleItem
          item={props.item}
          stateUpdater={props.stateUpdater}
        />
      );
    }
    case 'subheader': {
      return (
        <SettingsListSubheaderItem
          item={props.item}
          stateUpdater={props.stateUpdater}
        />
      );
    }
    case 'press': {
      return (
        <SettingsListPressItem
          item={props.item}
          stateUpdater={props.stateUpdater}
        />
      );
    }
    case 'slider': {
      return (
        <SettingsListSliderItem
          item={props.item}
          stateUpdater={props.stateUpdater}
        />
      );
    }
  }
}

function SettingsListSubheaderItem(props: {
  item: SettingsListSubheaderProps;
  stateUpdater: (newState: SettingsListProps) => void;
}) {
  return (
    <List.Subheader key={props.item.key}>
      {props.item.subheaderTitle}
    </List.Subheader>
  );
}
function SettingsListListItem(props: {
  item: SettingsListListProps;
  stateUpdater: (newState: SettingsListProps) => void;
}) {
  return (
    <List.Item
      onPress={() => {}}
      title={props.item.title}
      description={props.item.description}
      right={() => <Text>{props.item.value}</Text>}
    />
  );
}
function SettingsListToggleItem(props: {
  item: SettingsListToggleProps;
  stateUpdater: (newState: SettingsListProps) => void;
}) {
  return (
    <List.Item
      title={props.item.title}
      description={props.item.description}
      right={() => (
        <Switch
          value={props.item.value}
          onValueChange={v => {
            props.stateUpdater({...props.item, value: v});
            props.item.onChange(v);
          }}
        />
      )}
    />
  );
}
function SettingsListSliderItem(props: {
  item: SettingsListSliderProps;
  stateUpdater: (newState: SettingsListProps) => void;
}) {
  return (
    <List.Item
      onPress={() => {}}
      title={props.item.title}
      description={props.item.description}
      right={() => <Text>{props.item.stringConverter(props.item.value)}</Text>}
    />
  );
}
function SettingsListPressItem(props: {
  item: SettingsListPressProps;
  stateUpdater: (newState: SettingsListProps) => void;
}) {
  return (
    <List.Item
      onPress={() => {
        if (props.item.warningDialog) {
          const dialog = props.item.warningDialog;
          props.stateUpdater({
            ...props.item,
            warningDialog: {...dialog, visible: true},
          });
        } else {
          props.item.onPress();
        }
      }}
      title={props.item.title}
      description={props.item.description}
    />
  );
}
