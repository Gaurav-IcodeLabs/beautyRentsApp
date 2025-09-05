import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { widthScale } from '../../../util';
import { ListingCardMain } from '../../../components';
import { fontWeight } from '../../../theme';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup';
import { useConfiguration } from '../../../context';
import {
  entitiesSelector,
  getListingsById,
} from '../../../slices/marketplaceData.slice';
import {
  getUserListings,
  userListingsInProgressSelector,
  userListingsPaginationSelector,
  userListingsResultIdsSelector,
} from '../OtherUserProfile.slice';

const OtherUserProfileProductsTab = ({ userId }: { userId: string }) => {
  const { t } = useTranslation();
  const config = useConfiguration();
  const dispatch = useAppDispatch();
  const searchInProgress = useTypedSelector(userListingsInProgressSelector);
  const entities = useTypedSelector(entitiesSelector);
  const currentPageResultIds = useTypedSelector(userListingsResultIdsSelector);
  const listings = entities && getListingsById(entities, currentPageResultIds);
  const filteredListings = listings.filter(item => !item.attributes.deleted);
  const listingPagination = useTypedSelector(userListingsPaginationSelector);

  const handleOnRefresh = () => {
    dispatch(getUserListings({ userId: userId, config, page: 1 }));
  };

  const ListEmptyComponent = React.useCallback(() => {
    return searchInProgress ? (
      <Text style={styles.noResults}>
        {t('ManageListingsPage.loadingOwnListings')}
      </Text>
    ) : (
      <Text style={styles.noResults}>
        {t('OtherUserProfilePage.noListings')}
      </Text>
    );
  }, [searchInProgress, t]);

  const handleOnEndReached = () => {
    if (
      listingPagination &&
      listingPagination?.page &&
      listingPagination?.totalPages >= listingPagination.page
    ) {
      dispatch(
        getUserListings({
          userId: userId,
          config: config,
          page: listingPagination.page + 1,
        }),
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

export default OtherUserProfileProductsTab;

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
