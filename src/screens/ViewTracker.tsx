import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, DataTable, Text, useTheme} from 'react-native-paper';
import {ScrollView, View} from 'react-native';
import {AppScreenProps} from '../navigation/Root';
import {getGraphPlot, getTrackerGddArray} from '../components/gddplot/Plot';
import {SettingsContext} from '../providers/SettingsContext';
import {StateContext} from '../providers/StateContext';
import {TrackerProps} from '../components/TrackerProps';
import {checkWeatherInvariants} from '../api/Types';
import {format} from 'date-fns';
import {GddPlot} from '../components/GddPlot';
import AppBarIconButton from '../components/AppBarIconButton';
import {timeout} from '../Utils';
import GddDataTable from '../components/GddDataTable';

export default function ViewTrackerScreen({
  navigation,
  route,
}: AppScreenProps<'ViewTracker'>) {
  const {locations, trackers} = useContext(StateContext);
  const {settings} = useContext(SettingsContext);
  const theme = useTheme();
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AppBarIconButton
          onPress={() => {
            console.log(
              'Edit button pressed, tracker id: ',
              route.params.trackerId,
            );
            navigation.navigate('EditTracker', {
              trackerId: route.params.trackerId,
            });
          }}
          icon="pencil-outline"
        />
      ),
    });
    // Hack to 'lazy load' the slow parts of the card
    timeout(50).then(() => setWaited(true));
  }, []);
  const item = trackers.find(t => t.uuid === route.params.trackerId);
  // Temp check for invariants
  locations.map(l => {
    console.log('Checking invariant weather at ' + l.name);
    if (l.weather === undefined) {
      console.log('Weather undefined');
      return;
    }
    console.log(JSON.stringify(checkWeatherInvariants(l.weather)));
  });
  const gddArray =
    item?.kind === 'gdd'
      ? getTrackerGddArray(item, locations, settings.algorithm)
      : undefined;
  const data = gddArray
    ? getGraphPlot(gddArray, theme.colors.primaryContainer)
    : undefined;
  return (
    // NOTE:  GDD Trackers also show Plot and DataTable
    <ScrollView>
      {item ? <TrackerProps tracker={item} /> : undefined}
      {item?.kind === 'gdd' && data !== undefined && gddArray !== undefined ? (
        <View style={{rowGap: 30}}>
          {waited ? (
            <View>
              <GddPlot data={data} targetGdd={item.target_gdd} />
              <GddDataTable gddArray={gddArray} />
            </View>
          ) : (
            <ActivityIndicator size="large" />
          )}
        </View>
      ) : undefined}
    </ScrollView>
  );
}
