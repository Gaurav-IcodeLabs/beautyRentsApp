import moment from 'moment-timezone/builds/moment-timezone-with-data-10-year-range.min'
import { useTranslation } from 'react-i18next'

export const START_DATE = 'startDate'
export const END_DATE = 'endDate'

/**
 * Subtract time-units from the date
 *
 * @param {Date} date date to be manipulated
 * @param {int} offset offset of time-units (e.g. "3" days)
 * @param {String} unit time-unit (e.g. "days")
 * @param {String} timeZone time zone name
 *
 * @returns {Date} date with given offset subtracted
 */
export const subtractTime = (date, offset, unit, timeZone) => {
  const m = timeZone ? moment(date).clone().tz(timeZone) : moment(date).clone()
  return m.subtract(offset, unit).toDate()
}

/**
 * Adds time-units to the date
 *
 * @param {Date} date date to be manipulated
 * @param {int} offset offset of time-units (e.g. "3" days)
 * @param {String} unit time-unit (e.g. "days")
 * @param {String} timeZone time zone name
 *
 * @returns {Date} date with given offset added
 */
export const addTime = (date, offset, unit, timeZone) => {
  const m = timeZone ? moment(date).clone().tz(timeZone) : moment(date).clone()
  return m.add(offset, unit).toDate()
}

/**
 * Parses given date string in ISO8601 format('YYYY-MM-DD') to date in
 * the given time zone.
 *
 * This is used in search when filtering by time-based availability.
 *
 * Example:
 * ('2020-04-15', 'Etc/UTC') => new Date('2020-04-15T00:00:00.000Z')
 * ('2020-04-15', 'Europe/Helsinki') => new Date('2020-04-14T21:00:00.000Z')
 *
 * @param {String} dateString in 'YYYY-MM-DD' format
 * @param {String} [timeZone] time zone id, see:
 *   https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 *
 * @returns {Date} date
 */
export const parseDateFromISO8601 = (dateString, timeZone = null) => {
  return timeZone
    ? moment.tz(dateString, timeZone).toDate()
    : moment(dateString, 'YYYY-MM-DD').toDate()
}

/**
 * Formats string ('YYYY-MM-DD') in given time zone to format ('0000-00-00T00:00:00.000Z') and adds one day.
 * This is used as end date of the search query.
 * One day must be added because end of the availability is exclusive in API.
 *
 * @param {String} string in 'YYYY-MM-DD'format
 * @param {String} timeZone time zone name.
 *
 * @returns {String} string in '0000-00-00T00:00:00.000Z' format
 */
export const getExclusiveEndDate = (dateString, timeZone) => {
  return moment.tz(dateString, timeZone).add(1, 'days').startOf('day').toDate()
}

/**
 * Get start of time unit (e.g. start of day)
 *
 * @param {Date} date date instance to be converted
 * @param {String} unit time-unit (e.g. "day")
 * @param {String} timeZone time zone id
 *
 * @returns {Date} date object converted to the start of given unit
 */
export const getStartOf = (
  date,
  unit,
  timeZone,
  offset = 0,
  offsetUnit = 'days',
) => {
  const m = timeZone ? moment(date).clone().tz(timeZone) : moment(date).clone()

  const startOfUnit = m.startOf(unit)
  // Note: there is an issue with the Moment library when dealing with
  //  Daylight Saving Times (DST) in the 'Atlantic/Azores' time zone.
  //  When calculating the start of the day that follows March 30th, Moment
  // returns 23:00 on the same day due to the switch in DST. The point
  // in time 00:00 does not exist in this timezone when DST takes effect.
  // This creates an infinite loop in the code as it expects to receive the
  // date following the date that was queried. A couple of other time
  // zones apply DST around midnight too. Most time zones apply DST
  // at 03:00 to avoid this issue.
  //
  // The fix (for the infinite loop) is to ask for the next day and then add extra hours
  // (10 hours) to that date. After that, we can ask the start of the day using
  // startOf 'day' (or week/month). Using this logic, calculating the
  // start of the next day in the Atlantic/Azores timezone on the 30th of March,
  // this returns 01:00 (March 31st), which is the actual start of the next day.
  // https://github.com/moment/moment-timezone/issues/409
  const startOfUnitWithOffset =
    offset === 0
      ? startOfUnit
      : ['day', 'week', 'month'].includes(unit)
        ? startOfUnit.add(offset, offsetUnit).add(10, 'hours').startOf(unit)
        : startOfUnit.add(offset, offsetUnit)
  return startOfUnitWithOffset.toDate()
}

