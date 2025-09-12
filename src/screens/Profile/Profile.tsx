import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Image, StyleSheet, Text, View} from 'react-native';
import {ProfileScreenProps} from '../../appTypes';
import {mailIcon, setting} from '../../assets';
import {Avatar, ScreenHeader} from '../../components';
import {useConfiguration} from '../../context';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {
  currentUserBioSelector,
  currentUserDisplayNameSelector,
  currentUserEmailSelector,
} from '../../slices/user.slice';
import {fontScale, heightScale, widthScale} from '../../util';
import ProfileBottomContent from './components/ProfileBottomContent';
import {getAllReviews, getOwnListings} from './Profile.slice';
import {colors, fontWeight} from '../../theme';
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

export const Profile: React.FC<ProfileScreenProps> = ({navigation}) => {
  const config = useConfiguration();
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const tabsData = getTabsData(t);
  const [selectedTab, setSelectedTab] = React.useState(tabsData[0].label);
  const bio = useTypedSelector(currentUserBioSelector);
  const displayName = useTypedSelector(currentUserDisplayNameSelector);
  const email = useTypedSelector(currentUserEmailSelector);

  useEffect(() => {
    dispatch(getAllReviews({}));
    dispatch(getOwnListings({config, page: 1}));
  }, [dispatch, config]);

  return (
    <View style={styles.flex1}>
      <ScreenHeader
        backgroundColor={{backgroundColor: colors.marketplaceColor}}
        rightIconContainerStyle={styles.rightIconContainerStyle}
        rightIcon={setting}
        rightIconStyle={styles.settingIcon}
        hideLeftIcon
        onRightIconPress={() => navigation.navigate('Settings')}
      />
      <View style={styles.avatar}>
        <Avatar
          size={widthScale(110)}
          // style={[!bio && {marginBottom: heightScale(20)}]}
        />
      </View>
      <View style={styles.headerSection}>
        <Text style={styles.title}>{displayName}</Text>
        <View style={styles.emailSection}>
          <Image style={styles.mailIcon} source={mailIcon} />
          <Text style={styles.email}>{email}</Text>
        </View>
        <View style={styles.divider} />
        {/* {!!bio && (
          <>
            <Paragraph
              color="black"
              textStyle={styles.paragraph}
              content={bio}
            />
            <View style={styles.divider} />
          </>
        )} */}
      </View>
      <ProfileBottomContent
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        tabsData={tabsData}
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
