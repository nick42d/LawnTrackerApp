import {Button, Card, FAB, Icon, Text} from 'react-native-paper';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {LocationsContext} from '../providers/LocationsContext';
import {mockGddTrackers} from '../Mock';
import {GddCard} from '../components/GddCard';
import {HomeLocationsTabScreenProps} from '../navigation/Root';
import styles from '../Styles';

export default function HomeScreen({
  route,
  navigation,
}: HomeLocationsTabScreenProps<'Home'>) {
  const [gddTrackers, setGddTrackers] = useState(mockGddTrackers());
  const [refreshing, setRefreshing] = useState(false);
  const {refresh} = React.useContext(LocationsContext);

  const onRefresh = React.useCallback(() => {
    console.log('Refreshing Home screen');
    setRefreshing(true);
    if (refresh !== undefined) {
      refresh();
    } else {
      console.log('Refresh callback not set, doing nothing');
    }
    setRefreshing(false);
  }, [refresh]);
  React.useEffect(() => {
    console.log('Reloading Home');
    if (route.params?.add_gdd) {
      console.log(`Adding card to Home screen`);
      const gddTrackersTemp = gddTrackers;
      const gdd_to_add = route.params.add_gdd;
      gddTrackersTemp.push(gdd_to_add);
      setGddTrackers(gddTrackersTemp);
    }
  }, [route.params?.add_gdd]);

  function deleteName(name: string) {
    setGddTrackers(gddTrackers.filter(element => element.name != name));
  }
  function resetName(name: string) {
    const new_state = gddTrackers.map(element =>
      element.name === name
        ? {...element, temp_cur_gdd: 0, start_date: new Date(Date.now())}
        : element,
    );
    setGddTrackers(new_state);
  }

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
            onDelete={() => deleteName(item.name)}
            onReset={() => resetName(item.name)}
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
