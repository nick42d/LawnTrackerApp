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
    visible: boolean;
  };
};
export type SettingsListSliderProps = BaseSettingsListProps<'slider'> & {
  value: number;
  minValue: number;
  maxValue: number;
  step: number;
  onChange: (value: number) => void;
  dialogShown: boolean;
  // Convert for the right callout
  stringConverter: (value: number) => string;
};
export type SettingsListListProps = BaseSettingsListProps<'list'> & {
  value: string;
  list: readonly string[];
  onChange: (value: string) => void;
  dialogShown: boolean;
};
export type SettingsListProps =
  | SettingsListToggleProps
  | SettingsListPressProps
  | SettingsListSliderProps
  | SettingsListSubheaderProps
  | SettingsListListProps;
