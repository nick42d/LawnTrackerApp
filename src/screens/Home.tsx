import {Button, Card, FAB, Icon, Text} from 'react-native-paper';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {mockGddTrackers} from '../Mock';
import {GddCard} from '../components/GddCard';
import {HomeLocationsTabScreenProps} from '../navigation/Root';
import styles from '../Styles';
import {StateContext} from '../providers/StateContext';

export default function HomeScreen({
  route,
  navigation,
}: HomeLocationsTabScreenProps<'Home'>) {
  const [refreshing, setRefreshing] = useState(false);
  const {
    gddTrackers,
    refreshWeather,
    deleteGddTrackerName,
    resetGddTrackerName,
  } = React.useContext(StateContext);

  const onRefresh = React.useCallback(() => {
    console.log('Refreshing Home screen');
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
        data={gddTrackers}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <GddCard
            item={item}
            navigation={navigation}
            onDelete={() => deleteGddTrackerName(item.name)}
            onReset={() => resetGddTrackerName(item.name)}
          />
        )}
      />
      <FAB
        icon={'plus'}
        onPress={() => {
          console.log('Pressed plus button on Home screen');
          navigation.navigate('AddGddCard');
        }}
        style={[styles.fabStyle]}
      />
    </View>
  );
}
