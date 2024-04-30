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
  showDialog: () => void;
}) {
  switch (props.item.kind) {
    case 'list': {
      return (
        <SettingsListListItem item={props.item} showDialog={props.showDialog} />
      );
    }
    case 'toggle': {
      return <SettingsListToggleItem item={props.item} />;
    }
    case 'subheader': {
      return <SettingsListSubheaderItem item={props.item} />;
    }
    case 'press': {
      return (
        <SettingsListPressItem
          item={props.item}
          showDialog={props.showDialog}
        />
      );
    }
    case 'slider': {
      return (
        <SettingsListSliderItem
          item={props.item}
          showDialog={props.showDialog}
        />
      );
    }
  }
}

function SettingsListSubheaderItem(props: {item: SettingsListSubheaderProps}) {
  return (
    <List.Subheader key={props.item.key}>
      {props.item.subheaderTitle}
    </List.Subheader>
  );
}
function SettingsListListItem(props: {
  item: SettingsListListProps;
  showDialog: () => void;
}) {
  return props.item.listProps(i => (
    <List.Item
      descriptionNumberOfLines={3}
      onPress={props.showDialog}
      title={props.item.title}
      description={props.item.description}
      right={() => <Text>{i.stringConverter(i.value)}</Text>}
    />
  ));
}
function SettingsListToggleItem(props: {item: SettingsListToggleProps}) {
  return (
    <List.Item
      descriptionNumberOfLines={3}
      title={props.item.title}
      description={props.item.description}
      right={() => (
        <Switch
          value={props.item.value}
          onValueChange={v => {
            props.item.onChange(v);
          }}
        />
      )}
    />
  );
}
function SettingsListSliderItem(props: {
  item: SettingsListSliderProps;
  showDialog: () => void;
}) {
  return (
    <List.Item
      descriptionNumberOfLines={3}
      onPress={props.showDialog}
      title={props.item.title}
      description={props.item.description}
      right={() => <Text>{props.item.stringConverter(props.item.value)}</Text>}
    />
  );
}
function SettingsListPressItem(props: {
  item: SettingsListPressProps;
  showDialog: () => void;
}) {
  return (
    <List.Item
      descriptionNumberOfLines={3}
      onPress={() => {
        if (props.item.warningDialog) {
          props.showDialog();
          return;
        }
        props.item.onPress();
      }}
      title={props.item.title}
      description={props.item.description}
    />
  );
}
