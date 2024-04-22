import {Location} from '../../providers/statecontext/Locations';
import {
  AddCalendarTrackerInput,
  AddCalendarTrackerStartDateSchema,
  AddGddTrackerInput,
  AddGddTrackerStartDateSchema,
  AddGddTrackerTargetSchema,
  AddTimedTrackerDurationDaysSchema,
  AddTimedTrackerInput,
  AddTimedTrackerStartDateSchema,
  AddTrackerInput,
  TrackerDescSchema,
  TrackerNameSchema,
} from '../../providers/statecontext/Trackers';
import {AddTrackerListProps} from '../../components/addtrackerlist/Types';

export function getAddTrackerProps(
  locations: Location[],
  state: AddTrackerInput,
  showLocationsDialog: boolean,
  setState: (state: AddTrackerInput) => void,
  setShowLocationsDialog: (v: boolean) => void,
  navigateToAddLocation: () => void,
): AddTrackerListProps[] {
  switch (state.kind) {
    case 'gdd':
      return getAddGddTrackerProps(
        locations,
        state,
        showLocationsDialog,
        setState,
        setShowLocationsDialog,
        navigateToAddLocation,
      );
    case 'calendar':
      return getAddCalendarTrackerProps(state, setState);
    case 'timed':
      return getAddTimedTrackerProps(state, setState);
  }
}
function getAddTimedTrackerProps(
  state: AddTimedTrackerInput,
  setState: (state: AddTrackerInput) => void,
): AddTrackerListProps[] {
  return [
    {
      kind: 'textInput',
      label: 'Name',
      value: state.name,
      validation: TrackerNameSchema,
      onChange: v => setState({...state, name: v}),
    },
    {
      kind: 'textInput',
      label: 'Description',
      value: state.description,
      validation: TrackerDescSchema,
      onChange: v => setState({...state, description: v}),
    },
    {
      kind: 'calendar',
      label: 'Start date',
      value: state.start_date_unix_ms,
      validation: AddTimedTrackerStartDateSchema,
      onChange: v => setState({...state, start_date_unix_ms: v}),
    },
    {
      kind: 'textInput',
      label: 'Duration(days)',
      value: state.duration_days,
      validation: AddTimedTrackerDurationDaysSchema,
      onChange: v => setState({...state, duration_days: v}),
    },
  ];
}
function getAddCalendarTrackerProps(
  state: AddCalendarTrackerInput,
  setState: (state: AddTrackerInput) => void,
): AddTrackerListProps[] {
  return [
    {
      kind: 'textInput',
      label: 'Name',
      value: state.name,
      validation: TrackerNameSchema,
      onChange: v => setState({...state, name: v}),
    },
    {
      kind: 'textInput',
      label: 'Description',
      value: state.description,
      validation: TrackerDescSchema,
      onChange: v => setState({...state, description: v}),
    },
    {
      kind: 'calendar',
      label: 'Date',
      value: state.target_date_unix_ms,
      validation: AddCalendarTrackerStartDateSchema,
      onChange: v => setState({...state, target_date_unix_ms: v}),
    },
  ];
}
function getAddGddTrackerProps(
  locations: Location[],
  state: AddGddTrackerInput,
  showLocationsDialog: boolean,
  setState: (state: AddTrackerInput) => void,
  setShowLocationsDialog: (v: boolean) => void,
  navigateToAddLocation: () => void,
): AddTrackerListProps[] {
  return [
    {
      kind: 'textInput',
      label: 'Name',
      value: state.name,
      validation: TrackerNameSchema,
      onChange: v => setState({...state, name: v}),
    },
    {
      kind: 'textInput',
      label: 'Description',
      value: state.description,
      validation: TrackerDescSchema,
      onChange: v => setState({...state, description: v}),
    },
    {
      kind: 'calendar',
      label: 'Start date',
      value: state.start_date_unix_ms,
      validation: AddGddTrackerStartDateSchema,
      onChange: v => setState({...state, start_date_unix_ms: v}),
    },
    {
      kind: 'locations',
      label: 'Select locations',
      selectedLocationId: state.locationId,
      locations,
      showLocationsDialog,
      setShowLocationsDialog,
      onChangeLocationId: v => setState({...state, locationId: v}),
      navigateToAddLocation,
    },
    {
      kind: 'textInput',
      label: 'Target',
      inputMode: 'numeric',
      value: state.target_gdd,
      validation: AddGddTrackerTargetSchema,
      onChange: v => setState({...state, target_gdd: v}),
    },
    {
      kind: 'selection',
      label: 'Base temp',
      icon: 'target',
      value: state.base_temp,
      values: ['0', '10'],
      onChange: v => setState({...state, base_temp: v}),
    },
  ];
}
