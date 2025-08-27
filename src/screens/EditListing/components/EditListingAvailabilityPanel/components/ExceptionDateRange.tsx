import React, { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, StyleSheet, View } from 'react-native'
import { Calendar, RenderTextInputField } from '../../../../../components'
import { useTypedSelector } from '../../../../../sharetribeSetup'
import {
  exceptionFreeSlotsPerDate,
  getStartOf,
  heightScale,
  stringifyDateToISO8601,
  timeOfDayFromLocalToTimeZone,
} from '../../../../../util'
import {
  allExceptionsSelector,
  monthlyExceptionQueriesSelector,
} from '../../../EditListing.slice'
import { getMonthlyFetchRange } from '../EditListingAvailabilityPanel.helper'
import CustomDayComponent from '../../../../../components/CustomDayComponent/CustomDayComponent'
import { markedRange } from '../../../../../components/OrderPanel/OrderPanel.helper'
import moment from 'moment'

const TODAY = new Date()

// Date formatting used for placeholder texts:
const dateFormattingOptions = {
  month: 'short',
  day: 'numeric',
  weekday: 'short',
}

const ExceptionDateRange = props => {
  const { t } = useTranslation()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const { listingId, timeZone, isDaily, control, onSumbit } = props
  const allExceptions = useTypedSelector(allExceptionsSelector)
  const monthlyExceptionQueries = useTypedSelector(
    monthlyExceptionQueriesSelector,
  )
  const [focusedInput, setFocusedInput] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(
    getStartOf(TODAY, 'month', timeZone),
  )
  const [startMonth, endMonth] = getMonthlyFetchRange(
    monthlyExceptionQueries,
    timeZone,
  )
  const availableDates = exceptionFreeSlotsPerDate(
    startMonth,
    endMonth,
    allExceptions,
    timeZone,
  )

  const [selectedStartDate, setSelectedStartDate] = useState(null)
  const [selectedEndDate, setSelectedEndDate] = useState(null)
  const formattedDate = new Intl.DateTimeFormat(
    'en-US',
    dateFormattingOptions,
  ).format(TODAY)
  const handleStartDate = () => {
    setIsCalendarOpen(true)
  }

  const markedDates = {
    [selectedStartDate]: { selected: true, disableTouchEvent: true },
    [selectedEndDate]: { selected: true, disableTouchEvent: true },
  }

  const isDayBlock = day => {
    const localizedDay = timeOfDayFromLocalToTimeZone(day, timeZone)
    const dayData =
      availableDates[stringifyDateToISO8601(localizedDay, timeZone)]
    const currentDate = moment().format('YYYY-MM-DD')
    return dayData == null
      ? true
      : dayData.slots?.length === 0 || day < currentDate
  }

  const customDayComponent = memo(({ date, state }) => {
    const isSelected = markedDates[date.dateString]?.selected ?? false
    return (
      <CustomDayComponent
        isSelected={isSelected}
        startDate={selectedStartDate}
        endDate={selectedEndDate}
        date={date}
        isDayBlock={isDayBlock}
        onDayPress={onDayPress}
      />
    )
  })

  const onDayPress = day => {
    const selectedDay = day.dateString

    // Check if both start and end dates are selected
    if (selectedStartDate && selectedEndDate) {
      setSelectedStartDate(null)
      setSelectedEndDate(null)
      return
    }

    const startDateMoment = moment(selectedStartDate)
    const endDateMoment = moment(selectedDay)
    const range = endDateMoment.diff(startDateMoment, 'days')

    // Handle negative range (end date before start date)
    if (range < 0) {
      Alert.alert('Error', 'Select valid date')
      setSelectedStartDate(null)
      setSelectedEndDate(null)
      return
    }

    // Check for unavailable dates
    let hasUnavailableDates = false
    for (let i = 1; i < range; i++) {
      const tempDate = startDateMoment
        .clone()
        .add(i, 'days')
        .format('YYYY-MM-DD')
      if (isDayBlock(tempDate)) {
        hasUnavailableDates = true
        break
      }
    }

    if (hasUnavailableDates) {
      setSelectedStartDate(selectedDay)
      setSelectedEndDate(null)
    } else {
      if (!selectedStartDate) {
        setSelectedStartDate(selectedDay)
      } else {
        setSelectedEndDate(selectedDay)
      }
    }
  }

  return (
    <>
      <View style={styles.dateView}>
        <RenderTextInputField
          control={control}
          name={'exceptionStartDate'}
          labelKey={t(
            'EditListingAvailabilityExceptionForm.exceptionStartDateLabel',
          )}
          placeholderKey={formattedDate}
          onPress={handleStartDate}
          editable={false}
        />
        <RenderTextInputField
          control={control}
          name={'exceptionEndDate'}
          labelKey={t(
            'EditListingAvailabilityExceptionForm.exceptionEndDateLabel',
          )}
          placeholderKey={formattedDate}
          onPress={handleStartDate}
          editable={false}
        />
      </View>
      {isCalendarOpen ? (
        <Calendar
          isCalendarOpen={isCalendarOpen}
          setIsCalendarOpen={() => setIsCalendarOpen(false)}
          onSumbit={onSumbit}
          customDayComponent={customDayComponent}
          markedDatesNew={
            selectedStartDate && selectedEndDate
              ? markedRange(selectedStartDate, selectedEndDate)
              : markedDates
          }
          selectedStartDate={selectedStartDate}
          selectedEndDate={selectedEndDate}
          onDayPress={onDayPress}
        />
      ) : null}
    </>
  )
}

export default ExceptionDateRange

const styles = StyleSheet.create({
  dateView: {
    marginVertical: heightScale(20),
  },
})
