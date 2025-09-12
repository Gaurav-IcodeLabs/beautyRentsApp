import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {memo, useEffect, useState} from 'react';
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
import {RenderTextInputField} from '../../RenderTextInputField/RenderTextInputField';
import {useConfiguration} from '../../../context';
import {useForm} from 'react-hook-form';
import CustomDayComponent from '../../CustomDayComponent/CustomDayComponent';
import {Calendar} from '../../Calendar/Calendar';
import {
  getAllTimeValues,
  getAvailableEndTimes,
  getAvailableStartTimes,
  getTimeSlotsOnSelectedDate,
  markedRange,
  pickMonthlyTimeSlots,
  timeSlotEqualsDay,
} from '../OrderPanel.helper';
import {useAppDispatch, useTypedSelector} from '../../../sharetribeSetup';
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
import {BOOKING_PROCESS_NAME} from '../../../transactions';
import {RenderDropdownField} from '../../RenderDropdownField/RenderDropdownField';
import {Button} from '../../Button/Button';
import {useTranslation} from 'react-i18next';
import EstimatedCustomerBreakdownMaybe from '../components/EstimatedCustomerBreakdownMaybe';
import {PROVIDER_VALID_COUPON_CODE} from '@env';

const TODAY = new Date();

const CustomDayWrapper = memo(
  ({
    date,
    state,
    markedDates,
    selectedStartDate,
    selectedEndDate,
    isDayBlock,
    onDayPress,
  }) => {
    const isSelected = markedDates?.[date.dateString]?.selected ?? false;
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
  },
);

const timestampToDateNew = timestamp => {
  if (!timestamp) {
    return null;
  }
  const parsed = Number.parseInt(timestamp, 10);
  if (isNaN(parsed)) {
    return null;
  }
  return new Date(parsed);
};

