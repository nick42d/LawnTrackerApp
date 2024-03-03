import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {GddTracker} from './Types';
import {MaterialBottomTabScreenProps} from 'react-native-paper';
import {StackScreenProps} from '@react-navigation/stack';

export type RootStackParamList = {
  HomeWeather: NavigatorScreenParams<HomeWeatherTabParamList>;
  Add: undefined;
  ViewCard: {gddCard: GddTracker};
};

export type HomeWeatherTabParamList = {
  Home: {add_gdd: GddTracker} | undefined;
  Weather: undefined;
};

export type AppScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type HomeWeatherTabScreenProps<T extends keyof HomeWeatherTabParamList> =
  CompositeScreenProps<
    MaterialBottomTabScreenProps<HomeWeatherTabParamList, T>,
    StackScreenProps<RootStackParamList>
  >;
