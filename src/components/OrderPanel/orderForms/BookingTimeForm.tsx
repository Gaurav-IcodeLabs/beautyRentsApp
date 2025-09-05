import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, { memo, useEffect, useState } from 'react';
import {
  findNextBoundary,
  getStartOf,
  isDateSameOrAfter,
  isInRange,
  stringifyDateToISO8601,
  timeOfDayFromLocalToTimeZone,
  timestampToDate,
  widthScale,
} from '../../../util';
import { RenderTextInputField } from '../../RenderTextInputField/RenderTextInputField';
import { useConfiguration } from '../../../context';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import CustomDayComponent from '../../CustomDayComponent/CustomDayComponent';
import { Calendar } from '../../Calendar/Calendar';
import {
  getAllTimeValues,
  getAvailableEndTimes,
  getAvailableStartTimes,
  getTimeSlotsOnSelectedDate,
  markedRange,
  pickMonthlyTimeSlots,
  timeSlotEqualsDay,
} from '../OrderPanel.helper';
import EstimatedCustomerBreakdownMaybe from '../components/EstimatedCustomerBreakdownMaybe';
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup';
import {
  clearLineItems,
  fetchLineItemsErrorSelector,
  fetchLineItemsInProgressSelector,
  fetchTimeSlots,
  fetchTransactionLineItems,
  lineItemsSelector,
  monthlyTimeSlotsSelector,
  timeSlotsPerDateSelector,
} from '../../../screens/Listing/Listing.slice';
import { BOOKING_PROCESS_NAME } from '../../../transactions';
import { RenderDropdownField } from '../../RenderDropdownField/RenderDropdownField';
import { colors } from '../../../theme';
import { Button } from '../../Button/Button';
import { useTranslation } from 'react-i18next';

const TODAY = new Date();