const BookingTimeForm = (props: any) => {
  const {
    onSubmit,
    price,
    listingId,
    timeZone,
    marketplaceCurrency,
    onCloseBookingModal,
    isInstantBooking,
  } = props;
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const config = useConfiguration() as any;
  const marketplaceName = config.marketplaceName;

  const monthlyTimeSlots = useTypedSelector(state =>
    monthlyTimeSlotsSelector(state, listingId.uuid),
  );
  const timeSlotsForDate = useTypedSelector(state =>
    timeSlotsPerDateSelector(state, listingId.uuid),
  );
  const lineItems =
    useTypedSelector(state => lineItemsSelector(state, listingId.uuid)) ?? [];
  const fetchLineItemsInProgress = useTypedSelector(state =>
    fetchLineItemsInProgressSelector(state, listingId.uuid),
  );
  // console.log('fetchLineItemsInProgress', fetchLineItemsInProgress);
  const fetchLineItemsError = useTypedSelector(state =>
    fetchLineItemsErrorSelector(state, listingId.uuid),
  );

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const buttonKey = isInstantBooking
    ? 'BookingTimeForm.bookNow'
    : 'BookingDatesForm.requestToBook';
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    // formState: {errors, isValid, isDirty},
  } = useForm({
    defaultValues: {
      isDayOrHourBooking: 'hour',
      bookingEndDate: '',
      bookingStartDate: '',
      startTime: '',
      endTime: '',
      couponCode: '',
    },
    mode: 'all',
  });

  const startTime = watch('startTime');
  const couponValue = watch('couponCode');
  // const startTime = getValues('startTime');
  const endTime = watch('endTime');
  // const endTime = getValues('endTime');
  const bookingEndDate = watch('bookingEndDate');
  // const bookingEndDate = getValues('bookingEndDate');

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(TODAY);

  const handleStartDate = () => setIsCalendarOpen(true);

  const StartDate = startTime ? timestampToDateNew(startTime) : null;
  const EndDate = endTime ? timestampToDateNew(endTime) : null;

  const breakdownData =
    StartDate && EndDate
      ? {
          startDate: StartDate,
          endDate: EndDate,
        }
      : null;

  const showEstimatedBreakdown = Boolean(
    breakdownData &&
      Array.isArray(lineItems) &&
      !fetchLineItemsInProgress &&
      !fetchLineItemsError,
  );

  const markedDates = React.useMemo(
    () => ({
      [selectedStartDate]: {selected: true, disableTouchEvent: true},
      [selectedEndDate]: {selected: true, disableTouchEvent: true},
    }),
    [selectedStartDate, selectedEndDate],
  );

  const minDurationStartingInDay = 60;

  // const pickerTimeSlots = getAllTimeSlots(monthlyTimeSlots, false);
  // const [startMonth, endMonth] = getMonthlyFetchRange(
  //   monthlyTimeSlots,
  //   timeZone,
  // );
  // const options = {minDurationStartingInDay};
  // const monthlyTimeSlotsData = timeSlotsPerDate(
  //   startMonth,
  //   endMonth,
  //   pickerTimeSlots,
  //   timeZone,
  //   options,
  // );

  const isDayBlock = React.useCallback(
    (date: string) => {
      // const dateString = new Date(date);
      const timeOfDay = timeOfDayFromLocalToTimeZone(date, timeZone);
      const dayInListingTZ = getStartOf(timeOfDay, 'day', timeZone);
      const dateIdString = stringifyDateToISO8601(dayInListingTZ, timeZone);
      // const timeSlotData = monthlyTimeSlotsData[dateIdString];
      // // console.log('timeSlotData', JSON.stringify(timeSlotData));
      // return !timeSlotData?.hasAvailability;
      const timeSlots = pickMonthlyTimeSlots(
        monthlyTimeSlots,
        dateIdString,
        timeZone,
      );
      // console.log('timeSlots', JSON.stringify(timeSlots));
      return !timeSlots.find((timeSlot: any) =>
        timeSlotEqualsDay(timeSlot, dateIdString, timeZone),
      );
    },
    [monthlyTimeSlots, timeZone],
    // [monthlyTimeSlotsData, timeZone],
  );

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
    if (!selectedStartDate) {
      return;
    }

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
        options: {useFetchTimeSlotsForDate: true},
      }),
    );
  }, [selectedStartDate, dispatch, listingId, timeZone]);

  const bookingStartIdString = stringifyDateToISO8601(
    selectedStartDate,
    timeZone,
  );

  const timeSlotsOnSelectedDate =
    timeSlotsForDate[bookingStartIdString]?.timeSlots || [];

  const onDayPress = React.useCallback(day => {
    const selectedDay = day.dateString;

    // // Check if both start and end dates are selected
    // if (selectedStartDate && selectedEndDate) {
    //   setSelectedStartDate(null);
    //   setSelectedEndDate(null);
    //   return;
    // }

    // const startDateMoment = moment(selectedStartDate);
    // const endDateMoment = moment(selectedDay);
    // const range = endDateMoment.diff(startDateMoment, 'days');

    // // Handle negative range (end date before start date)
    // if (range < 0) {
    //   Alert.alert('Error', 'Select valid date');
    //   setSelectedStartDate(null);
    //   setSelectedEndDate(null);
    //   return;
    // }

    // // Check for unavailable dates
    // let hasUnavailableDates = false;
    // for (let i = 1; i < range; i++) {
    //   const tempDate = startDateMoment
    //     .clone()
    //     .add(i, 'days')
    //     .format('YYYY-MM-DD');
    //   if (isDayBlock(tempDate)) {
    //     hasUnavailableDates = true;
    //     break;
    //   }
    // }
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
  }, []);

  const customDayComponent = React.useCallback(
    (prop: any) => (
      <CustomDayWrapper
        {...prop}
        markedDates={
          selectedStartDate && selectedEndDate
            ? markedRange(selectedStartDate, selectedEndDate)
            : markedDates
        }
        selectedStartDate={selectedStartDate}
        selectedEndDate={selectedEndDate}
        isDayBlock={isDayBlock}
        onDayPress={onDayPress}
      />
    ),
    [markedDates, selectedStartDate, selectedEndDate, isDayBlock, onDayPress],
  );

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
      setValue('endTime', '', {shouldDirty: true});
      dispatch(clearLineItems({listingId: listingId.uuid})); //also clear the lienitems
    }
  }, [startTime, setValue, dispatch, listingId]);

  const handleFetchLineitems = async (end_time: string) => {
    try {
      const StartDate = startTime ? timestampToDate(startTime) : null;
      const time = endTime || end_time;
      const EndDate = time ? timestampToDate(time) : null;
      if (!StartDate || !EndDate) {
        return;
      }
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
      dispatch(fetchTransactionLineItems(params)).unwrap();
    } catch (error) {
      console.log('eee------fetching lineitem', error);
    }
  };

  const handleApplyClick = async () => {
    try {
      const StartDate = startTime ? timestampToDate(startTime) : null;
      const EndDate = endTime ? timestampToDate(endTime) : null;
      if (!StartDate || !EndDate) {
        return;
      }
      const params = {
        orderData: {
          bookingStart: StartDate,
          bookingEnd: EndDate,
          couponCode: couponValue,
        },
        listingId,
        isOwnListing: false,
        isDayOrHourBooking: 'hour',
        marketplaceCurrency: marketplaceCurrency,
      };
      dispatch(fetchTransactionLineItems(params)).unwrap();
    } catch (error) {
      console.log('eee------fetching lineitem', error);
    }
  };

  const handleOnSubmit = (values: any) => {
    if (!values.endTime && !values.startTime) {
      return;
    }
    const startDate = values.bookingStartDate
      ? timeOfDayFromLocalToTimeZone(selectedStartDate, timeZone)
      : null;
    const hasCouponDiscount = lineItems.some(
      item => item?.code === 'line-item/coupon-discount',
    );

    const param = {
      bookingStartTime: values.startTime,
      bookingEndTime: values.endTime,
      bookingStartDate: {
        date: startDate,
      },
      ...(hasCouponDiscount && values.couponCode === PROVIDER_VALID_COUPON_CODE
        ? {couponCode: values.couponCode}
        : {}),
    };
    onSubmit(param);
    onCloseBookingModal();
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}>
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

      <View style={styles.couponCodeSection}>
        <RenderTextInputField
          control={control}
          name={'couponCode'}
          labelKey={'Coupon Code'}
          placeholderKey={'Enter your coupon code'}
          style={styles.couponInput}
          autoCapitalize="none"
        />

        <Button
          text="Apply"
          onPress={() => handleApplyClick()}
          style={styles.couponBtn}
          disabled={
            !selectedStartDate ||
            !selectedEndDate ||
            !startTime ||
            !endTime ||
            fetchLineItemsInProgress
          }
        />
      </View>

      {showEstimatedBreakdown ? (
        <View style={styles.breakdownSection}>
          <EstimatedCustomerBreakdownMaybe
            breakdownData={breakdownData}
            lineItems={lineItems}
            timeZone={timeZone}
            currency={price?.currency || marketplaceCurrency}
            marketplaceName={marketplaceName}
            processName={BOOKING_PROCESS_NAME}
          />
        </View>
      ) : null}

      <Button
        // text={t('BookingDatesForm.requestToBook')}
        text={t(buttonKey)}
        style={styles.button}
        onPress={handleSubmit(handleOnSubmit)}
        loading={fetchLineItemsInProgress}
        // disabled
        disabled={
          !selectedStartDate ||
          !selectedEndDate ||
          !startTime ||
          !endTime ||
          fetchLineItemsInProgress
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
    flexGrow: 1,
  },
  timeFieldSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropDownStyle: {width: '48%'},
  loader: {marginTop: widthScale(50)},
  button: {
    marginTop: widthScale(30),
  },
  breakdownSection: {
    flex: 1,
    minHeight: widthScale(200),
  },
  couponCodeSection: {
    flexDirection: 'row',
    marginBottom: widthScale(20),
  },
  couponInput: {
    flex: 1,
    marginRight: widthScale(20),
  },
  couponBtn: {
    paddingHorizontal: widthScale(20),
    marginTop: widthScale(28),
  },
});
