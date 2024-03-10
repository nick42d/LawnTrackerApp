import {useContext} from 'react';
import {GddTracker} from './Types';
import {LocationsContext} from './providers/LocationsContext';
import {calcGdd} from './Knowledge';
import {SettingsContext} from './providers/SettingsContext';
import {Button, Card, Icon, Text} from 'react-native-paper';
import {Image, StyleSheet, View} from 'react-native';
import {Location} from './state/State';
import {HomeLocationsTabScreenProps} from './navigation/Root';
import * as central_styles from './Styles';

export const CARD_TITLE_VARIANT = 'titleLarge';
