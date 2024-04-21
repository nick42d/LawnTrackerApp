import {Button, Dialog, RadioButton} from 'react-native-paper';
import {Location} from '../../providers/statecontext/Locations';

const ADD_LOCATIONS_DIALOG_TITLE = 'Select Location';

export default function AddLocationsDialog(props: {
  visible: boolean;
  locations: Location[];
  selectedLocationId: number;
  navigateToLocations: () => void;
  hideDialog: () => void;
  onChange: (locationId: number) => void;
}) {
  const selectedLocation = props.locations.find(
    l => l.apiId === props.selectedLocationId,
  );
  const stringMappedValues = props.locations.map((_, idx) => `${idx}`);
  return (
    <Dialog visible={props.visible} onDismiss={props.hideDialog}>
      <Dialog.Title>{ADD_LOCATIONS_DIALOG_TITLE}</Dialog.Title>
      <Dialog.Content>
        {selectedLocation !== undefined ? (
          <RadioButton.Group
            // We need to do type conversion as RadioButton expects 'value' to be a string.
            // We will encode the logic here for now.
            // This could be done in future in a GenericSelectionDialog
            // With an 'addButton' param.
            value={`${props.locations.findIndex(l => l.apiId === props.selectedLocationId)}`}
            onValueChange={val => {
              const valIndex = stringMappedValues.indexOf(val);
              props.onChange(props.locations[valIndex].apiId);
              console.log(`Radio button pressed, ${val}`);
            }}>
            {props.locations.map((l, idx) => {
              return (
                <RadioButton.Item
                  key={l.apiId}
                  label={l.name + ', ' + l.country}
                  value={idx.toString()}
                />
              );
            })}
          </RadioButton.Group>
        ) : undefined}
        <Button
          icon="plus"
          onPress={_ => {
            props.hideDialog();
            props.navigateToLocations();
          }}>
          Add location
        </Button>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={props.hideDialog}>Done</Button>
      </Dialog.Actions>
    </Dialog>
  );
}
