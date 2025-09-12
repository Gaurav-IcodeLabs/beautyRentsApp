import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {fontScale, screenWidth, types, widthScale} from '../../../util';
import {AppImage} from '../../../components';
import {useConfiguration} from '../../../context';
import {formatMoney} from '../../../util/currency';
import {colors, fontWeight} from '../../../theme';
import {Listing} from '../../../appTypes';

const TransactionListing: React.FC<{
  listing: Listing | null;
  marketplaceCurrency: string;
}> = props => {
  const {t} = useTranslation();
  const aspectRatio = useConfiguration().layout.listingImage.aspectRatio as any;
  const {listing, marketplaceCurrency} = props;
  const {title, deleted, description, price, publicData} =
    listing?.attributes || {};
  const {price_per_day = null} = publicData || {};
  const pricePerDay =
    price_per_day && new types.Money(price_per_day * 100, marketplaceCurrency);

  const deletedListingTitle = t('TransactionPage.deletedListing');

  const listingTitle = deleted ? deletedListingTitle : title;

  const imgUrl =
    listing?.images?.[0]?.attributes?.variants?.['listing-card']?.url ||
    listing?.images?.[0]?.attributes?.variants?.['listing-card-2x']?.url ||
    '';

  return (
    <View style={styles.container}>
      <AppImage
        width={screenWidth - widthScale(40)}
        source={{
          uri: imgUrl,
        }}
        aspectRatio={aspectRatio}
        style={styles.imageStyle}
      />
      <View style={styles.contentStyle}>
        <Text style={styles.titleStyle}>{listingTitle}</Text>
        {price ? (
          <Text style={styles.descriptionStyle}>{formatMoney(price, 2)}</Text>
        ) : null}
        {pricePerDay ? (
          <Text style={styles.descriptionStyle}>
            {'Price per day ' + formatMoney(pricePerDay, 2)}
          </Text>
        ) : null}
        <Text style={styles.titleStyle}>
          {t('TransactionListing.description')}
        </Text>
        <Text style={styles.descriptionStyle}>{description}</Text>
      </View>
    </View>
  );
};

export default TransactionListing;

const styles = StyleSheet.create({
  container: {
    // padding: widthScale(20),
    paddingVertical: widthScale(20),
  },
  titleStyle: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.semiBold,
    lineHeight: widthScale(25),
    // marginVertical: widthScale(3),
    marginTop: widthScale(10),
  },
  descriptionStyle: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    lineHeight: widthScale(22),
    marginVertical: widthScale(3),
    color: colors.darkGrey,
  },
  contentStyle: {
    marginTop: widthScale(10),
  },
  imageStyle: {
    borderRadius: widthScale(10),
  },
});
