import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../../../theme'
import { DATE_TYPE_DATE, DATE_TYPE_TIME, fontScale } from '../../../../../util'
import TimeRange from './TimeRange'
import {
  getEndTimeAsDate,
  parseLocalizedTime,
} from '../EditListingAvailabilityPanel.helper'

const PlanEntry = props => {
  const { t } = useTranslation()
  const { date, entry, timeZone, isDaily, useFullDays } = props

  const isAvailable = entry.seats > 0
  const availabilityInfo = isAvailable
    ? t('EditListingAvailabilityPanel.WeeklyCalendar.available')
    : t('EditListingAvailabilityPanel.WeeklyCalendar.notAvailable')

  return (
    <View>
      {useFullDays ? (
        <Text style={styles.availabilityText}>{availabilityInfo}</Text>
      ) : (
        <TimeRange
          startDate={parseLocalizedTime(date, entry.startTime, timeZone)}
          endDate={getEndTimeAsDate(date, entry.endTime, isDaily, timeZone)}
          dateType={useFullDays ? DATE_TYPE_DATE : DATE_TYPE_TIME}
          timeZone={timeZone}
        />
      )}
    </View>
  )
}

export default PlanEntry

const styles = StyleSheet.create({
  availabilityText: {
    fontSize: fontScale(14),
    lineHeight: fontScale(21),
    color: colors.darkGrey,
  },
})
