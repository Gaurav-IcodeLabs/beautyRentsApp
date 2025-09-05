import { getMonthlyFetchRange } from '../../screens/EditListing/components/EditListingAvailabilityPanel/EditListingAvailabilityPanel.helper';
import {
  TIME_SLOT_TIME,
  findNextBoundary,
  getEndHours,
  getStartHours,
  getStartOf,
  isDateSameOrAfter,
  isInRange,
  isSameDate,
  monthIdString,
  stringifyDateToISO8601,
  timeSlotsPerDate,
  timestampToDate,
} from '../../util';

export const pickMonthlyTimeSlots = (monthlyTimeSlots, date, timeZone) => {
  const monthId = monthIdString(date, timeZone);
  return monthlyTimeSlots?.[monthId]?.timeSlots || [];
};

// Checks if time slot (propTypes.timeSlot) start time equals a day (moment)
export const timeSlotEqualsDay = (timeSlot, day, timeZone) => {
  const isTimeBased = timeSlot?.attributes?.type === TIME_SLOT_TIME;
  return isTimeBased
    ? isInRange(
        day,
        timeSlot.attributes.start,
        timeSlot.attributes.end,
        undefined,
        timeZone,
      )
    : false;
};

//markes the range
export const markedRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateRange = [];
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    dateRange.push(dt.toISOString().split('T')[0]);
  }
  return dateRange.reduce(
    (acc, date) => ({
      ...acc,
      [date]: { selected: true, disableTouchEvent: true },
    }),
    {},
  );
};

// new functions

export const getAvailableStartTimes = params => {
  const { timeZone, bookingStart, timeSlotsOnSelectedDate } = params;

  if (
    timeSlotsOnSelectedDate.length === 0 ||
    !timeSlotsOnSelectedDate[0] ||
    !bookingStart
  ) {
    return [];
  }
  const bookingStartDate = getStartOf(bookingStart, 'day', timeZone);

  const allHours = timeSlotsOnSelectedDate.reduce((availableHours, t) => {
    const startDate = t.attributes.start;
    const endDate = t.attributes.end;
    const nextDate = getStartOf(bookingStartDate, 'day', timeZone, 1, 'days');

    // If the start date is after timeslot start, use the start date.
    // Otherwise use the timeslot start time.
    const startLimit = isDateSameOrAfter(bookingStartDate, startDate)
      ? bookingStartDate
      : startDate;

    // If date next to selected start date is inside timeslot use the next date to get the hours of full day.
    // Otherwise use the end of the timeslot.
    const endLimit = isDateSameOrAfter(endDate, nextDate) ? nextDate : endDate;

    const hours = getStartHours(startLimit, endLimit, timeZone);
    return availableHours.concat(hours);
  }, []);
  return allHours;
};

export const getAllTimeSlots = (monthlyTimeSlots, seatsEnabled) => {
  const timeSlotsRaw = Object.values(monthlyTimeSlots).reduce((picked, mts) => {
    return [...picked, ...(mts.timeSlots || [])];
  }, []);
  return removeUnnecessaryBoundaries(timeSlotsRaw, seatsEnabled);
};

export const removeUnnecessaryBoundaries = (timeSlots, seatsEnabled) => {
  return timeSlots.reduce((picked, ts) => {
    const hasPicked = picked.length > 0;
    if (hasPicked) {
      const rest = picked.slice(0, -1);
      const lastPicked = picked.slice(-1)[0];

      const isBackToBack =
        lastPicked.attributes.end.getTime() === ts.attributes.start.getTime();
      const hasSameSeatsCount =
        lastPicked.attributes.seats === ts.attributes.seats;
      const createJoinedTimeSlot = (ts1, ts2, seats) => ({
        ...ts1,
        attributes: {
          ...ts1.attributes,
          end: ts2.attributes.end,
          seats: seats,
        },
      });
      const hasValidSeatsCount = seatsEnabled && hasSameSeatsCount;
      const isSingleSeatMode = !seatsEnabled;
      const seatsForJoinedTimeSlot = isSingleSeatMode ? 1 : ts.attributes.seats;
      return isBackToBack && (hasValidSeatsCount || isSingleSeatMode)
        ? [
            ...rest,
            createJoinedTimeSlot(lastPicked, ts, seatsForJoinedTimeSlot),
          ]
        : [...picked, ts];
    }
    return [ts];
  }, []);
};

