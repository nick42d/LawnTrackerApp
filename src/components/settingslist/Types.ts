/**
 * Type SettingsListProps can be ultimately used to generate
 * a settings list, when used in an array.
 */
export type SettingsListProps =
  | SettingsListToggleProps
  | SettingsListPressProps
  | SettingsListSliderProps
  | SettingsListSubheaderProps
  | SettingsListListProps;
export type SettingsListSubheaderProps = {
  kind: 'subheader';
  subheaderTitle: string;
  key: string;
};
export type BaseSettingsListKind = 'toggle' | 'press' | 'slider' | 'list';
export type BaseSettingsListProps<T extends BaseSettingsListKind> = {
  kind: T;
  title: string;
  description: string;
  key: string;
};
export type SettingsListToggleProps = BaseSettingsListProps<'toggle'> & {
  value: boolean;
  onChange: (value: boolean) => void;
};
export type SettingsListPressProps = BaseSettingsListProps<'press'> & {
  onPress: () => void;
  warningDialog?: {
    title: string;
    message: string;
  };
};
export type SettingsListSliderProps = BaseSettingsListProps<'slider'> & {
  value: number;
  minValue: number;
  maxValue: number;
  step: number;
  onChange: (value: number) => void;
  // Converter for displaying the number
  stringConverter: (value: number) => string;
};
export type SettingsListListProps = BaseSettingsListProps<'list'> & {
  listProps: SomeSettingsListListProps;
};
type GenericSettingsListListProps<T> = {
  value: T;
  list: readonly T[];
  onChange: (value: T) => void;
  stringConverter: (value: T) => string;
};
/**
 * Type of a function that takes a callback that turns a
 * GenericSettingsListListProps into a concrete type.
 * The function then resolves into the same concrete type.
 * This abstraction is used to allow generic lists to be used.
 */
type SomeSettingsListListProps = <R>(
  cb: <T>(props: GenericSettingsListListProps<T>) => R,
) => R;
/**
 * Function to generate a SomeSettingsListListProps based on a
 * GenericSettingsListListProps
 * @param s
 * @returns
 */
export function toSomeSettingsListListProps<T>(
  s: GenericSettingsListListProps<T>,
): SomeSettingsListListProps {
  return cb => cb(s);
}
/**
 * Settings may have dialogs but the rules are not always clear.
 * This function returns true of if a settings prop should have a dialog.
 */
export function settingsListPropHasDialog(s: SettingsListProps) {
  return (
    s.kind === 'list' ||
    s.kind === 'slider' ||
    (s.kind === 'press' && s.warningDialog)
  );
}
