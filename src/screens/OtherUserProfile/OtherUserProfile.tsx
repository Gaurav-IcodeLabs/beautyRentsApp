import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useConfiguration } from '../../context';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup';
import {
  getUserListings,
  getUsersAllReviews,
  otherUserDisplayNameSelector,
  showUser,
  showUserDetailsSelector,
} from './OtherUserProfile.slice';
import { Avatar, ScreenHeader } from '../../components';
import { fontScale, heightScale, widthScale } from '../../util';
import { colors, fontWeight } from '../../theme';
import OtherUserprofileBottomContent from './components/OtherUserprofileBottomContent';
import { ReviewTypeAndState } from '../../appTypes';

const getTabsData = t => {
  return [
    {
      key: t('OtherUserProfilePage.productTabTitle'),
      label: t('OtherUserProfilePage.productTabTitle'),
    },
    {
      key: t('OtherUserProfilePage.reviewTabTitle'),
      label: t('OtherUserProfilePage.reviewTabTitle'),
    },
  ];
};

export const OtherUserProfile = props => {
  const { userId } = props.route.params;
  const config = useConfiguration();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const tabsData = getTabsData(t);
  const [selectedTab, setSelectedTab] = React.useState(tabsData[0].label);
  const userData = useTypedSelector(showUserDetailsSelector);
  const displayName = useTypedSelector(otherUserDisplayNameSelector);

  React.useEffect(() => {
    dispatch(showUser({ userId, config }));
    dispatch(
      getUsersAllReviews({
        userId,
        type: ReviewTypeAndState.REVIEW_TYPE_OF_PROVIDER,
      }),
    );
    dispatch(getUserListings({ userId: userId, config, page: 1 }));
  }, []);

  return (
    <View style={styles.flex1}>
      <ScreenHeader
        backgroundColor={{ backgroundColor: colors.marketplaceColor }}
        leftIconStyle={{ tintColor: colors.white }}
      />
      <View style={styles.avatar}>
        <Avatar size={widthScale(110)} user={userData} />
      </View>
      <View style={styles.headerSection}>
        <Text style={styles.title}>{displayName}</Text>
        {/* <View style={styles.divider} /> */}
      </View>
      <OtherUserprofileBottomContent
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        tabsData={tabsData}
        userId={userId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerSection: {
    paddingHorizontal: widthScale(20),
  },
  title: {
    fontWeight: fontWeight.semiBold,
    color: colors.black,
    fontSize: fontScale(18),
    lineHeight: fontScale(24),
    textAlign: 'center',
  },
  emailSection: {
    justifyContent: 'center',
    flexDirection: 'row',
    gap: widthScale(10),
    paddingVertical: widthScale(5),
    paddingHorizontal: widthScale(20),
  },
  email: {
    fontWeight: fontWeight.normal,
    color: colors.darkGrey,
    fontSize: fontScale(16),
    textAlign: 'center',
  },
  mailIcon: {
    height: widthScale(18),
    width: widthScale(18),
    tintColor: colors.darkGrey,
  },
  avatar: {
    alignSelf: 'center',
    height: widthScale(120),
    width: widthScale(120),
    backgroundColor: colors.white,
    borderRadius: widthScale(100),
    marginTop: widthScale(-55),
    alignItems: 'center',
    justifyContent: 'center',
  },
  paragraph: {
    textAlign: 'center',
    fontSize: fontScale(14),
    lineHeight: heightScale(18),
    color: colors.darkGrey,
  },
  rightIconContainerStyle: {
    alignItems: 'center',
    paddingRight: 0,
    backgroundColor: 'red',
  },
  settingIcon: {
    tintColor: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGrey,
    marginVertical: widthScale(8),
  },
});
