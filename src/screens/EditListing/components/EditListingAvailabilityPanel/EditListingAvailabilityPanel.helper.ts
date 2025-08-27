import moment from 'moment'
import {
  findNextBoundary,
  getDefaultTimeZone,
  getEndHours,
  getSharpHours,
  getStartHours,
  getStartOf,
  getStartOfWeek,
  isDateSameOrAfter,
  isInRange,
  isSameDay,
  parseDateFromISO8601,
  parseDateTimeString,
  stringifyDateToISO8601,
  timeOfDayFromLocalToTimeZone,
  timestampToDate,
} from '../../../../util'
// Marketplace API allows fetching exceptions to 366 days into the future.
const MAX_AVAILABILITY_EXCEPTIONS_RANGE = 366

export const getStartOfMonth = (currentMoment, timeZone, offset = 0) =>
  getStartOf(currentMoment, 'month', timeZone, offset, 'months')
export const getStartOfNextMonth = (currentMoment, timeZone, offset = 1) =>
  getStartOfMonth(currentMoment, timeZone, offset)

// Create initial entry mapping for form's initial values
const createEntryDayGroups = (entries = {}) => {
  // Collect info about which days are active in the availability plan form:
  let activePlanDays = []
  return entries.reduce((groupedEntries, entry) => {
    const { startTime, endTime: endHour, dayOfWeek } = entry
    const dayGroup = groupedEntries[dayOfWeek] || []
    activePlanDays = activePlanDays.includes(dayOfWeek)
      ? activePlanDays
      : [...activePlanDays, dayOfWeek]
    return {
      ...groupedEntries,
      [dayOfWeek]: [
        ...dayGroup,
        {
          startTime,
          endTime: endHour === '00:00' ? '24:00' : endHour,
        },
      ],
      activePlanDays,
    }
  }, {})
}

// Create initial values
export const createInitialValues = availabilityPlan => {
  const { timezone, entries } = availabilityPlan || {}
  const tz = timezone || getDefaultTimeZone()
  return {
    timezone: tz,
    ...createEntryDayGroups(entries),
  }
}

// This is the order of days as JavaScript understands them
// The number returned by "new Date().getDay()" refers to day of week starting from sunday.
export const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
export const DAYMAP = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

// This is the order of days as JavaScript understands them
// The number returned by "new Date().getDay()" refers to day of week starting from sunday.
export const rotateDays = (days, startOfWeek) => {
  return startOfWeek === 0
    ? days
    : days.slice(startOfWeek).concat(days.slice(0, startOfWeek))
}

// Create entries from submit values
const createEntriesFromSubmitValues = values =>
  WEEKDAYS.reduce((allEntries, dayOfWeek) => {
    const dayValues = values[dayOfWeek] || []
    const dayEntries = dayValues?.map(dayValue => {
      const { startTime, endTime } = dayValue
      // Note: This template doesn't support seats yet.
      return startTime && endTime
        ? {
            dayOfWeek,
            seats: 1,
            startTime,
            endTime: endTime === '24:00' ? '00:00' : endTime,
          }
        : null
    })

    return allEntries.concat(dayEntries?.filter(e => !!e))
  }, [])

// Create availabilityPlan from submit values
export const createAvailabilityPlan = values => ({
  availabilityPlan: {
    type: 'availability-plan/time',
    timezone: values?.timezone,
    entries: createEntriesFromSubmitValues(values),
  },
})

export const endOfAvailabilityExceptionRange = (timeZone, date) => {
  return getStartOf(
    date,
    'day',
    timeZone,
    MAX_AVAILABILITY_EXCEPTIONS_RANGE - 1,
    'days',
  )
}

export const getStartOfSelectedWeek = ({
  locationSearch,
  timeZone,
  firstDayOfWeek,
}) => {
  const selectedDate = locationSearch?.d
    ? parseDateFromISO8601(locationSearch.d, timeZone)
    : new Date()
  return getStartOfWeek(selectedDate, timeZone, firstDayOfWeek)
}

const HOURS = Array(24).fill()
// Internally, we use 00:00 ... 24:00 mapping for hour strings
const printHourStrings = h => (h > 9 ? `${h}:00` : `0${h}:00`)
// Start hours and end hours for each day on weekly schedule
// Note: if you need to use something else than sharp hours,
//       you'll need to customize this.
export const ALL_START_HOURS = HOURS.map((v, i) => printHourStrings(i))
export const ALL_END_HOURS = HOURS.map((v, i) => printHourStrings(i + 1))

/**
 * Find all the entries that boundaries are already reserved.
 *
 * @param {*} entries look like this [{ startTime: '13:00', endTime: '17:00' }]
 * @param {*} intl
 * @param {*} findStartHours find start hours (00:00 ... 23:00) or else (01:00 ... 24:00)
 * @returns array of reserved sharp hours. E.g. ['13:00', '14:00', '15:00', '16:00']
 */
