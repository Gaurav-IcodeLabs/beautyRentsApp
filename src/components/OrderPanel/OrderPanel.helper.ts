import { TIME_SLOT_TIME, isInRange, monthIdString } from '../../util'

export const pickMonthlyTimeSlots = (monthlyTimeSlots, date, timeZone) => {
  const monthId = monthIdString(date, timeZone)
  return monthlyTimeSlots?.[monthId]?.timeSlots || []
}

// Checks if time slot (propTypes.timeSlot) start time equals a day (moment)
export const timeSlotEqualsDay = (timeSlot, day, timeZone) => {
  const isTimeBased = timeSlot?.attributes?.type === TIME_SLOT_TIME
  return isTimeBased
    ? isInRange(
        day,
        timeSlot.attributes.start,
        timeSlot.attributes.end,
        undefined,
        timeZone,
      )
    : false
}

//markes the range
export const markedRange = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dateRange = []
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    dateRange.push(dt.toISOString().split('T')[0])
  }
  return dateRange.reduce(
    (acc, date) => ({
      ...acc,
      [date]: { selected: true, disableTouchEvent: true },
    }),
    {},
  )
}
