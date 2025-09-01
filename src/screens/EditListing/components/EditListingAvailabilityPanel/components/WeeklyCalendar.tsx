import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTypedSelector } from '../../../../../sharetribeSetup';
import { colors } from '../../../../../theme';
import {
  availabilityPerDate,
  getStartOf,
  getStartOfWeek,
  widthScale,
} from '../../../../../util';
import { allExceptionsSelector } from '../../../EditListing.slice';
import {
  endOfAvailabilityExceptionRange,
  getStartOfSelectedWeek,
} from '../EditListingAvailabilityPanel.helper';
import CalendarDate from './CalendarDate';
import DateLabel from './DateLabel';

const TODAY = new Date();

const WeeklyCalendar = props => {
  const {
    listingId,
    availabilityPlan,
    weeklyExceptionQueries,
    isDaily,
    useFullDays,
    firstDayOfWeek,
  } = props;
  const availabilityExceptions = useTypedSelector(allExceptionsSelector);
  const [currentWeek, setCurrentWeek] = useState(
    getStartOfSelectedWeek({
      ...props,
      timeZone: props.availabilityPlan.timezone,
    }),
  );

  const timeZone = availabilityPlan.timezone;
  const endOfRange = endOfAvailabilityExceptionRange(timeZone, new Date());
  const thisWeek = getStartOfWeek(TODAY, timeZone, firstDayOfWeek);
  const nextWeek = getStartOf(currentWeek, 'day', timeZone, 7, 'days');
  const availableDates = availabilityPerDate(
    currentWeek,
    nextWeek,
    availabilityPlan,
    [],
  );

  const daysOfWeekStrings = Object.keys(availableDates);
  return (
    <View>
      {daysOfWeekStrings.map(dayString => {
        const availabilityData = availableDates[dayString];
        const hasAvailability = availabilityData.hasAvailability;
        return (
          <View
            key={dayString}
            style={[
              styles.container,
              hasAvailability ? styles.availableContainer : styles.nonAvailable,
            ]}
          >
            <DateLabel
              dateId={availabilityData?.id}
              hasAvailability={hasAvailability}
              timeZone={timeZone}
            />
            <CalendarDate
              key={dayString}
              availabilityData={availabilityData}
              hasAvailability={hasAvailability}
              isDaily={isDaily}
              useFullDays={useFullDays}
              timeZone={timeZone}
            />
          </View>
        );
      })}
    </View>
  );
};

export default WeeklyCalendar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: widthScale(10),
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  availableContainer: {
    // borderWidth: 1,
    // borderColor: colors.lightGrey,
    backgroundColor: colors.white,
  },
  nonAvailable: {
    backgroundColor: colors.lightestGrey,
    // borderWidth: 1,
    // borderColor: 'transparent',
  },
});
