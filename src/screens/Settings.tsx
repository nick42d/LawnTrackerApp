import {useContext} from 'react';
import {List, MD3DarkTheme} from 'react-native-paper';
import {SettingsContext} from '../providers/SettingsContext';
import {gddAlgorithmToText, unitOfMeasureToText} from '../state/State';

export default function SettingsScreen() {
  const settings = useContext(SettingsContext);
  return (
    <List.Section>
      <List.Item
        onPress={() => {}}
        title="Locations"
        description="Coming soon"
      />
      <List.Item
        onPress={() => {}}
        title="Algorithm"
        description={gddAlgorithmToText(settings.algorithm)}
      />
      <List.Item
        onPress={() => {}}
        title="Unit of measure"
        description={unitOfMeasureToText(settings.unit_of_measure)}
      />
      <List.Item
        onPress={() => {}}
        title="Auto dark mode"
        description={JSON.stringify(settings.auto_dark_mode)}
      />
      <List.Item
        onPress={() => {}}
        title="Default base temp"
        // TODO: Show actual value, not enum number
        description={settings.default_base_temp}
      />
      <List.Item
        onPress={() => {}}
        title="API Key"
        description="Enter your weatherapi.com API"
      />
    </List.Section>
  );
}
