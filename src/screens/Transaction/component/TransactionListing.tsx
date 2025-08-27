import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { fontScale, screenWidth, widthScale } from '../../../util'
import { AppImage } from '../../../components'
import { useConfiguration } from '../../../context'
import { formatMoney } from '../../../util/currency'
import { fontWeight } from '../../../theme'

const TransactionListing = props => {
  const { t } = useTranslation()
  const aspectRatio = useConfiguration().layout.listingImage.aspectRatio
  const { listing } = props
  const { title, deleted, description, price } = listing?.attributes || {}

  const deletedListingTitle = t('TransactionPage.deletedListing')

  const listingTitle = deleted ? deletedListingTitle : title

  const imgUrl =
    listing?.images?.[0]?.attributes?.variants?.['listing-card']?.url ||
    listing?.images?.[0]?.attributes?.variants?.['listing-card-2x']?.url ||
    ''
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
        <Text style={styles.descriptionStyle}>{formatMoney(price)}</Text>
        <Text style={styles.titleStyle}>
          {t('TransactionListing.description')}
        </Text>
        <Text style={styles.descriptionStyle}>{description}</Text>
      </View>
    </View>
  )
}

export default TransactionListing

const styles = StyleSheet.create({
  container: {
    padding: widthScale(20),
  },
  titleStyle: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.semiBold,
    marginVertical: widthScale(3),
  },
  descriptionStyle: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.normal,
    marginVertical: widthScale(3),
  },
  contentStyle: {
    marginTop: widthScale(10),
  },
  imageStyle: {
    borderRadius: widthScale(10),
  },
})