/**
 * Calculate the number of days between the given dates.
 * This uses moment#diff and, therefore, it just checks,
 * if there are 1000x60x60x24 milliseconds between date objects.
 *
 * Note: This should not be used for checking if the local date has
 *       changed between "2021-04-07 23:00" and "2021-04-08 05:00".
 *
 * @param {Date} startDate start of the time period
 * @param {Date} endDate end of the time period. NOTE: with daily
 * bookings, it is expected that this date is the exclusive end date,
 * i.e. the last day of the booking is the previous date of this end
 * date.
 *
 * @throws Will throw if the end date is before the start date
 * @returns {Number} number of days between the given dates
 */
export const daysBetween = (startDate, endDate) => {
  const days = moment(endDate).diff(startDate, 'days')
  if (days < 0) {
    throw new Error('End date cannot be before start date')
  }
  return days
}

export const getItemLastUpdatedTime = (date: string): string => {
  const { t } = useTranslation()
  const currentTime = new Date().getTime()
  const postTime = new Date(date).getTime()
  const timeDifferenceInSeconds = Math.round((currentTime - postTime) / 1000)

  const secondsInMinute = 60
  const secondsInHour = 3600
  const secondsInDay = 86400
  const secondsInWeek = 604800
  const secondsInMonth = 2592000 // Approximate value for a month (30 days)
  const secondsInYear = 31536000 // Approximate value for a year (365 days)

  if (timeDifferenceInSeconds < secondsInMinute) {
    return t('UpdatedTime.addedNow')
  } else if (timeDifferenceInSeconds < secondsInHour) {
    const minutes = Math.floor(timeDifferenceInSeconds / secondsInMinute)
    return minutes === 1
      ? `${minutes} ${t('UpdatedTime.minute')}`
      : `${minutes} ${t('UpdatedTime.minutes')}`
  } else if (timeDifferenceInSeconds < secondsInDay) {
    const hours = Math.floor(timeDifferenceInSeconds / secondsInHour)
    return hours === 1
      ? `${hours} ${t('UpdatedTime.hour')}`
      : `${hours} ${t('UpdatedTime.hours')}`
  } else if (timeDifferenceInSeconds < secondsInWeek) {
    const days = Math.floor(timeDifferenceInSeconds / secondsInDay)
    return days === 1
      ? `${days} ${t('UpdatedTime.day')}`
      : `${days} ${t('UpdatedTime.days')}`
  } else if (timeDifferenceInSeconds < secondsInMonth) {
    const weeks = Math.floor(timeDifferenceInSeconds / secondsInWeek)
    return weeks === 1
      ? `${weeks} ${t('UpdatedTime.week')}`
      : `${weeks} ${t('UpdatedTime.weeks')}`
  } else if (timeDifferenceInSeconds < secondsInYear) {
    const months = Math.floor(timeDifferenceInSeconds / secondsInMonth)
    return months === 1
      ? `${months} ${t('UpdatedTime.month')}`
      : `${months} ${t('UpdatedTime.months')}`
  } else {
    const years = Math.floor(timeDifferenceInSeconds / secondsInYear)
    return years === 1
      ? `${years} ${t('UpdatedTime.year')}`
      : `${years} ${t('UpdatedTime.years')}`
  }
}

/**
 * Check that the given dates are pointing to the same day.
 *
 * @param {Date} date1 first date object
 * @param {Date} date2 second date object
 * @param {String} timeZone (if omitted local time zone is used)
 *
 * @returns {boolean} true if Date objects are pointing to the same day on given time zone.
 */
export const isSameDay = (date1, date2, timeZone) => {
  const d1 = timeZone ? moment(date1).tz(timeZone) : moment(date1)
  const d2 = timeZone ? moment(date2).tz(timeZone) : moment(date2)
  return d1.isSame(d2, 'day')
}

/**
 * Check if the given time zone key is valid.
 *
 * @param {String} timeZone time zone id, see:
 *   https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 *
 * @returns {Boolean} true if the browser recognizes the key.
 */
export const isValidTimeZone = timeZone => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format()
    return true
  } catch (e) {
    return false
  }
}

