import {StyleSheet} from 'react-native';

export const CARD_TITLE_VARIANT = 'titleLarge';

const styles = StyleSheet.create({
  fabStyle: {
    bottom: 16,
    right: 16,
    position: 'absolute',
  },
  listCard: {
    padding: 5,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  trackerCardLeftCallout: {
    // Unsure why borderRadius on its own doesn't work, but here we are...
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderBottomLeftRadius: 6,
    height: 40,
    width: 40,
    alignContent: 'center',
    justifyContent: 'center',
  },
  trackerCardLeftCalloutText: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  addLocationsPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  map: {
    flex: 1,
    alignSelf: 'stretch',
  },
  loadScreenContainer: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadScreenText: {
    flexDirection: 'row',
    gap: 20,
  },
  loadScreenLogo: {
    width: 200,
    height: 200,
  },
});
export default styles;
