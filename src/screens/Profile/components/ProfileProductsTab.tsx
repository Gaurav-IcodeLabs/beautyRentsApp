import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ListingCardMain } from '../../../components';
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup';
import {
  entitiesSelector,
  getOwnListingsById,
} from '../../../slices/marketplaceData.slice';
import { widthScale } from '../../../util';
import {
  getOwnListings,
  ownListingsInProgressSelector,
  ownListingsResultIdsSelector,
  profileListingsPaginationSelector,
} from '../Profile.slice';
import { useTranslation } from 'react-i18next';
import { fontWeight } from '../../../theme';
import { useConfiguration } from '../../../context';

const ProfileProductsTab = () => {
  const { t } = useTranslation();
  const config = useConfiguration();
  const dispatch = useAppDispatch();
  const searchInProgress = useTypedSelector(ownListingsInProgressSelector);
  const entities = useTypedSelector(entitiesSelector);
  const currentPageResultIds = useTypedSelector(ownListingsResultIdsSelector);
  const listings =
    entities && getOwnListingsById(entities, currentPageResultIds);
  const filteredListings = listings.filter(item => !item.attributes.deleted);
  const listingPagination = useTypedSelector(profileListingsPaginationSelector);

  const handleOnRefresh = () => {
    dispatch(getOwnListings({ config, page: 1 }));
  };

  const ListEmptyComponent = useCallback(() => {
    return searchInProgress ? (
      <Text style={styles.noResults}>
        {t('ManageListingsPage.loadingOwnListings')}
      </Text>
    ) : (
      <Text style={styles.noResults}>{t('ManageListingsPage.noResults')}</Text>
    );
  }, [searchInProgress, t]);

  const handleOnEndReached = () => {
    if (
      listingPagination &&
      listingPagination?.page &&
      listingPagination?.totalPages >= listingPagination.page
    ) {
      dispatch(
        getOwnListings({ config: config, page: listingPagination.page + 1 }),
      );
    }
  };

  return (
    <FlatList
      data={filteredListings}
      keyExtractor={item => item?.id?.uuid}
      renderItem={({ item }) => (
        <View style={{ marginBottom: widthScale(20) }}>
          <ListingCardMain fromProfile listing={item} />
        </View>
      )}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={
        <RefreshControl
          refreshing={searchInProgress}
          onRefresh={handleOnRefresh}
        />
      }
      onEndReached={handleOnEndReached}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
};

export default ProfileProductsTab;

const styles = StyleSheet.create({
  noResults: {
    marginTop: widthScale(100),
    textAlign: 'center',
    fontSize: widthScale(16),
    fontWeight: fontWeight.semiBold,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: widthScale(100),
  },
});
