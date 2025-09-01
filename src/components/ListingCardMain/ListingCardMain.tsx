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
import { deleteIcon, locationIcon, starFilled, threeDots } from '../../assets';
import { useConfiguration } from '../../context';
import {
  closeOwnListings,
  discardDraftListings,
  openOwnListings,
} from '../../screens/Profile/Profile.slice';
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup';
import { currentUserIdSelector } from '../../slices/user.slice';
import { colors, fontWeight } from '../../theme';
import { fontScale, heightScale, screenWidth, widthScale } from '../../util';
import { AppImage } from '../AppImage/AppImage';
import { Button } from '../Button/Button';
import { UUID } from '../../appTypes/interfaces/common';
import { formatMoney } from '../../util/currency';
import { lightenColor } from '../../util/data';

interface ListingCardMainProps {
  listing: Listing;
  isOwnListing?: boolean;
  fromProfile?: boolean;
}

export const ListingCardMain = (props: ListingCardMainProps) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [openView, setOpenView] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentUserId = useTypedSelector(currentUserIdSelector);
  const { attributes, author, images, id } = props?.listing || {};
  const { fromProfile = false } = props || {};
  const { state, price, publicData } = attributes;
  const {
    location,
    totalRatingSum = 0,
    totalRatings = 0,
    isFeatured = false,
  } = publicData;
  // console.log('publicData', JSON.stringify(publicData));
  const aspectRatio = useConfiguration().layout.listingImage.aspectRatio;
  const listingTitle = attributes?.title;
  const imgUrl = images?.[0]?.attributes?.variants?.['listing-card']?.url ?? '';
  const authorId = author?.id?.uuid;
  const isOwnListing = currentUserId === authorId;
  const averageRating =
    totalRatings > 0
      ? Math.round((totalRatingSum / totalRatings) * 10) / 10
      : 0;

  const openListing = async (ID: UUID) => {
    try {
      setLoading(true);
      const res = await dispatch(
        openOwnListings({
          id: ID,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const closeListing = async (ID: UUID) => {
    try {
      setLoading(true);
      const res = await dispatch(
        closeOwnListings({
          id: ID,
        }),
      );
    } finally {
      setOpenView(false);
      setLoading(false);
    }
  };

  const discardDraft = async (ID: UUID) => {
    try {
      setLoading(true);
      const res = await dispatch(
        discardDraftListings({
          id: ID,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOnPress = () => {
    if (state !== ListingState.LISTING_STATE_PUBLISHED) {
      return;
    }
    navigation.navigate('Listing', { id: id.uuid });
  };

  const handleFinishListing = async () => {
    navigation.navigate('EditListing', { listingId: id });
  };

  const showButtons = fromProfile && isOwnListing;

  return (
    <Pressable onPress={handleOnPress} style={styles.container}>
      <View style={{ backgroundColor: colors.lightGrey }}>
        {showButtons && state === ListingState.LISTING_STATE_CLOSED ? (
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
        ) : showButtons && state === ListingState.LISTING_STATE_DRAFT ? (
          <View style={styles.overlayContainer}>
            <Text style={styles.draftHeading}>
              {t('ManageListingCard.draftOverlayText', {
                listingTitle: listingTitle,
              })}
            </Text>
            <Button
              text={t('ManageListingCard.finishListingDraft')}
              onPress={handleFinishListing}
              style={styles.finishListingBtn}
              textStyle={styles.finishListingText}
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
                  style={styles.settingThreeDots}
                  source={deleteIcon}
                />
              )}
            </TouchableOpacity>
          </View>
        ) : showButtons &&
          state === ListingState.LISTING_STATE_PENDING_APPROVAL ? (
          <View style={styles.overlayContainer}>
            <Text style={styles.pendingApprovalText}>
              {t('ManageListingCard.pendingApproval', { listingTitle })}
            </Text>
          </View>
        ) : null}
        <AppImage
          width={screenWidth - widthScale(40)}
          source={{
            uri: imgUrl,
          }}
          aspectRatio={aspectRatio}
        />
        {isFeatured ? (
          <View style={styles.featured}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        ) : null}
        {fromProfile &&
          isOwnListing &&
          state === ListingState.LISTING_STATE_PUBLISHED && (
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.settingBtn}
              onPress={() => setOpenView(!openView)}
            >
              <Image
                tintColor={colors.white}
                style={styles.settingThreeDots}
                source={threeDots}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        {openView ? (
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
        ) : null}
      </View>
      <View style={styles.botomContainer}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
          {listingTitle}
        </Text>

        <View style={styles.locationSection}>
          <Image style={styles.locIcon} source={locationIcon} />
          <Text numberOfLines={2} style={styles.location}>
            {location?.address}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.bottomSection}>
          <View style={styles.priceSection}>
            <Text numberOfLines={1} style={styles.price}>
              {formatMoney(price, 2)}
            </Text>
          </View>
          <View style={styles.reviewsSection}>
            <Image
              source={starFilled}
              tintColor={colors.marketplaceColor}
              style={styles.starIcon}
            />
            <Text style={styles.rating}>
              {averageRating}/5{' '}
              <Text style={[styles.rating, { color: colors.grey }]}>
                ({totalRatings})
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: widthScale(12),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  botomContainer: {
    padding: widthScale(16),
  },
  title: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.semiBold,
    color: colors.black,
  },
  location: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    color: colors.grey,
  },
  price: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.bold,
    color: colors.marketplaceColor,
  },
  deleteBtn: {
    position: 'absolute',
    zIndex: 100,
    padding: widthScale(10),
    right: widthScale(10),
    top: widthScale(10),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightenColor(colors.marketplaceColor, 0),
    borderRadius: widthScale(12),
  },
  settingBtn: {
    position: 'absolute',
    right: widthScale(10),
    top: widthScale(10),
    zIndex: 100,
    backgroundColor: colors.marketplaceColor,
    borderRadius: widthScale(8),
    paddingVertical: widthScale(8),
    paddingHorizontal: widthScale(5),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingThreeDots: {
    height: heightScale(20),
    width: widthScale(20),
  },
  closeListingSection: {
    backgroundColor: colors.white,
    height: heightScale(35),
    minWidth: widthScale(100),
    borderWidth: widthScale(0),
    overflow: 'hidden',
  },
  closeListingText: {
    fontSize: fontScale(13),
    color: colors.black,
    fontWeight: fontWeight.normal,
  },
  draftHeading: {
    textAlign: 'center',
    fontSize: fontScale(16),
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  overlayHeading: {
    textAlign: 'center',
    fontSize: fontScale(14),
    color: colors.white,
  },
  pendingApprovalText: {
    textAlign: 'center',
    fontSize: fontScale(16),
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  finishListingBtn: {
    marginTop: widthScale(15),
    backgroundColor: colors.marketplaceColor,
    borderRadius: widthScale(10),
    height: heightScale(40),
    paddingHorizontal: widthScale(12),
  },
  finishListingText: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  overlayContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
  locationSection: {
    marginTop: widthScale(10),
    flexDirection: 'row',
    gap: widthScale(5),
  },
  locIcon: {
    height: widthScale(14),
    width: widthScale(14),
    marginTop: widthScale(1),
    tintColor: colors.grey,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGrey,
    marginVertical: widthScale(12),
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: widthScale(5),
  },
  priceSection: {
    flexShrink: 1,
    paddingRight: widthScale(10),
  },
  reviewsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: widthScale(10),
    marginRight: widthScale(10),
  },
  starIcon: {
    height: widthScale(16),
    width: widthScale(16),
  },
  rating: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.normal,
    color: colors.black,
  },
  featured: {
    margin: widthScale(10),
    backgroundColor: colors.marketplaceColor,
    position: 'absolute',
    alignItems: 'flex-start',
    borderRadius: widthScale(10),
    paddingVertical: widthScale(8),
    paddingHorizontal: widthScale(12),
  },
  featuredText: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
});
