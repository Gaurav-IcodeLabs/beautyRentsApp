import {FlatList, StyleSheet, View} from 'react-native';
import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ListingCardHorizontal} from '../../../components';

interface MapSelectedCoordinatesListingsProps {
  listings: any;
}

const MapSelectedCoordinatesListings = (
  props: MapSelectedCoordinatesListingsProps,
) => {
  const {listings} = props;
  const {bottom} = useSafeAreaInsets();
  if (!listings?.length) {
    return null;
  }
  return (
    <View style={[styles.container, {bottom}]}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={listings}
        keyExtractor={item => item?.id?.uuid}
        renderItem={({item, index}) => (
          <ListingCardHorizontal index={index} listing={item} />
        )}
      />
    </View>
  );
};

export default MapSelectedCoordinatesListings;

const styles = StyleSheet.create({
  container: {position: 'absolute', width: '100%'},
});
