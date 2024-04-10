import React, {useContext} from 'react';
import {DataTable, Text, useTheme} from 'react-native-paper';
import {ScrollView, View} from 'react-native';
import {AppScreenProps} from '../navigation/Root';

export default function ViewLocationScreen({
  route,
}: AppScreenProps<'ViewLocation'>) {
  const item = route.params.location;
  return (
    <ScrollView>
      {item.weather ? (
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Day</DataTable.Title>
            <DataTable.Title>Max</DataTable.Title>
            <DataTable.Title>Min</DataTable.Title>
            <DataTable.Title>Type</DataTable.Title>
          </DataTable.Header>
          {item.weather.weather_array.map(w => (
            <DataTable.Row key={w.date_unix}>
              <DataTable.Cell>
                {new Date(w.date_unix * 1000).toLocaleDateString()}
              </DataTable.Cell>
              <DataTable.Cell>{w.maxtemp}</DataTable.Cell>
              <DataTable.Cell>{w.mintemp}</DataTable.Cell>
              <DataTable.Cell>{w.weather_type}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      ) : undefined}
    </ScrollView>
  );
}
