import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { colors, fontWeight } from '../../theme'
import { commonShadow, fontScale, widthScale } from '../../util'
import { AppImage } from '../AppImage/AppImage'

interface ListingCardSmallProps {
  listing: any
  index: number
}

export const ListingCardSmall = (props: ListingCardSmallProps) => {
  const { listing, index } = props
  const navigation = useNavigation()
  const img =
    listing?.images?.[0]?.attributes?.variants?.['listing-card']?.url ?? ''
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.push('Listing', { id: listing?.id?.uuid })
      }}
      style={[styles.listing, { marginLeft: !index ? widthScale(20) : 0 }]}>
      {img ? (
        <AppImage
          width={widthScale(120)}
          source={{
            uri: img,
          }}
          style={styles.image}
        />
      ) : (
        <View style={styles.noImage} />
      )}
      <Text numberOfLines={1} style={styles.listingTitle}>
        {listing?.attributes?.title}jjiojojioj;jioj
      </Text>
      <Text style={styles.priceAndSeller}>
        {listing?.attributes?.price?.amount / 100}{' '}
        {listing?.attributes?.price?.currency}
      </Text>
      <Text numberOfLines={1} style={styles.priceAndSeller}>
        {listing?.author?.attributes?.profile?.displayName}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  listing: {
    width: widthScale(120),
    marginRight: widthScale(10),
    backgroundColor: colors.white,
    borderRadius: widthScale(12),
    paddingBottom: widthScale(10),
    marginVertical: widthScale(5),
    ...commonShadow,
  },
  listingTitle: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.semiBold,
    marginHorizontal: widthScale(8),
    marginTop: widthScale(8),
    flexShrink: 1,
  },
  priceAndSeller: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
    marginHorizontal: widthScale(8),
    marginTop: widthScale(5),
  },
  noImage: {
    width: widthScale(120),
    height: widthScale(120),
    borderTopLeftRadius: widthScale(12),
    borderTopRightRadius: widthScale(12),
    backgroundColor: colors.frostedGrey,
  },
  image: {
    borderTopLeftRadius: widthScale(12),
    borderTopRightRadius: widthScale(12),
  },
})
