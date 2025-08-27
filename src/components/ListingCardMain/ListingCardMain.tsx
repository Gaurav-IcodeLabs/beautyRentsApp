import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Listing, ListingState } from '../../appTypes';
import { deleteIcon, threeDots } from '../../assets';
import { useColors, useConfiguration } from '../../context';
import {
  closeOwnListings,
  discardDraftListings,
  openOwnListings,
} from '../../screens/Profile/Profile.slice';
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup';
import { currentUserIdSelector } from '../../slices/user.slice';
import { AppColors, colors, fontWeight } from '../../theme';
import {
  commonShadow,
  fontScale,
  heightScale,
  screenWidth,
  widthScale,
} from '../../util';
import { AppImage } from '../AppImage/AppImage';
import { Button } from '../Button/Button';
import { UUID } from '../../appTypes/interfaces/common';
import { requestShowListing } from '../../screens/EditListing/EditListing.slice';
import { formatMoney } from '../../util/currency';

interface ListingCardMainProps {
  listing: Listing;
  isOwnListing?: boolean;
  fromProfile?: boolean;
}

export const ListingCardMain = (props: ListingCardMainProps) => {
  const dispatch = useAppDispatch();
  const config = useConfiguration();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors: AppColors = useColors();
  const [openView, setOpenView] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentUserId = useTypedSelector(currentUserIdSelector);
  const { attributes, author, images, id } = props?.listing || {};
  const { fromProfile = false } = props || {};
  // const { amount = 0, currency } = attributes?.price || {}
  const { state, price } = attributes;
  const aspectRatio = useConfiguration().layout.listingImage.aspectRatio;
  const authorDisplayName = author?.attributes?.profile?.displayName;
  const listingTitle = attributes?.title;
  const imgUrl = images?.[0]?.attributes?.variants?.['listing-card']?.url ?? '';
  const authorId = author?.id?.uuid;
  const isOwnListing = currentUserId === authorId;

  const openListing = async (id: UUID) => {
    try {
      setLoading(true);
      const res = await dispatch(
        openOwnListings({
          id: id,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const closeListing = async (id: UUID) => {
    try {
      setLoading(true);
      const res = await dispatch(
        closeOwnListings({
          id: id,
        }),
      );
    } finally {
      setOpenView(false);
      setLoading(false);
    }
  };

  const discardDraft = async (id: UUID) => {
    try {
      setLoading(true);
      const res = await dispatch(
        discardDraftListings({
          id: id,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOnPress = async () => {
    navigation.navigate('Listing', { id: id.uuid });
    if (state !== ListingState.LISTING_STATE_PUBLISHED) return;
  };

  const handleFinishListing = async () => {
    navigation.navigate('EditListing', { listingId: id });
  };

  return (
    <Pressable onPress={handleOnPress} style={styles.container}>
      <View style={{ backgroundColor: colors.frostedGrey }}>
        {fromProfile &&
        isOwnListing &&
        state === ListingState.LISTING_STATE_CLOSED ? (
          <View style={styles.overlayContainer}>
            <Text style={styles.overlayHeading}>
              {t('ManageListingCard.closedListing')}
            </Text>
            <Button
              text={t('ManageListingCard.openListing')}
              onPress={() => openListing(id)}
              style={[
                styles.finishListingBtn,
                { backgroundColor: colors.marketplaceColor },
              ]}
              textStyle={[styles.finishListingText, { color: colors.white }]}
              loading={loading}
              loaderColor={colors.white}
            />
          </View>
        ) : fromProfile &&
          isOwnListing &&
          state === ListingState.LISTING_STATE_DRAFT ? (
          <View style={styles.draftContainer}>
            <Text style={styles.draftHeading}>
              {t('ManageListingCard.draftOverlayText', {
                listingTitle: listingTitle,
              })}
            </Text>
            <Button
              text={t('ManageListingCard.finishListingDraft')}
              onPress={handleFinishListing}
              style={styles.finishListingBtn}
              textStyle={[
                styles.finishListingText,
                { color: colors.marketplaceColor },
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => discardDraft(id)}
              style={styles.deleteBtn}
            >
              {loading ? (
                <ActivityIndicator color={colors.error} />
              ) : (
                <Image
                  tintColor={colors.error}
                  contentFit="contain"
                  style={styles.settingThreeDots}
                  source={deleteIcon}
                />
              )}
            </TouchableOpacity>
          </View>
        ) : null}
        <AppImage
          width={screenWidth - widthScale(40)}
          source={{
            uri: imgUrl,
          }}
          aspectRatio={aspectRatio}
        />
        {fromProfile &&
          isOwnListing &&
          state === ListingState.LISTING_STATE_PUBLISHED && (
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.settingBtn}
              onPress={() => setOpenView(!openView)}
            >
              <Image
                tintColor={colors.marketplaceColor}
                style={styles.settingThreeDots}
                contentFit="contain"
                source={threeDots}
              />
            </TouchableOpacity>
          )}
        {openView && (
          <View style={styles.openViewContainerStyle}>
            <Button
              text={t('ManageListingCard.editListing')}
              textStyle={styles.closeListingText}
              onPress={handleFinishListing}
              style={styles.closeListingSection}
              loading={loading}
              loaderColor={colors.black}
            />
            <Button
              text={t('ManageListingCard.closeListing')}
              textStyle={styles.closeListingText}
              onPress={() => closeListing(id)}
              style={styles.closeListingSection}
              loading={loading}
              loaderColor={colors.black}
            />
          </View>
        )}
      </View>
      <View style={styles.botomContainer}>
        <View style={styles.bottomLeftcontainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
            {listingTitle}
          </Text>
          <Text style={styles.author}>{authorDisplayName}</Text>
        </View>
        <View>
          <Text style={styles.priceLabel}>{t('ListingCard.priceLabel')}</Text>
          <Text style={[styles.price, { color: colors.marketplaceColor }]}>
            {formatMoney(price)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: widthScale(12),
    overflow: 'hidden',
    backgroundColor: colors.white,
    ...commonShadow,
  },
  botomContainer: {
    padding: widthScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomLeftcontainer: {
    flexShrink: 1,
    marginRight: widthScale(20),
  },
  title: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.bold,
    color: colors.black,
  },
  author: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
    marginTop: widthScale(5),
  },
  priceLabel: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
    marginBottom: widthScale(5),
  },
  price: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.bold,
  },
  deleteBtn: {
    position: 'absolute',
    zIndex: 100,
    padding: widthScale(5),
    right: widthScale(10),
    top: widthScale(10),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingBtn: {
    position: 'absolute',
    right: widthScale(10),
    top: widthScale(10),
    zIndex: 100,
    backgroundColor: colors.white,
    borderRadius: widthScale(100),
    height: heightScale(30),
    width: widthScale(30),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...commonShadow,
  },
  settingThreeDots: {
    height: heightScale(16),
    width: widthScale(16),
  },
  closeListingSection: {
    backgroundColor: colors.white,
    height: heightScale(35),
    minWidth: widthScale(100),
    borderWidth: widthScale(0),
    overflow: 'hidden',
    ...commonShadow,
  },
  closeListingText: {
    fontSize: fontScale(13),
    color: colors.black,
    fontWeight: fontWeight.normal,
  },
  draftContainer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: widthScale(20),
    zIndex: 100,
  },
  draftHeading: {
    textAlign: 'center',
    fontSize: fontScale(14),
  },
  overlayHeading: {
    textAlign: 'center',
    fontSize: fontScale(14),
    color: colors.white,
  },
  finishListingBtn: {
    marginTop: widthScale(15),
    padding: widthScale(10),
    backgroundColor: colors.white,
    borderRadius: widthScale(10),
    borderWidth: widthScale(0),
    height: heightScale(35),
    minWidth: widthScale(100),
  },
  finishListingText: {
    fontSize: fontScale(12),
    fontWeight: fontWeight.normal,
  },
  overlayContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    padding: widthScale(20),
    zIndex: 100,
  },
  openViewContainerStyle: {
    position: 'absolute',
    alignItems: 'flex-end',
    borderRadius: widthScale(10),
    right: widthScale(10),
    top: widthScale(45),
    zIndex: 100,
    paddingHorizontal: widthScale(10),
    gap: widthScale(2),
  },
});
