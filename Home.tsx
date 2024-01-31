import {Button, Card, FAB, Icon, Text} from 'react-native-paper';
import {FlatList, StyleSheet, View} from 'react-native';
import {GddTracker, GddSettings} from './Types';

function HomeScreen({navigation}): React.JSX.Element {
  const example_gdds: Array<GddTracker> = [
    {
      location: 'Perth',
      description: 'Back lawn PGR',
      name: 'Buffalo',
      start_date: '1/1/22',
      target_gdd: 255,
      temp_cur_gdd: 240,
      base_temp: 0,
    },
    {
      location: 'Perth',
      description: 'Front lawn PGR',
      name: 'Bermuda',
      start_date: '2/1/22',
      target_gdd: 240,
      temp_cur_gdd: 260,
      base_temp: 0,
    },
    {
      location: 'Perth',
      description: 'Front lawn PGR',
      name: 'Bermuda',
      start_date: '10/1/22',
      target_gdd: 240,
      temp_cur_gdd: 160,
      base_temp: 0,
    },
    {
      location: 'Perth',
      description: 'Front lawn PGR',
      name: 'Bermuda',
      start_date: '10/1/22',
      target_gdd: 240,
      temp_cur_gdd: 160,
      base_temp: 0,
    },
  ];

  let example_settings: GddSettings = {
    low_alert_threshold_perc: 0.8,
  };

  return (
    <View>
      <FlatList
        data={example_gdds}
        renderItem={({item}) => (
          <Card
            mode="elevated"
            style={GetGddCardStyle(
              example_settings,
              item.temp_cur_gdd,
              item.target_gdd,
            )}
            onPress={() => {
              console.log('Pressed card');
              navigation.navigate('ViewCard');
            }}>
            <Card.Title
              title={item.name}
              subtitle={item.description}
              left={props => (
                <Text variant="bodyLarge">{item.temp_cur_gdd}</Text>
              )}
            />
            <Card.Content>
              <Text>{item.location}</Text>
              <Text>{item.start_date}</Text>
              <Text>{item.target_gdd}</Text>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => console.log('Pressed Reset button')}>
                Reset
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
      <FAB
        icon={'plus'}
        onPress={() => {
          console.log('Pressed plus button');
          navigation.navigate('Add');
        }}
        style={[styles.fabStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: {
    padding: 5,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  listItemAmber: {
    padding: 5,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: 'yellow',
  },
  listItemRed: {
    padding: 5,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: 'red',
  },
  fabStyle: {
    bottom: 16,
    right: 16,
    position: 'absolute',
  },
});

function GetGddCardStyle(settings: GddSettings, cur: number, target: number) {
  const progress = cur / target;
  if (progress >= 1) {
    return styles.listItemRed;
  } else if (progress >= settings.low_alert_threshold_perc) {
    return styles.listItemAmber;
  } else {
    return styles.listItem;
  }
}
export default HomeScreen;
