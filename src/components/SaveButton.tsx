import {Appbar} from 'react-native-paper';
import {
  AppScreenNavigationProp,
  HomeLocationsTabParamList,
  RootStackParamList,
} from '../navigation/Root';
import {NavigatorScreenParams} from '@react-navigation/native';

type x = NavigatorScreenParams<HomeLocationsTabParamList>;

// TODO: Implement generic navigation function
function navigate<T extends keyof HomeLocationsTabParamList>(
  navigation: AppScreenNavigationProp<'Drawer'>,
  screen: T,
  params: HomeLocationsTabParamList[T],
) {
  type key = T;
  navigation.navigate('Drawer', {
    screen: 'HomeLocationsTabs',
    params: {
      screen,
      params,
    },
  });
}

type SaveButtonParams = {
  disabled: boolean;
  onPress: () => void;
};
export default function SaveButton({disabled, onPress}: SaveButtonParams) {
  return (
    <Appbar.Action
      onPress={() => {
        console.log('Save button on screen pressed');
        onPress();
      }}
      disabled={disabled}
      icon="content-save"
    />
  );
}