export const isTimeZoneSupported = () => {
  if (
    !Intl ||
    typeof Intl === 'undefined' ||
    typeof Intl.DateTimeFormat === 'undefined'
  ) {
    return false
  }

  const dtf = new Intl.DateTimeFormat()
  if (
    typeof dtf === 'undefined' ||
    typeof dtf.resolvedOptions === 'undefined'
  ) {
    return false
  }

  // TODO: Chrome and Firefox seem to have issues on macOS Sonoma, when populating timeZone on Intl API
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1487920
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1856428
  // Note: we might remove this, when the bugs have been resolved on those browsers
  if (!dtf.resolvedOptions().timeZone && isValidTimeZone('Europe/Helsinki')) {
    console.error(`Time zone was undefined (new Intl.DateTimeFormat().resolvedOptions().timeZone).
    This might cause problems for date and duration calculation on this browser.`)
    return true
  }

  return !!dtf.resolvedOptions().timeZone
}

////////////////////////////
// Parsing and formatting //
////////////////////////////

const getTimeZoneMaybe = timeZone => {
  if (timeZone) {
    if (!isTimeZoneSupported()) {
      throw new Error(`Your browser doesn't support time zones.`)
    }

    if (!isValidTimeZone(timeZone)) {
      throw new Error(`Given time zone key (${timeZone}) is not valid.`)
    }
    return { timeZone }
  }
  return {}
}

/**
 * Formats date to into multiple different ways:
 * - date "Mar 24"
 * - time "8:07 PM"
 * - dateAndTime: "Mar 24, 8:07 PM"
 *
 * If date is on different year, it will show it.
 *
 * @param {Date} date to be formatted
 * @param {Object} intl Intl object from react-intl
 * @param {Object} [opts] options. Can be used to pass in timeZone. It should represent IANA time zone key.
 *
 * @returns {Object} "{ date, time, dateAndTime }"
 */

export const formatDateIntoPartials = (date, opts = {}) => {
  const { timeZone } = opts
  const timeZoneMaybe = getTimeZoneMaybe(timeZone)

  // console.log('date.....', JSON.stringify(date))
  // Ensure that date is a Date object
  if (!(date instanceof Date)) {
    // console.error('Invalid date object:', date);
    return {} // Return an empty object or handle the error appropriately
  }

  const now = new Date()
  const yearMaybe =
    now.getFullYear() === date.getFullYear() ? {} : { year: 'numeric' }

  const formatDate = formatOptions => {
    return date.toLocaleString('en-US', formatOptions)
  }

  const formatString = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    ...yearMaybe,
  }

  return {
    date: formatDate(formatString),
    time: formatDate({ hour: 'numeric', minute: 'numeric', ...timeZoneMaybe }),
    dateAndTime: formatDate(formatString),
  }
}

/**
 * Format the given date. Printed string depends on how close the date is the current day.
 * E.g. "Today, 9:10 PM", "Sun 6:02 PM", "Jul 20, 6:02 PM", "Jul 20 2020, 6:02 PM"
 *
 * @param {Date} date Date to be formatted
 * @param {Object} intl Intl object from react-intl
 * @param {String} todayString translation for the current day
 * @param {Object} [opts] options. Can be used to pass in timeZone. It should represent IANA time zone key.
 *
 * @returns {String} formatted date
 */
//this function is remodified to get the date formatted like web
export const formatDateWithProximity = (date, todayString, opts = {}) => {
  if (!(date instanceof Date) || typeof todayString !== 'string') {
    throw new Error(`Invalid params for formatDate: (${date}, ${todayString})`)
  }

  const { timeZone } = opts
  const localizedNow = timeZone ? moment().tz(timeZone) : moment()

  const dateMoment = timeZone ? moment(date).tz(timeZone) : moment(date)

  if (localizedNow.isSame(dateMoment, 'day')) {
    // e.g. "Today, 9:10 PM"
    const formattedTime = dateMoment.format('LT') // 'LT' is locale aware for time
    return `${todayString}, ${formattedTime}`
  } else if (localizedNow.isSame(dateMoment, 'week')) {
    // e.g. "Sun 6:02 PM"
    return dateMoment.format('ddd LT')
  } else if (localizedNow.isSame(dateMoment, 'year')) {
    // e.g. "Jul 20, 6:02 PM"
    return dateMoment.format('MMM D, LT')
  } else {
    // e.g. "Jul 20, 2020, 6:02 PM"
    return dateMoment.format('MMM D, YYYY, LT')
  }
}

/**
 * Convert timestamp to date
 * @param {string} timestamp
 *
 * @returns {Date} timestamp converted to date
 */
export const timestampToDate = timestamp => {
  return new Date(Number.parseInt(timestamp, 10))
}

