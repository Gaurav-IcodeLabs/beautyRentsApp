import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
} from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup';
import {
  getUsersAllReviews,
  userReviewsInProgressSelector,
  userReviewsSelector,
} from '../OtherUserProfile.slice';
import { widthScale } from '../../../util';
import { fontWeight } from '../../../theme';
import { FlashList } from '@shopify/flash-list';
import { ReviewsCard } from '../../../components';
import OtherUserProfileReviewHeader from './OtherUserProfileReviewHeader';
import { ReviewTypeAndState } from '../../../appTypes';

const getTabsData = (t: any) => {
  return [
    {
      key: t('OtherUserProfilePage.reviewHeaderCustomer'),
      label: t('OtherUserProfilePage.reviewHeaderCustomer'),
    },
    {
      key: t('OtherUserProfilePage.reviewHeaderProvider'),
      label: t('OtherUserProfilePage.reviewHeaderProvider'),
    },
  ];
};

const OtherUserProfileReviewsTab = ({ userId }: { userId: any }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const reviews = useTypedSelector(userReviewsSelector);
  const inProgress = useTypedSelector(userReviewsInProgressSelector);
  const tabsData = getTabsData(t);
  const [selectedTab, setSelectedTab] = React.useState(tabsData[0].label);
  const keyExtractor = (item: any) => item.id.uuid;

  const listEmptyComponent = () => {
    return inProgress ? (
      <ActivityIndicator style={styles.noResults} size={'large'} />
    ) : (
      <Text style={styles.noResults}>
        {t('OtherUserProfilePage.noReviews')}
      </Text>
    );
  };

  const handleOnRefresh = () => {
    const type =
      selectedTab === 'Reviews from customer'
        ? ReviewTypeAndState.REVIEW_TYPE_OF_PROVIDER
        : ReviewTypeAndState.REVIEW_TYPE_OF_CUSTOMER;
    dispatch(getUsersAllReviews({ userId, type }));
  };

  const handleTabPress = async (val: string) => {
    setSelectedTab(val);
    const type =
      val === 'Reviews from customer'
        ? ReviewTypeAndState.REVIEW_TYPE_OF_PROVIDER
        : ReviewTypeAndState.REVIEW_TYPE_OF_CUSTOMER;

    dispatch(getUsersAllReviews({ userId, type }));
  };

  return (
    <>
      <OtherUserProfileReviewHeader
        selectedTab={selectedTab}
        handleTabPress={handleTabPress}
        tabsData={tabsData}
      />
      <FlashList
        data={reviews}
        renderItem={({ item }) => <ReviewsCard review={item} />}
        ListEmptyComponent={listEmptyComponent}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={inProgress} onRefresh={handleOnRefresh} />
        }
        contentContainerStyle={{ paddingBottom: widthScale(50) }}
      />
    </>
  );
};

export default OtherUserProfileReviewsTab;

const styles = StyleSheet.create({
  noResults: {
    marginTop: widthScale(100),
    textAlign: 'center',
    fontSize: widthScale(16),
    fontWeight: fontWeight.semiBold,
  },
});
//  <>
//
//     </>
