import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Listing } from '../../../appTypes';
import { ListingCardSmall } from '../../../components';
import { useTypedSelector } from '../../../sharetribeSetup';
import {
  entitiesSelector,
  getListingsById,
} from '../../../slices/marketplaceData.slice';
import { fontWeight } from '../../../theme';
import { fontScale, widthScale } from '../../../util';
import { similarListingIdsSelector } from '../Listing.slice';

interface SimilarItemsProps {
  listingId: string;
}

const SimilarItems = (props: SimilarItemsProps) => {
  const { listingId } = props;
  const { t } = useTranslation();
  const similarItemIds = useTypedSelector(
    state => similarListingIdsSelector(state, listingId) ?? [],
  )?.filter?.(id => id.uuid !== listingId);
  const entities = useTypedSelector(entitiesSelector);
  const listings = entities && getListingsById(entities, similarItemIds);
  if (!similarItemIds.length) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('ListingPage.SimilarItems')}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={listings}
        keyExtractor={item => item?.id?.uuid}
        renderItem={({ item, index }: { item: Listing; index: number }) => (
          <ListingCardSmall listing={item} index={index} />
        )}
      />
    </View>
  );
};

export default SimilarItems;

const styles = StyleSheet.create({
  container: {
    marginVertical: widthScale(20),
  },
  heading: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.semiBold,
    marginLeft: widthScale(20),
    marginBottom: widthScale(10),
  },
});
