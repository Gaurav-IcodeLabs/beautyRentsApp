import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { memo, useState } from 'react'
import {
  Calendar,
  RenderTextInputField,
  TimeSlotDropdown,
} from '../../../../../components'
import { useTranslation } from 'react-i18next'
import {
  exceptionFreeSlotsPerDate,
  isInRange,
  isSameDay,
  stringifyDateToISO8601,
  timeOfDayFromLocalToTimeZone,
  timestampToDate,
} from '../../../../../util'
import {
  getAllTimeValues,
  getAvailableEndTimes,
  getAvailableStartTimes,
  getMonthlyFetchRange,
  isDayBlockForDateTimeException,
} from '../EditListingAvailabilityPanel.helper'
import { useTypedSelector } from '../../../../../sharetribeSetup'
import { monthlyExceptionQueriesSelector } from '../../../EditListing.slice'
import CustomDayComponent from '../../../../../components/CustomDayComponent/CustomDayComponent'
import moment from 'moment'
import { useWatch } from 'react-hook-form'

const TODAY = new Date()

// Date formatting used for placeholder texts:
const dateFormattingOptions = {
  month: 'short',
  day: 'numeric',
  weekday: 'short',
}

const ExceptionDateTimeRange = props => {
  const { t } = useTranslation()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const { allExceptions, timeZone, listingId, control, setValue } = props
  const {
    exceptionStartDate,
    exceptionEndDate,
    availability,
    exceptionStartTime,
    exceptionEndTime,
  } = useWatch({
    control,
  })
  const exceptionStartDay = timeOfDayFromLocalToTimeZone(
    exceptionStartDate,
    timeZone,
  )

  const exceptionEndDay = timeOfDayFromLocalToTimeZone(
    exceptionEndDate,
    timeZone,
  )

  // const [exceptionStartDay, setExceptionStartDay] = useState(null)
  // const [exceptionEndDay, setExceptionEndDay] = useState(null)

  const monthlyExceptionQueries = useTypedSelector(
    monthlyExceptionQueriesSelector,
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

  const dayData = exceptionStartDay
    ? availableDates[stringifyDateToISO8601(exceptionStartDay, timeZone)]
    : null
  const availableSlotsOnSelectedDate = dayData?.slots || []

  const startTimeParams = {
    timeZone,
    availableSlots: availableSlotsOnSelectedDate,
    selectedStartDate: exceptionStartDay,
  }

  const availableStartTimes = getAvailableStartTimes(startTimeParams)

  // Get selected (or suggested) startTime, endDate, and slot (aka available time range)
  const { startTime, endDate, selectedSlot } = getAllTimeValues({
    ...startTimeParams,
    selectedStartTime:
      exceptionStartTime || availableStartTimes?.[0]?.timestamp,
    selectedEndDate: exceptionEndDay || exceptionStartDay,
  })

  const availableEndTimes = getAvailableEndTimes({
    ...startTimeParams,
    selectedSlot,
    selectedStartTime: exceptionStartTime || startTime,
    selectedEndDate: exceptionEndDay || endDate,
  })
  const markedDates = {
    [exceptionStartDate]: { selected: true, disableTouchEvent: true },
    [exceptionEndDate]: { selected: true, disableTouchEvent: true },
  }

  const customDayComponent = memo(({ date, state }) => {
    const isSelected = markedDates[date.dateString]?.selected ?? false
    return (
      <CustomDayComponent
        isSelected={isSelected}
        startDate={exceptionStartDate}
        endDate={exceptionEndDate}
        date={date}
        isDayBlock={day =>
          isDayBlockForDateTimeException(
            day,
            exceptionStartDate,
            exceptionStartTime,
            availableDates,
            timeZone,
          )
        }
        onDayPress={onDayPress}
      />
    )
  })

  const onDayPress = day => {
    const selectedDay = day.dateString

    const startDateMoment = moment(exceptionStartDate)
    const endDateMoment = moment(selectedDay)
    const range = endDateMoment.diff(startDateMoment, 'days')

    // Check for unavailable dates
    let hasUnavailableDates = false
    for (let i = 1; i < range; i++) {
      const tempDate = startDateMoment
        .clone()
        .add(i, 'days')
        .format('YYYY-MM-DD')
      if (
        isDayBlockForDateTimeException(
          tempDate,
          exceptionStartDate,
          exceptionStartTime,
          availableDates,
          timeZone,
        )
      ) {
        hasUnavailableDates = true
        break
      }
    }

    setValue('exceptionStartDate', selectedDay, {
      shouldValidate: true,
    })
    setValue('exceptionEndDate', selectedDay, {
      shouldValidate: true,
    })
    setIsCalendarOpen(false)
  }

  const formattedDate = new Intl.DateTimeFormat(
    'en-US',
    dateFormattingOptions,
  ).format(TODAY)
  const handleStartDate = () => {
    setIsCalendarOpen(true)
  }

  return (
    <>
      <View style={styles.dateTimeContainer}>
        <RenderTextInputField
          control={control}
          name={'exceptionStartDate'}
          labelKey={'Date'}
          placeholderKey={formattedDate}
          onPress={handleStartDate}
          editable={false}
          style={styles.dateInputField}
        />
      </View>
      <View style={styles.dateTimeContainer}>
        {/* <RenderTextInputField
          control={control}
          name={'exceptionEndDate'}
          labelKey={t(
            'EditListingAvailabilityExceptionForm.exceptionEndDateLabel',
          )}
          placeholderKey={formattedDate}
          onPress={handleStartDate}
          editable={false}
          style={styles.dateInputField}
        /> */}
        <TimeSlotDropdown
          lableKey={'start time'}
          isModal={false}
          data={availableStartTimes.map(tz => ({
            label: tz.timeOfDay,
            option: tz.timestamp,
          }))}
          containerStyle={styles.containerWidth}
          value={exceptionStartTime}
          onValueChange={item => {
            setValue('exceptionStartTime', item.option)
          }}
        />
        <TimeSlotDropdown
          isModal={false}
          data={
            exceptionStartTime
              ? availableEndTimes.map(tz => ({
                  label: tz.timeOfDay,
                  option: tz.timestamp,
                }))
              : []
          }
          lableKey={'end time'}
          containerStyle={styles.containerWidth}
          value={exceptionEndTime}
          onValueChange={item => {
            setValue('exceptionEndTime', item.option)
          }}
        />
      </View>
      {isCalendarOpen ? (
        <Calendar
          isCalendarOpen={isCalendarOpen}
          setIsCalendarOpen={() => setIsCalendarOpen(false)}
          onSumbit={values => console.log('first', values)}
          onDayPress={onDayPress}
          customDayComponent={customDayComponent}
        />
      ) : null}
    </>
  )
}

export default ExceptionDateTimeRange

const styles = StyleSheet.create({
  containerWidth: {
    width: '40%',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputField: {
    width: '100%',
  },
})
