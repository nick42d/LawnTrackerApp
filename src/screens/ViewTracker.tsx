import React, {useContext} from 'react';
import {DataTable, Text, useTheme} from 'react-native-paper';
import {ScrollView, View} from 'react-native';
import {AppScreenProps} from '../navigation/Root';
import {getGraphPlot, getTrackerGddArray} from '../plot/Gdd';
import {SettingsContext} from '../providers/SettingsContext';
import {StateContext} from '../providers/StateContext';
import {TrackerProps} from '../components/TrackerProps';
import {checkWeatherInvariants} from '../api/Types';
import {format} from 'date-fns';
import {GddGraph} from '../components/GddGraph';

export default function ViewTrackerScreen({
  route,
}: AppScreenProps<'ViewTracker'>) {
  const {locations} = useContext(StateContext);
  const {settings} = useContext(SettingsContext);
  const theme = useTheme();
  const item = route.params.tracker;
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
    item.kind === 'gdd'
      ? getTrackerGddArray(item, locations, settings.algorithm)
      : undefined;
  const data = gddArray ? getGraphPlot(gddArray) : undefined;
  return (
    <ScrollView>
      <TrackerProps tracker={item} />
      {item.kind === 'gdd' && data !== undefined && gddArray !== undefined ? (
        <View style={{rowGap: 30}}>
          <GddGraph data={data} targetGdd={item.target_gdd} />
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Day</DataTable.Title>
              <DataTable.Title>GDD</DataTable.Title>
              <DataTable.Title>GDD - Total</DataTable.Title>
              <DataTable.Title>GDD Type</DataTable.Title>
            </DataTable.Header>
            {gddArray.map(i => (
              <DataTable.Row key={i.dateUnix}>
                <DataTable.Cell>
                  {format(new Date(i.dateUnix * 1000), 'EEEEEE dd/MM')}
                </DataTable.Cell>
                <DataTable.Cell>{i.gdd.toFixed(1)}</DataTable.Cell>
                <DataTable.Cell>{i.gddAcc.toFixed(1)}</DataTable.Cell>
                <DataTable.Cell>{i.weatherType}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>
      ) : undefined}
    </ScrollView>
  );
}
