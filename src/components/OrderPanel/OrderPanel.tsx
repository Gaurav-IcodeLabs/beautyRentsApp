import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ListingState } from '../../appTypes'
import {
  INQUIRY_PROCESS_NAME,
  isBookingProcess,
  resolveLatestProcessName,
} from '../../transactions'
import {
  commonShadow,
  LINE_ITEM_DAY,
  LINE_ITEM_NIGHT,
  widthScale,
} from '../../util'
import BookingDatesForm from './orderForms/BookingDatesForm'
import InquiryWithoutPaymentForm from './orderForms/InquiryWithoutPaymentForm'
import { colors } from '../../theme'

const OrderPanel = props => {
  const { listing, lineItemUnitType: lineItemUnitTypeMaybe, onSubmit } = props
  const { publicData, price, state, availabilityPlan } =
    listing?.attributes || {}
  const {
    listingType,
    unitType,
    transactionProcessAlias = '',
  } = publicData || {}

  const timeZone = availabilityPlan?.timezone
  const isClosed = state === ListingState.LISTING_STATE_CLOSED
  const processName = resolveLatestProcessName(
    transactionProcessAlias.split('/')[0],
  )
  const isBooking = isBookingProcess(processName)
  const lineItemUnitType = lineItemUnitTypeMaybe || `line-item/${unitType}`
  const isPaymentProcess = processName !== INQUIRY_PROCESS_NAME

  const shouldHaveBookingDates =
    isBooking && [LINE_ITEM_DAY, LINE_ITEM_NIGHT].includes(lineItemUnitType)
  const showBookingDatesForm = shouldHaveBookingDates && !isClosed && timeZone
  const showInquiryForm = processName === INQUIRY_PROCESS_NAME

  return (
    <View style={styles.container}>
      {showInquiryForm ? (
        <InquiryWithoutPaymentForm onSubmit={onSubmit} />
      ) : showBookingDatesForm ? (
        <BookingDatesForm
          lineItemUnitType={lineItemUnitType}
          onSubmit={onSubmit}
          price={price}
          timeZone={timeZone}
          listingId={listing.id}
        />
      ) : null}
    </View>
  )
}

export default OrderPanel

const styles = StyleSheet.create({
  container: {
    padding: widthScale(20),
    ...commonShadow,
    backgroundColor: colors.white,
  },
})
