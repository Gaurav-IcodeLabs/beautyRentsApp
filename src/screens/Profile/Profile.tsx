import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ProfileScreenProps } from '../../appTypes';
import { setting } from '../../assets';
import { Avatar, Paragraph, ScreenHeader } from '../../components';
import { useConfiguration } from '../../context';
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup';
import {
  currentUserBioSelector,
  currentUserDisplayNameSelector,
} from '../../slices/user.slice';
import { fontScale, heightScale, widthScale } from '../../util';
import ProfileBottomContent from './components/ProfileBottomContent';
import ProfileDetails from './components/ProfileDetails';
import {
  getAllReviews,
  getOwnListings,
  profileListingsPaginationSelector,
} from './Profile.slice';

const getTabsData = t => {
  return [
    {
      key: t('ProfilePage.productTabTitle'),
      label: t('ProfilePage.productTabTitle'),
    },
    {
      key: t('ProfilePage.reviewTabTitle'),
      label: t('ProfilePage.reviewTabTitle'),
    },
  ];
};

export const Profile: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const config = useConfiguration();
  const dispatch = useAppDispatch();

  const { t } = useTranslation();
  const tabsData = getTabsData(t);
  const [selectedTab, setSelectedTab] = React.useState(tabsData[0].label);
  const [refreshing, setRefreshing] = React.useState(false);
  const listingPagination = useTypedSelector(profileListingsPaginationSelector);
  const bio = useTypedSelector(currentUserBioSelector);
  const displayName = useTypedSelector(currentUserDisplayNameSelector);

  const handleOnEndReached = () => {
    if (tabsData[0].label === selectedTab) {
      if (
        listingPagination &&
        listingPagination.page &&
        listingPagination.totalPages >= listingPagination.page
      ) {
        dispatch(
          getOwnListings({ config: config, page: listingPagination.page + 1 }),
        );
      }
    } else {
    }
  };
  useEffect(() => {
    dispatch(getAllReviews({}));
    dispatch(getOwnListings({ config, page: 1 }));
  }, []);

  const handleOnRefresh = () => {
    if (tabsData[0].label === selectedTab) {
      dispatch(getOwnListings({ config, page: 1 }));
    } else {
      dispatch(getAllReviews({}));
    }
  };

  return (
    <BottomSheetModalProvider>
      <View style={styles.flex1}>
        <ScreenHeader
          rightIconContainerStyle={styles.rightIconContainerStyle}
          rightIcon={setting}
          hideLeftIcon
          title={displayName}
          onRightIconPress={() => navigation.navigate('Settings')}
        />

        <FlatList
          data={[1]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          onEndReached={handleOnEndReached}
          renderItem={() => {
            return (
              <>
                <Avatar
                  style={[
                    styles.avatar,
                    !bio && { marginBottom: heightScale(20) },
                  ]}
                />
                {!!bio && (
                  <Paragraph
                    color="black"
                    textStyle={styles.paragraph}
                    content={bio}
                  />
                )}
                <ProfileDetails />
                <ProfileBottomContent
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                  tabsData={tabsData}
                />
              </>
            );
          }}
          refreshing={refreshing}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleOnRefresh}
            />
          }
        />
      </View>
    </BottomSheetModalProvider>
  );
};
const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  container: {
    padding: widthScale(20),
  },
  avatar: {
    alignSelf: 'center',
  },
  paragraph: {
    textAlign: 'center',
    marginBottom: heightScale(10),
    fontSize: fontScale(14),
    lineHeight: heightScale(18),
  },
  rightIconContainerStyle: {
    alignItems: 'center',
    paddingRight: 0,
  },
});
