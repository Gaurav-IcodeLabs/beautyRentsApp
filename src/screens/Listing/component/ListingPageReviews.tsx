import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { reviewsSelector } from '../Listing.slice'
import { RootState } from '../../../sharetribeSetup'
import { fontScale, widthScale } from '../../../util'
import { colors, fontWeight } from '../../../theme'
import { ReviewsCard } from '../../../components'

interface ListingPageReviewsProps {
  listingId: string
}

export default function ListingPageReviews(props: ListingPageReviewsProps) {
  const { listingId } = props
  const { t } = useTranslation()
  const reviews = useSelector((state: RootState) =>
    reviewsSelector(state, listingId),
  )
  if (!reviews || reviews?.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {t('ListingPage.reviewsSectionTitle', {
          count: reviews?.length ?? '0',
        })}
      </Text>
      {reviews.map(item => (
        <ReviewsCard key={item.id.uuid} review={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: widthScale(20),
    paddingVertical: widthScale(10),
    borderBottomWidth: 1,
    borderColor: colors.frostedGrey,
  },
  heading: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.semiBold,
  },
});