export const getEntryBoundaries = (entries, findStartHours) => index => {
  const boundaryDiff = findStartHours ? 0 : 1

  return entries?.reduce((allHours, entry, i) => {
    const { startTime, endTime } = entry || {}

    if (i !== index && startTime && endTime) {
      const startHour = Number.parseInt(startTime.split(':')[0])
      const endHour = Number.parseInt(endTime.split(':')[0])
      const hoursBetween = Array(endHour - startHour)
        .fill()
        .map((v, i) => printHourStrings(startHour + i + boundaryDiff))

      return allHours.concat(hoursBetween)
    }

    return allHours
  }, [])
}

// Curried: find entry by comparing start time and end time
const findEntryFn = entry => e =>
  e.startTime === entry.startTime && e.endTime === entry.endTime
/**
 * User might create entries inside the day of week in what ever order.
 * We need to sort them before they can be compared with available hours.
 *
 * @param {Integer} defaultCompareReturn if startTime is null, negative value pushes the entry to the beginning
 * @returns
 */
const sortEntries =
  (defaultCompareReturn = 0) =>
  (a, b) => {
    if (a.startTime && b.startTime) {
      const aStart = Number.parseInt(a.startTime.split(':')[0])
      const bStart = Number.parseInt(b.startTime.split(':')[0])
      return aStart - bStart
    }
    return defaultCompareReturn
  }

export const filterEndHours = (availableEndHours, entries, index) => {
  const currentEntry = entries[index]

  // If there is no start time selected, return an empty array;
  if (!currentEntry?.startTime) {
    return []
  }

  // By default the entries are not in order so we need to sort the entries by startTime
  // in order to find out the allowed start times
  // Undefined entry ({ startTime: null, endTime: null }) is pushed to the beginning with '-1'.
  const sortedEntries = [...entries].sort(sortEntries(-1))

  // Find the index of the current entry from sorted entries
  const currentIndex = sortedEntries.findIndex(findEntryFn(currentEntry))

  // If there is no next entry,
  // return all the available end times that are after the start of current entry.
  // Otherwise return all the available end hours between current start time and next entry.
  const nextEntry = sortedEntries[currentIndex + 1]
  const pickAfter = time => h => h > time
  const pickBetween = (start, end) => h => h > start && h <= end

  return !nextEntry || !nextEntry.startTime
    ? availableEndHours.filter(pickAfter(currentEntry.startTime))
    : availableEndHours.filter(
        pickBetween(currentEntry.startTime, nextEntry.startTime),
      )
}

/////////////
// Weekday //
/////////////

export const parseLocalizedTime = (date, timeString, timeZone) => {
  const dateString = stringifyDateToISO8601(date, timeZone)
  return parseDateTimeString(`${dateString} ${timeString}`, timeZone)
}

export const getEndTimeAsDate = (date, endTime, isDaily, timeZone) => {
  const endTimeAsDate =
    endTime == '00:00' && !isDaily
      ? getStartOf(date, 'day', timeZone, 1, 'days')
      : parseLocalizedTime(date, endTime, timeZone)
  return endTimeAsDate
}

const getMonthStartInTimeZone = (monthId, timeZone) => {
  const month = parseDateFromISO8601(`${monthId}-01`, timeZone) // E.g. new Date('2022-12')
  return getStartOfMonth(month, timeZone)
}

// Get the range of months that we have already fetched content
// (as a reaction to user's Next-button clicks on date picker).
export const getMonthlyFetchRange = (monthlyExceptionQueries, timeZone) => {
  const monthStrings = Object.keys(monthlyExceptionQueries)
  const firstMonth = getMonthStartInTimeZone(monthStrings[0], timeZone)
  const lastMonth = getMonthStartInTimeZone(
    monthStrings[monthStrings.length - 1],
  )
  const exclusiveEndMonth = getStartOfNextMonth(lastMonth, timeZone)
  return [firstMonth, exclusiveEndMonth]
}

export const isDayBlockForDateTimeException = (
  day,
  exceptionStartDay,
  exceptionStartTime,
  availableDates,
  timeZone,
) => {
  const localizedDay = timeOfDayFromLocalToTimeZone(day, timeZone)
  const currentDate = moment().format('YYYY-MM-DD')
  // focusinput is start date
  // if (!exceptionStartDay) {
  const dayData = availableDates[stringifyDateToISO8601(localizedDay, timeZone)]
  return dayData == null
    ? true
    : dayData.slots?.length === 0 || day < currentDate
  // }
  // If focused input is END_DATE, we only allow selection within a slot
  // found on target date (e.g. start day of a new exception)
  // const dayData =
  //   availableDates[stringifyDateToISO8601(exceptionStartDay, timeZone)]
  const slots = dayData?.slots || []
  const selectedSlot = exceptionStartTime
    ? slots.find(t =>
        isInRange(timestampToDate(exceptionStartTime), t.start, t.end),
      )
    : slots[0]
  const isInSlotRange = (date, slot) => {
    const rangeStart = exceptionStartTime
      ? timestampToDate(exceptionStartTime)
      : slot.start
    const isDayInRange = isInRange(date, rangeStart, slot?.end, 'day', timeZone)
    const isExcludedEnd = isSameDay(date, slot?.end, timeZone)
    return isDayInRange || isExcludedEnd
  }
  return day < currentDate || selectedSlot
    ? !isInSlotRange(localizedDay, selectedSlot)
    : true
}

