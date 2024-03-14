import React, {useContext, useState} from 'react';
import {FAB, Text} from 'react-native-paper';
import {FlatList, RefreshControl, ScrollView, View} from 'react-native';
import styles from '../Styles';
import {LocationsCard} from '../components/LocationsCard';
import {HomeLocationsTabScreenProps} from '../navigation/Root';
import {StateContext} from '../providers/StateContext';

export default function LocationsScreen({
  route,
  navigation,
}: HomeLocationsTabScreenProps<'Locations'>): React.JSX.Element {
  const {locations, refreshWeather} = useContext(StateContext);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    console.log('Refreshing on Locations screen');
    setRefreshing(true);
    if (refreshWeather !== undefined) {
      refreshWeather();
    } else {
      console.log('Refresh callback not set, doing nothing');
    }
    setRefreshing(false);
  }, [refreshWeather]);

  return (
    <View style={{flex: 1}}>
      <FlatList
        data={locations}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <LocationsCard location={item} navigation={navigation} />
        )}
      />
      <FAB
        icon={'plus'}
        onPress={() => {
          console.log('Pressed plus button on locations screen');
          navigation.navigate('AddLocationCard');
        }}
        style={[styles.fabStyle]}
      />
    </View>
  );
}

function ViewWeather() {
  const {locations} = useContext(LocationsContext);
  const [refreshing, setRefreshing] = useState(false);
  const {refresh} = React.useContext(LocationsContext);
  const onRefresh = React.useCallback(() => {
    console.log('Refreshing on Locations screen');
    setRefreshing(true);
    refresh ? refresh() : console.log('No refresh func found');
    setRefreshing(false);
  }, []);
  // function gdds_data() {
  //   return weather.forecasts.map(day => ({
  //     value: calcGdd(day.mintemp_c, day.maxtemp_c, T_BASE),
  //   }));
  // }
  // function gdds_data_low() {
  //   return weather.forecasts.map(day => ({
  //     value: day.mintemp_c,
  //   }));
  // }
  // function gdds_data_high() {
  //   return weather.forecasts.map(day => ({
  //     value: day.maxtemp_c,
  //   }));
  // }
  return (
    // <ScrollView
    //   refreshControl={
    //     <RefreshControl refreshing={false} onRefresh={onRefresh} />
    //   }>
    //   <Text>{weather.location}</Text>
    //   <List.Section>
    //     <List.Subheader>Weather</List.Subheader>
    //     {weather.forecasts.map(gdd => (
    //       <List.Item title={gdd.date.toString()} description={gdd.mintemp_c} />
    //     ))}
    //     <LineChart
    //       // TODO: Don't hardcode the width, get it from the device...
    //       width={GRAPH_WIDTH}
    //       data={gdds_data_high()}
    //       data2={gdds_data_low()}
    //       data3={gdds_data()}
    //       color1="red"
    //       color2="blue"
    //       color3="green"
    //       isAnimated
    //       curved
    //       adjustToWidth
    //     />
    //   </List.Section>
    // </ScrollView>
    <View></View>
  );
}
