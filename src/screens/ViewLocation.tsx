import React, {useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  DataTable,
  List,
  Text,
  useTheme,
} from 'react-native-paper';
import {ScrollView, View} from 'react-native';
import {AppScreenProps} from '../navigation/Root';
import {timeout} from '../Utils';

export default function ViewLocationScreen({
  route,
}: AppScreenProps<'ViewLocation'>) {
  // Improve responsiveness - load page first then freeze (as DataTable is slow)
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    timeout(50).then(() => setWaited(true));
  }, []);

  const item = route.params.location;

  return (
    <ScrollView>
      <List.Section>
        <List.Item title={'Name'} description={item.name} />
        <List.Item title={'Country'} description={item.country} />
        <List.Item title={'Latitude'} description={item.latitude.toFixed(4)} />
        <List.Item
          title={'Longitude'}
          description={item.longitude.toFixed(4)}
        />
        <List.Item title={'Status'} description={item.weatherStatus.status} />
        <List.Item
          title={'Last refreshed'}
          description={
            item.weatherStatus.lastRefreshedUnixMs
              ? new Date(
                  item.weatherStatus.lastRefreshedUnixMs,
                ).toLocaleString()
              : 'Never'
          }
        />
      </List.Section>
      {item.weather ? (
        waited ? (
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Day</DataTable.Title>
              <DataTable.Title>Max</DataTable.Title>
              <DataTable.Title>Min</DataTable.Title>
              <DataTable.Title>Type</DataTable.Title>
            </DataTable.Header>
            {item.weather.weatherArray.map(w => (
              <DataTable.Row key={w.dateUnixMs}>
                <DataTable.Cell>
                  {new Date(w.dateUnixMs).toLocaleDateString()}
                </DataTable.Cell>
                <DataTable.Cell>{w.maxTemp}</DataTable.Cell>
                <DataTable.Cell>{w.minTemp}</DataTable.Cell>
                <DataTable.Cell>{w.weatherType}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        ) : (
          <ActivityIndicator />
        )
      ) : undefined}
    </ScrollView>
  );
}