const BookingTimeForm = (props: any) => {
  const { onSubmit, price, listingId, timeZone, marketplaceCurrency } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const config = useConfiguration();
  const marketplaceName = config.marketplaceName;

  const monthlyTimeSlots = useTypedSelector(state =>
    monthlyTimeSlotsSelector(state, listingId.uuid),
  );
  const timeSlotsForDate = useTypedSelector(state =>
    timeSlotsPerDateSelector(state, listingId.uuid),
  );
  const lineItems = useTypedSelector(state =>
    lineItemsSelector(state, listingId.uuid),
  );
  const fetchLineItemsInProgress = useTypedSelector(state =>
    fetchLineItemsInProgressSelector(state, listingId.uuid),
  );
  const fetchLineItemsError = useTypedSelector(state =>
    fetchLineItemsErrorSelector(state, listingId.uuid),
  );

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm({
    defaultValues: {
      bookingEndDate: '',
      bookingStartDate: '',
      startTime: '',
      endTime: '',
    },
    mode: 'all',
  });

  const startTime = watch('startTime');
  const endTime = watch('endTime');
  // const bookingStartDate = watch('bookingStartDate');
  const bookingEndDate = watch('bookingEndDate');

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(TODAY);

  const handleStartDate = () => setIsCalendarOpen(true);

  const breakdownData =
    getValues().bookingStartDate && getValues().bookingEndDate
      ? {
          startDate: getValues().bookingStartDate,
          endDate: getValues().bookingEndDate,
        }
      : null;

  const showEstimatedBreakdown =
    breakdownData &&
    lineItems &&
    !fetchLineItemsInProgress &&
    !fetchLineItemsError;

  const markedDates = {
    [selectedStartDate]: { selected: true, disableTouchEvent: true },
    [selectedEndDate]: { selected: true, disableTouchEvent: true },
  };

  const isDayBlock = date => {
    const dateString = new Date(date);
    const timeOfDay = timeOfDayFromLocalToTimeZone(dateString, timeZone);
    const dayInListingTZ = getStartOf(timeOfDay, 'day', timeZone);
    const timeSlots = pickMonthlyTimeSlots(
      monthlyTimeSlots,
      dayInListingTZ,
      timeZone,
    );
    return !timeSlots.find((timeSlot: any) =>
      timeSlotEqualsDay(timeSlot, dayInListingTZ, timeZone),
    );
  };

  const customDayComponent = memo(({ date, state }) => {
    const isSelected = markedDates[date.dateString]?.selected ?? false;
    return (
      <CustomDayComponent
        isSelected={isSelected}
        startDate={selectedStartDate}
        endDate={selectedEndDate}
        date={date}
        isDayBlock={isDayBlock}
        onDayPress={onDayPress}
      />
    );
  });

  const isToday = (date, timeZone) => {
    if (!date) {
      return false;
    }
    const startOfDay = getStartOf(TODAY, 'day', timeZone);
    const startOfTomorrow = getStartOf(TODAY, 'day', timeZone, 1, 'days');
    return isInRange(date, startOfDay, startOfTomorrow, 'day', timeZone);
  };

  // --- FETCH TIME SLOTS WHEN DATE CHANGES ---
  useEffect(() => {
    if (!selectedStartDate) return;

    const startDate = timeOfDayFromLocalToTimeZone(selectedStartDate, timeZone);
    const nextDay = getStartOf(startDate, 'day', timeZone, 1, 'days');
    const timeUnit = 'hour';
    const nextBoundaryToday = findNextBoundary(new Date(), timeUnit, timeZone);
    const nextBoundary = isToday(startDate, timeZone)
      ? nextBoundaryToday
      : findNextBoundary(startDate, timeUnit, timeZone);

    const startLimit = isDateSameOrAfter(startDate, nextBoundaryToday)
      ? startDate
      : nextBoundary;
    const endLimit = nextDay;

    dispatch(
      fetchTimeSlots({
        listingId,
        start: startLimit,
        end: endLimit,
        timeZone,
        useFetchTimeSlotsForDate: true,
      }),
    );
  }, [selectedStartDate, dispatch, listingId, timeZone]);

  const bookingStartIdString = stringifyDateToISO8601(
    selectedStartDate,
    timeZone,
  );

  const timeSlotsOnSelectedDate =
    timeSlotsForDate[bookingStartIdString]?.timeSlots || [];

  const minDurationStartingInDay = 60;

  const onDayPress = day => {
    const selectedDay = day.dateString;

    // Check if both start and end dates are selected
    if (selectedStartDate && selectedEndDate) {
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      return;
    }

    const startDateMoment = moment(selectedStartDate);
    const endDateMoment = moment(selectedDay);
    const range = endDateMoment.diff(startDateMoment, 'days');

    // Handle negative range (end date before start date)
    if (range < 0) {
      Alert.alert('Error', 'Select valid date');
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      return;
    }

    // Check for unavailable dates
    let hasUnavailableDates = false;
    for (let i = 1; i < range; i++) {
      const tempDate = startDateMoment
        .clone()
        .add(i, 'days')
        .format('YYYY-MM-DD');
      if (isDayBlock(tempDate)) {
        hasUnavailableDates = true;
        break;
      }
    }
    setSelectedStartDate(selectedDay);
    setSelectedEndDate(selectedDay);

    // if (hasUnavailableDates) {
    //   setSelectedStartDate(selectedDay);
    //   setSelectedEndDate(null);
    // } else {
    //   if (!selectedStartDate) {
    //     setSelectedStartDate(selectedDay);
    //   } else {
    //     setSelectedEndDate(selectedDay);
    //   }
    // }
  };

  const timeSlotsOnDate = getTimeSlotsOnSelectedDate(
    timeSlotsOnSelectedDate,
    monthlyTimeSlots,
    selectedStartDate,
    timeZone,
    false,
    minDurationStartingInDay,
  );

  const availableStartTimes = getAvailableStartTimes({
    timeZone,
    bookingStart: selectedStartDate,
    timeSlotsOnSelectedDate: timeSlotsOnDate,
  });

  const {
    startTime: defaultStart,
    endDate,
    selectedTimeSlot,
  } = getAllTimeValues(
    timeZone,
    timeSlotsOnDate,
    selectedStartDate,
    startTime,
    selectedEndDate,
    endTime,
    false,
  );

  const availableEndTimes = getAvailableEndTimes({
    timeZone,
    selectedTimeSlot,
    bookingStartTime: startTime || defaultStart,
    bookingEndDate: bookingEndDate || endDate,
  });

  // useEffect(() => {   //this is if you want to set the endTime automatically when selecting the startTime
  //   // Check if startTime actually changed
  //   const startTimeChanged = previousStartTime.current !== startTime;

  //   if (startTime && availableEndTimes.length > 0 && startTimeChanged) {
  //     const newEndTime = availableEndTimes[0].timestamp;
  //     setValue('endTime', newEndTime);
  //     handleFetchLineitems(newEndTime);

  //     // Reset the manual change flag when startTime changes
  //     endTimeManuallyChanged.current = false;
  //   }

  //   // Update the previous startTime reference
  //   previousStartTime.current = startTime;
  // }, [startTime]);

  useEffect(() => {
    if (startTime) {
      // reset endTime whenever startTime changes
      setValue('endTime', '', { shouldDirty: true });
      dispatch(clearLineItems({ listingId: listingId.uuid })); //also clear the lienitems
    }
  }, [startTime, setValue, dispatch, listingId]);

  const handleFetchLineitems = async (end_time: string) => {
    const StartDate = startTime ? timestampToDate(startTime) : null;
    const time = endTime || end_time;
    const EndDate = time ? timestampToDate(time) : null;
    if (!StartDate || !EndDate) return;
    const params = {
      orderData: {
        bookingStart: StartDate,
        bookingEnd: EndDate,
      },
      listingId,
      isOwnListing: false,
      isDayOrHourBooking: 'hour',
      marketplaceCurrency: marketplaceCurrency,
    };
    await dispatch(fetchTransactionLineItems(params));
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <RenderTextInputField
        control={control}
        name={'bookingStartDate'}
        labelKey={'BookingDatesForm.bookingStartTitle'}
        placeholderKey={formattedDate}
        onPress={handleStartDate}
        editable={false}
      />

      <View style={styles.timeFieldSection}>
        <RenderDropdownField
          style={styles.dropDownStyle}
          containerWidth={false}
          control={control}
          name="startTime"
          lableKey="Start Time"
          data={availableStartTimes}
          labelField="timeOfDay"
          itemRenderKey="timeOfDay"
          valueField="timestamp"
          placeholderKey="Select time"
          onDropDownValueChange={(value, cb) => {
            cb(value?.timestamp);
          }}
        />

        <RenderDropdownField
          style={styles.dropDownStyle}
          containerWidth={false}
          control={control}
          name="endTime"
          lableKey="End Time"
          data={availableEndTimes}
          labelField="timeOfDay"
          itemRenderKey="timeOfDay"
          valueField="timestamp"
          placeholderKey="Select time"
          onDropDownValueChange={(value, cb) => {
            cb(value?.timestamp);
            handleFetchLineitems(value.timestamp);
          }}
        />
      </View>

      {
        // fetchLineItemsInProgress ? (
        //   <ActivityIndicator
        //     style={styles.loader}
        //     size={'small'}
        //     color={colors.black}
        //   />
        // ) :
        showEstimatedBreakdown ? (
          <EstimatedCustomerBreakdownMaybe
            breakdownData={breakdownData}
            lineItems={lineItems}
            timeZone={timeZone}
            currency={price?.currency || marketplaceCurrency}
            marketplaceName={marketplaceName}
            processName={BOOKING_PROCESS_NAME}
          />
        ) : null
      }

      <Button
        text={t('BookingDatesForm.requestToBook')}
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        loading={fetchLineItemsInProgress}
        disabled={
          !selectedStartDate || !selectedEndDate || !startTime || !endTime
        }
      />
      {isCalendarOpen && (
        <Calendar
          isCalendarOpen={isCalendarOpen}
          setIsCalendarOpen={() => setIsCalendarOpen(false)}
          onSumbit={values => {
            setSelectedStartDate(values.selectedStartDate);
            setSelectedEndDate(values.selectedEndDate);
            setValue('bookingStartDate', values.selectedStartDate);
            setValue('bookingEndDate', values.selectedEndDate);
          }}
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
      )}
    </ScrollView>
  );
};

export default BookingTimeForm;

const styles = StyleSheet.create({
  crossContainer: {
    alignItems: 'flex-end',
    marginBottom: widthScale(10),
  },
  container: {
    paddingBottom: widthScale(50),
  },
  timeFieldSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropDownStyle: { width: '48%' },
  loader: { marginTop: widthScale(50) },
  button: {
    marginTop: widthScale(30),
  },
});
