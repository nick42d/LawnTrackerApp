import {InputModeOptions, KeyboardType} from 'react-native';
import * as v from 'valibot';
import {Location} from '../../providers/statecontext/Locations';

export type AddTrackerListCalendarItemProps = {
  kind: 'calendar';
  label: string;
  disabled?: boolean;
  value: Date | undefined;
  validation?: v.BaseSchema;
  onChange: (v: Date) => void;
};
export type AddTrackerListLocationsItemProps = {
  kind: 'locations';
  label: string;
  icon?: string;
  disabled?: boolean;
  selectedLocationId: number;
  locations: Location[];
  showLocationsDialog: boolean;
  setShowLocationsDialog: (v: boolean) => void;
  onChangeLocationId: (v: number) => void;
  navigateToAddLocation: () => void;
};
export type AddTrackerListTextInputItemProps = {
  // Safe typing could be added to this in future using validation (similar to SettingsList)
  kind: 'textInput';
  label: string;
  icon?: string;
  disabled?: boolean;
  value: string;
  inputMode?: InputModeOptions;
  validation?: v.BaseSchema;
  onChange: (v: string) => void;
};
export type AddTrackerListSelectionItemProps = {
  // Safe typing could be added to this in future using validation (similar to SettingsList)
  kind: 'selection';
  label: string;
  icon?: string;
  value: string;
  values: string[];
  disabled?: boolean;
  onChange: (v: string) => void;
};
export type AddTrackerListProps =
  | AddTrackerListCalendarItemProps
  | AddTrackerListLocationsItemProps
  | AddTrackerListTextInputItemProps
  | AddTrackerListSelectionItemProps;
