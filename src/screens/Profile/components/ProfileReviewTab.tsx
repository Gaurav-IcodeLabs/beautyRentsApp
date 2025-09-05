import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
} from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { widthScale } from '../../../util';
import { fontWeight } from '../../../theme';
import { FlashList } from '@shopify/flash-list';
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup';
import {
  getAllReviews,
  reviewsInProgressSelector,
  reviewsSelector,
} from '../Profile.slice';
import { ReviewsCard } from '../../../components';

const ProfileReviewTab = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const reviews = useTypedSelector(reviewsSelector);
  const inProgress = useTypedSelector(reviewsInProgressSelector);

  const keyExtractor = (item: any) => item.id.uuid;

  const listEmptyComponent = () => {
    return inProgress ? (
      <ActivityIndicator style={styles.noResults} size={'large'} />
    ) : (
      <Text style={styles.noResults}>
        {t('ManageListingsPage.noResultsForCustomerReview')}
      </Text>
    );
  };

  const handleOnRefresh = () => {
    dispatch(getAllReviews({}));
  };

  return (
    <FlashList
      data={reviews}
      renderItem={({ item }) => <ReviewsCard review={item} />}
      ListEmptyComponent={listEmptyComponent}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={inProgress} onRefresh={handleOnRefresh} />
      }
    />
  );
};

export default ProfileReviewTab;

const styles = StyleSheet.create({
  noResults: {
    marginTop: widthScale(100),
    textAlign: 'center',
    fontSize: widthScale(16),
    fontWeight: fontWeight.semiBold,
  },
});