/**
 * Find the next sharp hour after the current moment.
 *
 * @param {Moment|Date} Start point for looking next sharp hour.
 * @param {String} timeUnit scope. e.g. 'hour', 'day'
 * @param {String} timezone name. It should represent IANA timezone key.
 *
 * @returns {Array} an array of localized hours.
 */
export const findNextBoundary = (currentMomentOrDate, timeUnit, timeZone) =>
  moment(currentMomentOrDate)
    .clone()
    .tz(timeZone)
    .add(1, timeUnit)
    .startOf(timeUnit)
    .toDate()
/* Detect the default timezone of user.
 * This function can only be called from client side.
 * I.e. server-side rendering doesn't make sense - it would not return user's timezone.
 *
 * @returns {String} string containing IANA timezone key (e.g. 'Europe/Helsinki')
 */
export const getDefaultTimeZone = () => {
  if (isTimeZoneSupported()) {
    const dtf = new Intl.DateTimeFormat()
    const currentTimeZone = dtf.resolvedOptions().timeZone
    if (currentTimeZone) {
      return currentTimeZone
    }
  }
  // If we can't detect the timezone, we return UTC.
  return 'Etc/UTC'
}

/**
 * Return the names of the time zones according to IANA timezone db.
 *
 * @param {RegExp} relevantZonesRegExp is pattern to filter returned time zones.
 *
 * @returns {Array} an array of relevant time zones.
 */
export const getTimeZoneNames = relevantZonesRegExp => {
  const allTimeZones = moment.tz.names()
  return relevantZonesRegExp
    ? allTimeZones.filter(z => relevantZonesRegExp.test(z))
    : allTimeZones
}

/**
 * Get the start of a week as a Momemnt instance.
 * This is used by react-dates library (e.g. WeeklyCalendar)
 * @param {Moment} dayMoment moment instance representing a day
 * @param {String} timeZone name. It should represent IANA timezone key.
 * @param {number} firstDayOfWeek (which weekday is the first day?)
 * @returns return moment object representing the first moment of the week where dayMoment belongs to
 */
export const getStartOfWeekAsMoment = (dayMoment, timeZone, firstDayOfWeek) => {
  const m = timeZone ? dayMoment.clone().tz(timeZone) : dayMoment.clone()
  let d = m.startOf('day')
  const diffToSunday = d.day()
  const adjustOffset =
    diffToSunday === 0 && firstDayOfWeek > 0
      ? -7 + firstDayOfWeek
      : firstDayOfWeek
  const startOfWeek = d.date() - diffToSunday + adjustOffset // adjust when day is sunday
  return d.clone().date(startOfWeek)
}

/**
 * Get the start of a week as a Date instance.
 * This is used by react-dates library (e.g. WeeklyCalendar)
 * @param {Date} date instance
 * @param {String} timeZone name. It should represent IANA timezone key.
 * @param {number} firstDayOfWeek (which weekday is the first day?)
 * @returns a Date object representing the first day of the week where given date belongs to
 */
export const getStartOfWeek = (date, timeZone, firstDayOfWeek) => {
  return getStartOfWeekAsMoment(
    moment(date).tz(timeZone),
    timeZone,
    firstDayOfWeek,
  ).toDate()
}

/**
 * Compare is dateA is after dateB
 *
 * @param {Date} dateA date instance
 * @param {Date} dateB date instance
 *
 * @returns {Date} true if dateA is after dateB
 */
export const isAfterDate = (dateA, dateB) => {
  return moment(dateA).isAfter(moment(dateB))
}

/**
 * Get the day (number) of the week (similar to "new Date().getDay()")
 * @param {Date} date
 * @param {String} timeZone name. It should represent IANA timezone key.
 * @returns the day of week number 0(Sun) ... 6(Sat)
 */
export const getDayOfWeek = (date, timeZone) => {
  return timeZone ? moment(date).tz(timeZone).day() : moment(date).day()
}

/**
 * Check if the date is in the given range, start and end included.
 * @param {Date} date to be checked
 * @param {Date} start start of the range
 * @param {Date} end end of the range
 * @param {string} timeUnit scope of the range, e.g. 'day', 'hour', 'minute', can be also null
 * @param {String} timeZone
 *
 * @returns {boolean} is date in range
 */