const getMonthlyTimeSlotsOnDate = (
  monthlyTimeSlots,
  date,
  timeZone,
  seatsEnabled,
  minDurationStartingInDay,
) => {
  const timeSlots = getAllTimeSlots(monthlyTimeSlots, seatsEnabled);
  const [startMonth, endMonth] = getMonthlyFetchRange(
    monthlyTimeSlots,
    timeZone,
  );
  const opts = { minDurationStartingInDay };
  const monthlyTimeSlotsData = timeSlotsPerDate(
    startMonth,
    endMonth,
    timeSlots,
    timeZone,
    opts,
  );
  const startIdString = stringifyDateToISO8601(date, timeZone);
  return monthlyTimeSlotsData[startIdString]?.timeSlots || [];
};

export const getTimeSlotsOnSelectedDate = (
  timeSlotsOnSelectedDate,
  monthlyTimeSlots,
  bookingStartDate,
  timeZone,
  seatsEnabled,
  minDurationStartingInDay,
) => {
  if (!bookingStartDate) {
    return [];
  }

  return timeSlotsOnSelectedDate.length > 0
    ? removeUnnecessaryBoundaries(timeSlotsOnSelectedDate, seatsEnabled)
    : bookingStartDate
    ? getMonthlyTimeSlotsOnDate(
        monthlyTimeSlots,
        bookingStartDate,
        timeZone,
        seatsEnabled,
        minDurationStartingInDay,
      )
    : [];
};

export const getTimeSlotsOnDate = (timeSlots, date, timeZone) => {
  return timeSlots && timeSlots[0]
    ? timeSlots.filter(t => {
        return isInRange(
          date,
          t.attributes.start,
          t.attributes.end,
          'day',
          timeZone,
        );
      })
    : [];
};

export const getAvailableEndTimes = params => {
  const { timeZone, bookingStartTime, bookingEndDate, selectedTimeSlot } =
    params;
  if (
    !selectedTimeSlot ||
    !selectedTimeSlot.attributes ||
    !bookingEndDate ||
    !bookingStartTime
  ) {
    return [];
  }

  const endDate = selectedTimeSlot.attributes.end;
  const bookingStartTimeAsDate = timestampToDate(bookingStartTime);

  const dayAfterBookingEnd = getStartOf(
    bookingEndDate,
    'day',
    timeZone,
    1,
    'days',
  );
  const dayAfterBookingStart = getStartOf(
    bookingStartTimeAsDate,
    'day',
    timeZone,
    1,
    'days',
  );
  const startOfEndDay = getStartOf(bookingEndDate, 'day', timeZone);

  let startLimit;
  let endLimit;

  if (!isDateSameOrAfter(startOfEndDay, bookingStartTimeAsDate)) {
    startLimit = bookingStartTimeAsDate;
    endLimit = isDateSameOrAfter(dayAfterBookingStart, endDate)
      ? endDate
      : dayAfterBookingStart;
  } else {
    // If the end date is on the same day as the selected booking start time
    // use the start time as limit. Otherwise use the start of the selected end date.
    startLimit = isDateSameOrAfter(bookingStartTimeAsDate, startOfEndDay)
      ? bookingStartTimeAsDate
      : startOfEndDay;

    // If the selected end date is on the same day as timeslot end, use the timeslot end.
    // Else use the start of the next day after selected date.
    endLimit = isSameDate(getStartOf(endDate, 'day', timeZone), startOfEndDay)
      ? endDate
      : dayAfterBookingEnd;
  }

  return getEndHours(startLimit, endLimit, timeZone);
};

