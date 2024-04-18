import {Appbar} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

type AppBarIconButtonParams = {
  icon: IconSource;
  disabled?: boolean;
  onPress: () => void;
};
export default function AppBarIconButton({
  disabled,
  icon,
  onPress,
}: AppBarIconButtonParams) {
  return (
    <Appbar.Action
      onPress={() => {
        onPress();
      }}
      disabled={disabled ? disabled : false}
      icon={icon}
    />
  );
}
