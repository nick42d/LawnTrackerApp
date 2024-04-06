import { StyleSheet } from 'react-native';

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
    textAlignVertical: 'center'
  }
});
export default styles;