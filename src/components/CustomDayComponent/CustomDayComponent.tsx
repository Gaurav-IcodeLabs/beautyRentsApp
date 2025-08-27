import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { widthScale } from '../../util'
import { AppColors, colors } from '../../theme'
import { useColors } from '../../context'

function isBetweenDates(day, startDate, endDate) {
  // Convert strings to Date objects if necessary
  const dayDate = new Date(day)
  const startDateObj = new Date(startDate)
  const endDateObj = new Date(endDate)

  // Compare dates
  return dayDate > startDateObj && dayDate < endDateObj
}

const CustomDayComponent = props => {
  const { isSelected, isDayBlock, onDayPress, date, startDate, endDate } = props
  const isBetweenRange = isBetweenDates(date.dateString, startDate, endDate)
  const isSingleDay = startDate === endDate
  const colors: AppColors = useColors()
  return isDayBlock(date.dateString) ? (
    <TouchableOpacity disabled style={{ padding: 10 }}>
      <Text style={styles.unavailableDay}>{date.day}</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      onPress={() => onDayPress(date)}
      style={[
        styles.dateContainer,
        startDate === date.dateString
          ? {
              backgroundColor: colors.marketplaceColor,

              ...(isSingleDay ? styles.singleDayStyle : styles.startDateStyle),
            }
          : endDate === date.dateString
            ? {
                backgroundColor: colors.marketplaceColor,

                ...(isSingleDay ? styles.singleDayStyle : styles.endDateStyle),
              }
            : isBetweenRange
              ? {
                  backgroundColor: colors.marketplaceColor,
                  ...(isSingleDay
                    ? styles.singleDayStyle
                    : styles.isBetweenRangeStyle),
                }
              : null,
      ]}>
      <Text
        style={
          isSelected || isBetweenRange ? styles.selectedDate : styles.date
        }>
        {date.day}
      </Text>
    </TouchableOpacity>
  )
}

export default CustomDayComponent

const styles = StyleSheet.create({
  dateContainer: {
    // padding: widthScale(10),
    width: widthScale(40),
    height: widthScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: widthScale(100),
  },
  startDateStyle: {
    width: widthScale(60),
    height: widthScale(40),
    borderTopRightRadius: widthScale(10),
    borderBottomRightRadius: widthScale(10),
  },
  endDateStyle: {
    width: widthScale(60),
    height: widthScale(40),
    borderTopLeftRadius: widthScale(10),
    borderBottomLeftRadius: widthScale(10),
  },
  isBetweenRangeStyle: {
    width: widthScale(70),
    height: widthScale(40),
    borderRadius: 0,
  },
  unavailableDay: {
    color: colors.grey,
  },
  singleDayStyle: {
    borderRadius: widthScale(100),
  },
  selectedDate: {
    color: colors.white,
  },
  date: {
    // color: colors.black,
  },
})
