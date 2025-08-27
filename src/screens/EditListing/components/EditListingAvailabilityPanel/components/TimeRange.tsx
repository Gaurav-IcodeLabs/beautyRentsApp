import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {
  DATE_TYPE_DATE,
  DATE_TYPE_DATETIME,
  DATE_TYPE_TIME,
  formatDateIntoPartials,
  isSameDay,
} from '../../../../../util'

const TimeRange = props => {
  const { startDate, endDate, dateType, timeZone } = props

  const start = formatDateIntoPartials(startDate, { timeZone })
  const end = formatDateIntoPartials(endDate, { timeZone })
  const isSingleDay = isSameDay(startDate, endDate, timeZone)

  if (isSingleDay && dateType === DATE_TYPE_DATE) {
    return <Text>{`${start.date}`}</Text>
  } else if (dateType === DATE_TYPE_DATE) {
    const range =
      formatted.length > BREAK_WORD_MIN_LENGTH ? (
        formatted.split(DASH).map((rangePartial, i) => (
          <Text key={`datespan${i}`}>
            {rangePartial}
            {i == 0 ? DASH : null}
          </Text>
        ))
      ) : (
        <Text>{formatted}</Text>
      )
    return <>{range}</>
  } else if (isSingleDay && dateType === DATE_TYPE_TIME) {
    return (
      <View>
        <Text>{`${start.time} - ${end.time}`}</Text>
      </View>
    )
  } else if (dateType === DATE_TYPE_TIME) {
    return (
      <View>
        <Text>{`${start?.time} - ${end?.time}`}</Text>
      </View>
    )
  } else if (isSingleDay && dateType === DATE_TYPE_DATETIME) {
    return (
      <View>
        <Text>{`${start.date}, ${start.time} - ${end.time}`}</Text>
      </View>
    )
  } else {
    return (
      <View>
        <Text>{`${start.dateAndTime} - ${end.dateAndTime}`}</Text>
      </View>
    )
  }
}

export default TimeRange

const styles = StyleSheet.create({})
