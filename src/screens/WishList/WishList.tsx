import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect } from 'react';
import { colors, fontWeight } from '../../theme';
import { ListingCardMain, ScreenHeader } from '../../components';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup';
import { currentUserWishListSelector } from '../../slices/user.slice';
import {
  entitiesSelector,
  getListingsById,
} from '../../slices/marketplaceData.slice';
import { Listing } from '../../appTypes';
import { widthScale } from '../../util';
import {
  fetchWishListListing,
  wishlistIdsInProcessSelector,
  wishlistIdsSelector,
} from './wishlist.slice';

export const WishList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const entities = useTypedSelector(entitiesSelector);
  const currentUserWishListIds = useTypedSelector(currentUserWishListSelector);
  const wishListIds = useTypedSelector(wishlistIdsSelector) || [];
  const wishListIdsLoading = useTypedSelector(wishlistIdsInProcessSelector);
  const listings = wishListIds && getListingsById(entities, wishListIds);

  const keyExtractor = (item: Listing) => item?.id?.uuid;

  useEffect(() => {
    dispatch(fetchWishListListing({ page: 1, ids: currentUserWishListIds }));
  }, []);

  const onRefresh = () => {
    dispatch(fetchWishListListing({ page: 1, ids: currentUserWishListIds }));
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('Settings.wishlist')} />
      <FlatList
        data={listings}
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => {
          return (
            <View style={styles.listContainer}>
              <ListingCardMain listing={item} />
            </View>
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={wishListIdsLoading}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          wishListIdsLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.noResults}>
              {t('OtherUserProfilePage.noListings')}
            </Text>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  listContainer: {
    marginBottom: widthScale(20),
  },
  contentContainer: {
    paddingHorizontal: widthScale(20),
    paddingTop: widthScale(20),
    paddingBottom: widthScale(50),
  },
  noResults: {
    marginTop: widthScale(100),
    textAlign: 'center',
    fontSize: widthScale(16),
    fontWeight: fontWeight.medium,
  },
});
