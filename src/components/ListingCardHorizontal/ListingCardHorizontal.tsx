import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Listing } from '../../appTypes'
import { AppImage } from '../AppImage/AppImage'
import { commonShadow, fontScale, screenWidth, widthScale } from '../../util'
import { AppColors, colors, fontWeight } from '../../theme'
import { useColors } from '../../context'
import { formatMoney } from '../../util/currency'
import { useNavigation } from '@react-navigation/native'

interface ListingCardHorizontalProps {
  listing: Listing
  index: number
}

export const ListingCardHorizontal = (props: ListingCardHorizontalProps) => {
  const { listing, index } = props
  const colors: AppColors = useColors()
  const navigation = useNavigation()
  const image = listing.images[0]?.attributes?.variants?.['listing-card']?.url
  const displayName = listing.author?.attributes?.profile?.displayName
  const { title, price } = listing?.attributes

  const handleOnPress = () => {
    navigation.navigate('Listing', { id: listing.id.uuid })
  }

  return (
    <TouchableOpacity
      onPress={handleOnPress}
      activeOpacity={0.8}
      style={[styles.container, !index && { marginLeft: widthScale(10) }]}>
      <AppImage
        source={{
          uri: image,
        }}
        width={widthScale(120)}
        height={widthScale(120)}
        style={styles.image}
      />
      <View style={styles.rightView}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.title}>
          {displayName}
        </Text>
        <Text style={[styles.price, { color: colors.marketplaceColor }]}>
          {formatMoney(price)}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: widthScale(10),
    backgroundColor: colors.white,
    marginRight: widthScale(10),
    borderRadius: widthScale(12),
    flexDirection: 'row',
    width: screenWidth * 0.8,
  },
  image: {
    borderRadius: widthScale(12),
    ...commonShadow,
  },
  rightView: {
    marginLeft: widthScale(10),
    flex: 1,
    paddingVertical: widthScale(5),
  },
  title: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.bold,
    color: colors.black,
    marginBottom: widthScale(5),
    flexShrink: 1,
  },
  price: {
    fontSize: fontScale(20),
    fontWeight: fontWeight.boldest,
  },
})