export const isInRange = (date, start, end, timeUnit, timeZone) => {
  const dateMoment = timeZone ? moment(date).tz(timeZone) : moment(date)
  // Range usually ends with 00:00, and with day timeUnit,
  // this means that exclusive end is wrongly taken into range.
  // Note about timeUnit with isBetween: in the event that the from and to parameters are the same,
  // but the inclusivity parameters are different, false will preside.
  // aka moment('2016-10-30').isBetween('2016-10-30', '2016-10-30', undefined, '(]'); //false
  // => we need to use []
  const millisecondBeforeEndTime = new Date(end.getTime() - 1)
  return dateMoment.isBetween(start, millisecondBeforeEndTime, timeUnit, '[]')
}

/**
 * Parses a date string that has format like "YYYY-MM-DD HH:mm" into localized date
 * @param {String} dateTimeString
 * @param {String} timeZone time zone id, see:
 *   https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 * @returns returns Date object
 */
export const parseDateTimeString = (dateTimeString, timeZone = null) => {
  return timeZone
    ? moment.tz(dateTimeString, timeZone).toDate()
    : moment(dateTimeString, 'YYYY-MM-DD HH:mm').toDate()
}

/**
 * Converts date to string ISO8601 format ('YYYY-MM-DD').
 * This string is used e.g. in urlParam.
 *
 * @param {Date} date
 * @param {String} [timeZone] time zone id, see:
 *   https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 *
 * @returns {String} string in 'YYYY-MM-DD' format
 */
export const stringifyDateToISO8601 = (date, timeZone = null) => {
  return timeZone
    ? moment(date).tz(timeZone).format('YYYY-MM-DD')
    : moment(date).format('YYYY-MM-DD')
}

/**
 * Format the given date to month id/string: 'YYYY-MM'.
 *
 * @param {Date} date to be formatted
 * @param {String} [timeZone] time zone name (optional parameter).
 *
 * @returns {String} formatted month string
 */
export const monthIdString = (date, timeZone = null) => {
  return timeZone
    ? moment(date).tz(timeZone).format('YYYY-MM')
    : moment(date).format('YYYY-MM')
}

/**
 * Count the number of minutes between the given Date objects.
 *
 * @param {Date} startDate start of the time period
 * @param {Date} endDate end of the time period.
 *
 * @returns {Number} number of minutes between the given Date objects
 */
export const minutesBetween = (startDate, endDate) => {
  const minutes = moment(endDate).diff(startDate, 'minutes')
  return minutes
}

/**
 * Returns a new date, which indicates the same time of day in a given time zone
 * as given date is in local time zone
 *
 * @param {Date} date
 * @param {String} timeZone
 *
 * @returns {Date} date in given time zone
 */
export const timeOfDayFromLocalToTimeZone = (date, timeZone) => {
  return moment
    .tz(moment(date).format('YYYY-MM-DD HH:mm:ss'), timeZone)
    .toDate()
}

///////////////////////
// Time unit helpers //
///////////////////////

// NOTE: If your customization is using different time-units than hours
// and different boundaries than sharp hours, you need to modify these functions:
// - findBookingUnitBoundaries (DST changes)
// - findNextBoundary
// - getSharpHours
// - getStartHours
// - getEndHours

// Helper function for exported function: getSharpHours
// Recursively find boundaries for bookable time slots.
//created this helper function to get time of day
function getTimeOfDay(currentTime, timeZone) {
  const formattedTime = moment.tz(currentTime, timeZone).format('HH:mm')
  return formattedTime
}
const findBookingUnitBoundaries = params => {
  const {
    cumulatedResults,
    currentBoundary,
    startMoment,
    endMoment,
    nextBoundaryFn,
    timeZone,
    timeUnit = 'hour',
  } = params

  if (moment(currentBoundary).isBetween(startMoment, endMoment, null, '[]')) {
    const timeOfDay = getTimeOfDay(currentBoundary, timeZone)
    // Choose the previous (aka first) sharp hour boundary,
    // if daylight saving time (DST) creates the same time of day two times.
    const newBoundary =
      cumulatedResults &&
      cumulatedResults.length > 0 &&
      cumulatedResults.slice(-1)[0].timeOfDay === timeOfDay
        ? []
        : [
            {
              timestamp: currentBoundary.valueOf(),
              timeOfDay,
            },
          ]

    return findBookingUnitBoundaries({
      ...params,
      cumulatedResults: [...cumulatedResults, ...newBoundary],
      currentBoundary: moment(
        nextBoundaryFn(currentBoundary, timeUnit, timeZone),
      ),
    })
  }
  return cumulatedResults
}