// Get available start times for new exceptions on given date.
export const getAvailableStartTimes = ({
  selectedStartDate,
  availableSlots,
  timeZone,
}) => {
  if (availableSlots.length === 0 || !availableSlots[0] || !selectedStartDate) {
    return []
  }

  // Ensure 00:00 on correct time zone
  const startOfDate = getStartOf(selectedStartDate, 'day', timeZone)
  const nextDay = getStartOf(startOfDate, 'day', timeZone, 1, 'days')

  const allHours = availableSlots.reduce((availableHours, t) => {
    // time-range: start and end
    const { start, end } = t

    // If the selectedStartDate is after start, use the date.
    // Otherwise use the start time.
    const startLimit = isDateSameOrAfter(startOfDate, start)
      ? startOfDate
      : start

    // If the end date is after "the next day" / midnight, use the next date to get the hours of a full day.
    // Otherwise use the end of the timeslot.
    const endLimit = isDateSameOrAfter(end, nextDay) ? nextDay : end

    const hours = getStartHours(startLimit, endLimit, timeZone)
    return availableHours.concat(hours)
  }, [])

  return allHours
}

// Get available end times for new exceptions on selected time range.
export const getAvailableEndTimes = ({
  timeZone,
  selectedSlot,
  selectedStartTime,
  selectedEndDate,
}) => {
  if (!selectedSlot || !selectedEndDate || !selectedStartTime) {
    return []
  }

  const selectedSlotEnd = selectedSlot.end
  const selectedStartTimeAsDate = timestampToDate(selectedStartTime)
  const isSingleDayRange = isSameDay(
    selectedStartTimeAsDate,
    selectedEndDate,
    timeZone,
  )

  // Midnight of selectedEndDate
  const startOfSelectedEndDate = getStartOf(selectedEndDate, 'day', timeZone)
  // Next midnight after selectedEndDate
  const dayAfterSelectedEndDate = getStartOf(
    selectedEndDate,
    'day',
    timeZone,
    1,
    'days',
  )

  // Return slot's start time, if it happens after the beginning of selected end date
  // I.e. on "same day" situation, use start time, otherwise default to 00:00 of end date.
  const limitStart = isDateSameOrAfter(
    selectedStartTimeAsDate,
    startOfSelectedEndDate,
  )
    ? selectedStartTimeAsDate
    : startOfSelectedEndDate

  // Return slot's end, if it becomes before the end of the selected end date (next 00:00)
  // I.e. Get the hours of a full day, but no more.
  const limitEnd = isDateSameOrAfter(dayAfterSelectedEndDate, selectedSlotEnd)
    ? selectedSlotEnd
    : dayAfterSelectedEndDate

  const selectableHours = isSingleDayRange
    ? getEndHours(limitStart, limitEnd, timeZone)
    : getSharpHours(limitStart, limitEnd, timeZone)

  const lastSelectableTimestamp =
    selectableHours[selectableHours.length - 1]?.timestamp
  // If the selectable hour is "00:00" of the next day, we discard it to avoid confusion.
  const isNextDate = isSameDay(
    dayAfterSelectedEndDate,
    timestampToDate(lastSelectableTimestamp),
  )
  return isNextDate ? selectableHours.slice(0, -1) : selectableHours
}

// Use start date to calculate the first possible start time or times, end date and end time or times.
// If the selected value is passed to function it will be used instead of calculated value.
export const getAllTimeValues = ({
  timeZone,
  availableSlots,
  selectedStartDate,
  selectedStartTime,
  selectedEndDate,
}) => {
  const startTimes = getAvailableStartTimes({
    selectedStartDate,
    availableSlots,
    timeZone,
  })
  const startTime = selectedStartTime
    ? selectedStartTime
    : startTimes?.[0]?.timestamp
  const startTimeAsDate = startTime ? timestampToDate(startTime) : null
  const selectedSlot = availableSlots.find(t =>
    isInRange(startTimeAsDate, t.start, t.end),
  )

  // Note: We need to remove 1ms from the calculated endDate so that if the end
  // date would be the next day at 00:00, the day in the form is still correct.
  // Because we are only using the date and not the exact time we can remove the
  // 1ms.
  const endDate = selectedEndDate
    ? selectedEndDate
    : startTimeAsDate
      ? new Date(
          findNextBoundary(startTimeAsDate, 'hour', timeZone).getTime() - 1,
        )
      : null

  const params = {
    timeZone,
    selectedSlot,
    selectedStartTime: startTime,
    selectedEndDate: endDate,
  }
  const endTimes = getAvailableEndTimes(params)
  const endTime = endTimes?.[0]?.timestamp || null

  return { startTime, endDate, endTime, selectedSlot }
}
