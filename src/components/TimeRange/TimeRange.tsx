import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {
  DATE_TYPE_DATE,
  DATE_TYPE_DATETIME,
  DATE_TYPE_TIME,
  formatDateIntoPartials,
  isSameDay,
  widthScale,
} from '../../util'
import dayjs from 'dayjs'
import { colors } from '../../theme'

// Sometimes we want to break string created by intl.formatDateTimeRange into
// shorter substrings. Intl uses special dash to separate date-time range.
const DASH = '–'
const BREAK_WORD_MIN_LENGTH = 27

export const TimeRange = props => {
  const { startDate, endDate, dateType, timeZone } = props
  const start = formatDateIntoPartials(startDate, { timeZone })
  const end = formatDateIntoPartials(endDate, { timeZone })
  const isSingleDay = isSameDay(startDate, endDate, timeZone)

  const formatStartDay = dayjs(startDate).format('DD MMM')
  const formatEndtDay = dayjs(endDate).format('DD MMM')

  const dateFormatting = { month: 'short', day: 'numeric', timeZone }

  if (isSingleDay && dateType === DATE_TYPE_DATE) {
    return (
      <View style={styles.container}>
        <Text>{formatStartDay}</Text>
      </View>
    )
  } else if (dateType === DATE_TYPE_DATE) {
    const formatted = `${formatStartDay} - ${formatEndtDay}`
    const range =
      formatted.length > BREAK_WORD_MIN_LENGTH ? (
        formatted.split(DASH).map((rangePartial, i) => (
          <Text key={`datespan${i}`}>
            {rangePartial}
            {i === 0 ? DASH : null}
          </Text>
        ))
      ) : (
        <Text>{formatted}</Text>
      )
    return <View style={styles.container}>{range}</View>
  } else if (isSingleDay && dateType === DATE_TYPE_TIME) {
    return (
      <View style={styles.container}>
        <Text
          style={styles.timeRangeStyle}>{`${start?.time} - ${end?.time}`}</Text>
      </View>
    )
  } else if (dateType === DATE_TYPE_TIME) {
    const formatted = `${start?.time} - ${end?.time}`
    const range =
      formatted.length > BREAK_WORD_MIN_LENGTH ? (
        formatted.split(DASH).map((rangePartial, i) => (
          <Text key={`datespan${i}`}>
            {rangePartial}
            {i === 0 ? ` ${DASH} ` : null}
          </Text>
        ))
      ) : (
        <Text>{formatted}</Text>
      )
    return (
      <View style={styles.container}>
        <Text
          style={styles.timeRangeStyle}>{`${start?.time} - ${end?.time}`}</Text>
      </View>
    )
  } else if (isSingleDay && dateType === DATE_TYPE_DATETIME) {
    return (
      <View>
        <Text>{`${start?.date}, ${start?.time} - ${end?.time}`}</Text>
      </View>
    )
  } else {
    return (
      <View>
        <Text>{`${start?.dateAndTime} - ${end?.dateAndTime}`}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: widthScale(2),
    alignItems: 'center',
    alignContent: 'center',
  },

  timeRangeStyle: {
    color: colors.black,
    marginTop: widthScale(0),
    marginStart: widthScale(9),
  },
})