/**
 * Compare is dateA is after dateB
 *
 * @param {Date} dateA date instance
 * @param {Date} dateB date instance
 *
 * @returns {Date} true if dateA is after dateB
 */
export const isDateSameOrAfter = (dateA, dateB) => {
  return moment(dateA).isSameOrAfter(moment(dateB))
}

/**
 * Find sharp hours inside given time window. Returned strings are localized to given time zone.
 *
 * > getSharpHours(new Date('2019-09-18T08:00:00.000Z'), new Date('2019-09-18T11:00:00.000Z'), 'Europe/Helsinki', intl);
 * => [
 *    {
 *      "timestamp": 1568793600000,
 *      "timeOfDay": "11:00",
 *    },
 *    {
 *      "timestamp": 1568797200000,
 *      "timeOfDay": "12:00",
 *    },
 *    {
 *      "timestamp": 1568800800000,
 *      "timeOfDay": "13:00",
 *    },
 *    {
 *      "timestamp": 1568804400000,
 *      "timeOfDay": "14:00",
 *    },
 *  ]
 *
 * @param {Date} Start point of available time window.
 * @param {Date} End point of available time window.
 * @param {String} timezone name. It should represent IANA timezone key.
 * @param {Object} intl containing formatting options for Intl.DateTimeFormat.
 *
 * @returns {Array} an array of objects with keys timestamp and timeOfDay.
 */
export const getSharpHours = (startTime, endTime, timeZone) => {
  if (!moment.tz.zone(timeZone)) {
    throw new Error(
      'Time zones are not loaded into moment-timezone. "getSharpHours" function uses time zones.',
    )
  }

  // Select a moment before startTime to find next possible sharp hour.
  // I.e. startTime might be a sharp hour.
  const millisecondBeforeStartTime = new Date(startTime.getTime() - 1)
  return findBookingUnitBoundaries({
    currentBoundary: findNextBoundary(
      millisecondBeforeStartTime,
      'hour',
      timeZone,
    ),
    startMoment: moment(startTime),
    endMoment: moment(endTime),
    nextBoundaryFn: findNextBoundary,
    cumulatedResults: [],
    timeZone,
    timeUnit: 'hour',
  })
}

/**
 * Find sharp start hours for bookable time units (hour) inside given time window.
 * Returned strings are localized to given time zone.
 *
 * > getStartHours(new Date('2019-09-18T08:00:00.000Z'), new Date('2019-09-18T11:00:00.000Z'), 'Europe/Helsinki', intl);
 * => [
 *    {
 *      "timestamp": 1568793600000,
 *      "timeOfDay": "11:00",
 *    },
 *    {
 *      "timestamp": 1568797200000,
 *      "timeOfDay": "12:00",
 *    },
 *    {
 *      "timestamp": 1568800800000,
 *      "timeOfDay": "13:00",
 *    },
 *  ]
 *
 * @param {Date} Start point of available time window.
 * @param {Date} End point of available time window.
 * @param {String} timezone name. It should represent IANA timezone key.
 * @param {Object} intl containing formatting options for Intl.DateTimeFormat.
 *
 * @returns {Array} an array of objects with keys timestamp and timeOfDay.
 */
export const getStartHours = (startTime, endTime, timeZone) => {
  const hours = getSharpHours(startTime, endTime, timeZone)
  return hours.length < 2 ? hours : hours.slice(0, -1)
}

/**
 * Find sharp end hours for bookable time units (hour) inside given time window.
 * Returned strings are localized to given time zone.
 *
 * > getStartingHours(new Date('2019-09-18T08:00:00.000Z'), new Date('2019-09-18T11:00:00.000Z'), 'Europe/Helsinki', intl);
 * => [
 *    {
 *      "timestamp": 1568797200000,
 *      "timeOfDay": "12:00",
 *    },
 *    {
 *      "timestamp": 1568800800000,
 *      "timeOfDay": "13:00",
 *    },
 *    {
 *      "timestamp": 1568804400000,
 *      "timeOfDay": "14:00",
 *    },
 *  ]
 *
 * @param {Date} Start point of available time window.
 * @param {Date} End point of available time window.
 * @param {String} timezone name. It should represent IANA timezone key.
 * @param {Object} intl containing formatting options for Intl.DateTimeFormat.
 *
 * @returns {Array} an array of objects with keys timestamp and timeOfDay.
 */
export const getEndHours = (startTime, endTime, timeZone) => {
  const hours = getSharpHours(startTime, endTime, timeZone)
  return hours.length < 2 ? [] : hours.slice(1)
}