export const getAllTimeValues = (
  timeZone,
  timeSlots,
  startDate,
  selectedStartTime,
  selectedEndDate,
  selectedEndTime,
  seatsEnabled,
) => {
  const startTimes = selectedStartTime
    ? []
    : getAvailableStartTimes({
        timeZone,
        bookingStart: startDate,
        timeSlotsOnSelectedDate: getTimeSlotsOnDate(
          timeSlots,
          startDate,
          timeZone,
        ),
      });

  // Value selectedStartTime is a string when user has selected it through the form.
  // That's why we need to convert also the timestamp we use as a default
  // value to string for consistency. This is expected later when we
  // want to compare the sartTime and endTime.
  const startTime = selectedStartTime
    ? selectedStartTime
    : startTimes.length > 0 && startTimes[0] && startTimes[0].timestamp
    ? startTimes[0].timestamp.toString()
    : null;

  const startTimeAsDate = startTime ? timestampToDate(startTime) : null;

  // Note: We need to remove 1ms from the calculated endDate so that if the end
  // date would be the next day at 00:00 the day in the form is still correct.
  // Because we are only using the date and not the exact time we can remove the
  // 1ms.
  const endDate = selectedEndDate
    ? selectedEndDate
    : startTimeAsDate
    ? new Date(
        findNextBoundary(startTimeAsDate, 'hour', timeZone).getTime() - 1,
      )
    : null;

  const selectedEndTimeAsDateObject = selectedEndTime
    ? timestampToDate(selectedEndTime)
    : null;

  const selectedTimeSlotIndex = timeSlots.findIndex(t =>
    isInRange(startTimeAsDate, t.attributes.start, t.attributes.end),
  );

  const selectedTimeSlot =
    selectedTimeSlotIndex >= 0 ? timeSlots[selectedTimeSlotIndex] : undefined;

  const findLastAdjacent = index => {
    const current = timeSlots[index];
    const next = timeSlots[index + 1];
    return next && isSameDate(current.attributes.end, next.attributes.start)
      ? findLastAdjacent(index + 1)
      : index;
  };

  const findFirstAdjacent = index => {
    const current = timeSlots[index];
    const previous = timeSlots[index - 1];
    return previous &&
      isSameDate(current.attributes.start, previous.attributes.end)
      ? findFirstAdjacent(index - 1)
      : index;
  };

  /**
   * Finds the smallest number of seats in time slots that meet the specified conditions.
   */
  const findMinimumAvailableSeats = (
    selectedEndTimeAsDateObject,
    timeSlots,
    selectedTimeSlotIndex,
  ) => {
    // Retrieve the selected time slot from the list.
    const selectedTimeSlot = timeSlots[selectedTimeSlotIndex];
    if (!selectedTimeSlot) {
      return null; // Return null if the selected time slot is invalid.
    }

    // Check if the selected end time falls within the selected time slot.
    const endTimeIsWithinSelected = isInRange(
      selectedEndTimeAsDateObject - 1,
      selectedTimeSlot.attributes.start,
      selectedTimeSlot.attributes.end,
    );

    if (endTimeIsWithinSelected) {
      return selectedTimeSlot.attributes.seats; // Return the seats for the selected time slot if end time and start time are within the same timeslot.
    }

    const lastIndex = findLastAdjacent(selectedTimeSlotIndex);

    // Extract the relevant time slots to check (we choose all slots between the first )
    const relevantTimeSlots = timeSlots.slice(
      selectedTimeSlotIndex,
      lastIndex + 1,
    );

    // Find the smallest number of seats in the relevant time slots.
    const minSeats = relevantTimeSlots.reduce((smallest, timeslot) => {
      const seats = timeslot.attributes.seats;

      // Update the smallest seats found so far.
      const newSmallest = Math.min(smallest, seats);

      return newSmallest;
    }, 100); // Max seats value is 100

    return minSeats;
  };

  const combineTimeSlots = (currentTimeSlotIndex, timeSlots, seatsEnabled) => {
    if (currentTimeSlotIndex < 0 || !timeSlots || timeSlots.length === 0) {
      return null;
    }

    if (timeSlots.length === 1 || seatsEnabled === false) {
      return timeSlots[0];
    }
    const lastIndex = findLastAdjacent(currentTimeSlotIndex);
    const firstIndex = findFirstAdjacent(currentTimeSlotIndex);

    const smallestSeats = seatsEnabled
      ? findMinimumAvailableSeats(
          selectedEndTimeAsDateObject,
          timeSlots,
          currentTimeSlotIndex,
        )
      : 1;

    const combinedTimeSlot = {
      ...timeSlots[currentTimeSlotIndex],
      attributes: {
        ...timeSlots[currentTimeSlotIndex].attributes,
        start: timeSlots[firstIndex].attributes.start,
        end: timeSlots[lastIndex].attributes.end,
        seats: smallestSeats,
      },
    };

    return combinedTimeSlot;
  };

  const combinedTimeSlot =
    combineTimeSlots(selectedTimeSlotIndex, timeSlots, seatsEnabled) || {};

  const endTimes = getAvailableEndTimes({
    timeZone,
    bookingStartTime: startTime,
    bookingEndDate: endDate,
    selectedTimeSlot: combinedTimeSlot,
  });

  // We need to convert the timestamp we use as a default value
  // for endTime to string for consistency. This is expected later when we
  // want to compare the sartTime and endTime.
  const endTime =
    endTimes.length > 0 && endTimes[0] && endTimes[0].timestamp
      ? endTimes[0].timestamp.toString()
      : null;

  const finalTimeSlots = seatsEnabled ? combinedTimeSlot : selectedTimeSlot;

  return { startTime, endDate, endTime, selectedTimeSlot: finalTimeSlots };
};
