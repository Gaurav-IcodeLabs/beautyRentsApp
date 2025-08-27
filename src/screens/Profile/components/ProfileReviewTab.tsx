import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { widthScale } from '../../../util'
import { fontWeight } from '../../../theme'
import { FlashList } from '@shopify/flash-list'
import { useTypedSelector } from '../../../sharetribeSetup'
import { reviewsInProgressSelector, reviewsSelector } from '../Profile.slice'
import { ReviewsCard } from '../../../components'

const ProfileReviewTab = () => {
  const {t} = useTranslation();
  const reviews = useTypedSelector(reviewsSelector);
  const inProgress = useTypedSelector(reviewsInProgressSelector);

  const keyExtractor = item => item.id.uuid;

  const listEmptyComponent = () => {
    return inProgress ? (
      <ActivityIndicator size={'large'} />
    ) : (
      <View>
        <Text style={styles.noResults}>
          {t('ManageListingsPage.noResultsForCustomerReview')}
        </Text>
      </View>
    );
  };

  return (
    <FlashList
      data={reviews}
      renderItem={({item}) => <ReviewsCard review={item} />}
      ListEmptyComponent={listEmptyComponent}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      estimatedItemSize={143}
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
