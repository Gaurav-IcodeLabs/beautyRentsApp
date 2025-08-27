import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { getProcess, resolveLatestProcessName } from '../../../transactions'
import {
  DATE_TYPE_DATE,
  DATE_TYPE_DATETIME,
  LINE_ITEM_HOUR,
  LINE_ITEM_NIGHT,
  LISTING_UNIT_TYPES,
  subtractTime,
  widthScale,
} from '../../../util'
import { TimeRange } from '../../../components'

// Booking data (start & end) are bit different depending on display times and
// if "end" refers to last day booked or the first exclusive day
const bookingData = (tx, lineItemUnitType, timeZone) => {
  // Attributes: displayStart and displayEnd can be used to differentiate shown time range
  // from actual start and end times used for availability reservation. It can help in situations
  // where there are preparation time needed between bookings.
  // Read more: https://www.sharetribe.com/api-reference/marketplace.html#bookings
  const { start, end, displayStart, displayEnd } = tx.booking.attributes
  const bookingStart = displayStart || start
  const bookingEndRaw = displayEnd || end

  // When unit type is night, we can assume booking end to be inclusive.
  const isNight = lineItemUnitType === LINE_ITEM_NIGHT
  const isHour = lineItemUnitType === LINE_ITEM_HOUR
  const bookingEnd =
    isNight || isHour
      ? bookingEndRaw
      : subtractTime(bookingEndRaw, 1, 'days', timeZone)

  return { bookingStart, bookingEnd }
}

const BookingTimeInfoMaybe = props => {
  const { transaction, ...rest } = props
  const processName = resolveLatestProcessName(
    transaction?.attributes?.processName,
  )
  const process = getProcess(processName)
  const isInquiry = process.getState(transaction) === process.states.INQUIRY
  if (isInquiry) {
    return null
  }

  const hasLineItems = transaction?.attributes?.lineItems?.length > 0
  const unitLineItem = hasLineItems
    ? transaction.attributes?.lineItems?.find(
        item => LISTING_UNIT_TYPES.includes(item.code) && !item.reversal,
      )
    : null

  const lineItemUnitType = unitLineItem ? unitLineItem.code : null
  const dateType =
    lineItemUnitType === LINE_ITEM_HOUR ? DATE_TYPE_DATETIME : DATE_TYPE_DATE

  const timeZone =
    transaction?.listing?.attributes?.availabilityPlan?.timezone || 'Etc/UTC'

  const { bookingStart, bookingEnd } = bookingData(
    transaction,
    lineItemUnitType,
    timeZone,
  )
  return (
    <View style={styles.time}>
    <TimeRange
      startDate={bookingStart}
      endDate={bookingEnd}
      dateType={dateType}
      timeZone={timeZone}
    />
    </View>
  )
}

export default BookingTimeInfoMaybe

const styles = StyleSheet.create({
  time:{
    marginLeft: widthScale(10),
  }
})
