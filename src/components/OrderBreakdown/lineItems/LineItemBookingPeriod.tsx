import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {
  DATE_TYPE_DATE,
  LINE_ITEM_HOUR,
  LINE_ITEM_NIGHT,
  subtractTime,
  widthScale,
} from '../../../util'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { colors } from '../../../theme'

const BookingPeriod = props => {
  const { t } = useTranslation()
  const { startDate, endDate, dateType, timeZone } = props
  const timeZoneMaybe = timeZone ? { timeZone } : null

  const timeFormatOptions =
    dateType === DATE_TYPE_DATE
      ? {
          weekday: 'long',
        }
      : {
          weekday: 'short',
          hour: 'numeric',
          minute: 'numeric',
        }

  const dateFormatOptions = {
    month: 'short',
    day: 'numeric',
  }
  const formattedStartString = dayjs(startDate).format('DD MMM')

  const formattedEndString = dayjs(endDate).format('DD MMM')
  return (
    <View style={styles.bookingContainer}>
      <View>
        <Text>{t('OrderBreakdown.bookingStart')}</Text>
        <Text>{formattedStartString}</Text>
      </View>
      <View>
        <Text>{t('OrderBreakdown.bookingEnd')}</Text>
        <Text>{formattedEndString}</Text>
      </View>
    </View>
  )
}

const LineItemBookingPeriod = props => {
  const { booking, code, dateType, timeZone } = props

  if (!booking) {
    return null
  }
  // Attributes: displayStart and displayEnd can be used to differentiate shown time range
  // from actual start and end times used for availability reservation. It can help in situations
  // where there are preparation time needed between bookings.
  // Read more: https://www.sharetribe.com/api-reference/marketplace.html#bookings
  const { start, end, displayStart, displayEnd } = booking.attributes
  const localStartDate = displayStart || start
  const localEndDateRaw = displayEnd || end

  const isNightly = code === LINE_ITEM_NIGHT
  const isHour = code === LINE_ITEM_HOUR
  const endDay =
    isNightly || isHour
      ? localEndDateRaw
      : subtractTime(localEndDateRaw, 1, 'days')
  return (
    <>
      <BookingPeriod
        startDate={localStartDate}
        endDate={endDay}
        dateType={dateType}
        timeZone={timeZone}
      />
      <View style={styles.itemSeperatorStyle} />
    </>
  )
}

export default LineItemBookingPeriod

const styles = StyleSheet.create({
  bookingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemSeperatorStyle: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.grey,
    marginVertical: widthScale(6),
  },
})
