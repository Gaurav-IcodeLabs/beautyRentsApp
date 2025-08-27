import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { ListingScreenProps } from '../../appTypes'
import { ScreenHeader } from '../../components'
import OrderPanel from '../../components/OrderPanel/OrderPanel'
import { useConfiguration } from '../../context'
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup'
import {
  entitiesSelector,
  getListingsById,
} from '../../slices/marketplaceData.slice'
import {
  INQUIRY_PROCESS_NAME,
  resolveLatestProcessName,
} from '../../transactions'
import { types as sdkTypes, timestampToDate, widthScale } from '../../util'
import { setInitialValues } from '../Checkout/Checkout.slice'
import CustomListingFields from './component/CustomListingFields'
import ListingDetails from './component/ListingDetails'
import ListingImageCarousel from './component/ListingImageCarousel'
import ListingPageAuthor from './component/ListingPageAuthor'
import ListingPageMap from './component/ListingPageMap'
import ListingPageReviews from './component/ListingPageReviews'
import SimilarItems from './component/SimilarItems'
import {
  addPageToState,
  isListingPageCreatedSelector,
  loadListing,
} from './Listing.slice'
import InquiryModal from './modal/InquiryModal'

const { UUID } = sdkTypes

export const Listing: React.FC<ListingScreenProps> = props => {
  const navigation = useNavigation()
  const [isInquiryModalOpen, setInquiryModalOpen] = useState(false)
  const pageListingId = props.route.params?.id
  const dispatch = useAppDispatch()
  const config = useConfiguration()
  const isListingPageCreated = useTypedSelector(state =>
    isListingPageCreatedSelector(state, pageListingId || ''),
  )
  useMemo(() => {
    if (isListingPageCreated) return
    dispatch(addPageToState(pageListingId))
  }, [])
  const entities = useTypedSelector(entitiesSelector)
  const listing = getListingsById(entities, [new UUID(pageListingId)])?.[0]

  const {
    description = '',
    geolocation = null,
    price = null,
    title = '',
    publicData = {},
    metadata = {},
  } = listing?.attributes || {}

  useEffect(() => {
    dispatch(loadListing({ id: pageListingId, config }))
  }, [])

  const handleOrderSubmit = values => {
    const {
      bookingDates,
      bookingStartTime,
      bookingEndTime,
      bookingStartDate, // not relevant (omit)
      bookingEndDate, // not relevant (omit)
      quantity: quantityRaw,
      deliveryMethod,
      ...otherOrderData
    } = values || {}

    const bookingMaybe = bookingDates
      ? {
          bookingDates: {
            bookingStart: bookingDates.startDate,
            bookingEnd: bookingDates.endDate,
          },
        }
      : bookingStartTime && bookingEndTime
        ? {
            bookingDates: {
              bookingStart: timestampToDate(bookingStartTime),
              bookingEnd: timestampToDate(bookingEndTime),
            },
          }
        : {}

    const quantity = Number.parseInt(quantityRaw, 10)
    const quantityMaybe = Number.isInteger(quantity) ? { quantity } : {}
    const deliveryMethodMaybe = deliveryMethod ? { deliveryMethod } : {}
    const initialValues = {
      listing,
      orderData: {
        ...bookingMaybe,
        ...quantityMaybe,
        ...deliveryMethodMaybe,
        ...otherOrderData,
      },
      confirmPaymentError: null,
    }

    dispatch(setInitialValues(initialValues))
    navigation.navigate('Checkout')
  }

  const transactionProcessAlias =
    listing?.attributes?.publicData?.transactionProcessAlias || ''
  const processName = resolveLatestProcessName(
    transactionProcessAlias.split('/')[0],
  )
  const isInquiryProcess = processName === INQUIRY_PROCESS_NAME
  return (
    <>
      <ScreenHeader title={title} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ListingImageCarousel images={listing?.images} />
        <ListingPageAuthor
          author={listing?.author}
          showContact={!isInquiryProcess}
          setInquiryModalOpen={() => setInquiryModalOpen(true)}
        />
        <ListingDetails description={description} price={price} title={title} />
        <CustomListingFields publicData={publicData} metadata={metadata} />
        <ListingPageMap geolocation={geolocation} />
        <ListingPageReviews listingId={listing?.id?.uuid} />
        <SimilarItems listingId={pageListingId} />
        <View style={styles.botmView} />
      </ScrollView>
      <OrderPanel listing={listing} onSubmit={handleOrderSubmit} />
      <InquiryModal
        listing={listing}
        isInquiryModalOpen={isInquiryModalOpen}
        onCloseInquiryModal={() => setInquiryModalOpen(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  botmView: {
    paddingBottom: widthScale(100),
  },
})
