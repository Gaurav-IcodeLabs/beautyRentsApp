import React, {memo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {Alert, StyleSheet, ScrollView, View} from 'react-native';
import {useConfiguration} from '../../../context';
import {
  fetchLineItemsErrorSelector,
  fetchLineItemsInProgressSelector,
  fetchTransactionLineItems,
  lineItemsSelector,
  monthlyTimeSlotsSelector,
} from '../../../screens/Listing/Listing.slice';
import {useAppDispatch, useTypedSelector} from '../../../sharetribeSetup';
import {BOOKING_PROCESS_NAME} from '../../../transactions';
import {
  getStartOf,
  timeOfDayFromLocalToTimeZone,
  widthScale,
} from '../../../util';
import {Button} from '../../Button/Button';
import {Calendar} from '../../Calendar/Calendar';
import {RenderTextInputField} from '../../RenderTextInputField/RenderTextInputField';
import EstimatedCustomerBreakdownMaybe from '../components/EstimatedCustomerBreakdownMaybe';

import moment from 'moment';
import CustomDayComponent from '../../CustomDayComponent/CustomDayComponent';
import {
  markedRange,
  pickMonthlyTimeSlots,
  timeSlotEqualsDay,
} from '../OrderPanel.helper';
import {PROVIDER_VALID_COUPON_CODE} from '@env';

const TODAY = new Date();

const BookingDatesForm = (props: any) => {
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
  const config = useConfiguration() as any;
  const dispatch = useAppDispatch();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const monthlyTimeSlots = useTypedSelector(state =>
    monthlyTimeSlotsSelector(state, listingId.uuid),
  );
  const lineItems =
    useTypedSelector(state => lineItemsSelector(state, listingId.uuid)) || [];

  const fetchLineItemsInProgress = useTypedSelector(state =>
    fetchLineItemsInProgressSelector(state, listingId.uuid),
  );
  const fetchLineItemsError = useTypedSelector(state =>
    fetchLineItemsErrorSelector(state, listingId.uuid),
  );
  const marketplaceName = config.marketplaceName;
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  const buttonKey = isInstantBooking
    ? 'BookingTimeForm.bookNow'
    : 'BookingDatesForm.requestToBook';

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    // formState: {errors, isValid, isDirty},
    reset,
  } = useForm({
    defaultValues: {
      isDayOrHourBooking: 'day',
      bookingEndDate: '',
      bookingStartDate: '',
      couponCode: '',
    },
    mode: 'all',
  });

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(TODAY);

  const handleStartDate = () => {
    setIsCalendarOpen(true);
  };

  const handleOnSubmit = values => {
    const {bookingStartDate, bookingEndDate, isDayOrHourBooking, couponCode} =
      values;
    if (!bookingStartDate && !bookingEndDate) {
      return;
    }
    const startDate = bookingStartDate
      ? timeOfDayFromLocalToTimeZone(selectedStartDate, timeZone)
      : null;
    const endDate = bookingEndDate
      ? timeOfDayFromLocalToTimeZone(selectedEndDate, timeZone)
      : null;
    endDate?.setDate(endDate.getDate() + 1);

    const hasCouponDiscount = lineItems.some(
      item => item?.code === 'line-item/coupon-discount',
    );

    const param = {
      isDayOrHourBooking,
      bookingDates: {
        startDate: startDate,
        endDate: endDate,
      },
      ...(hasCouponDiscount && couponCode === PROVIDER_VALID_COUPON_CODE
        ? {couponCode}
        : {}),
    };

    onCloseBookingModal();
    onSubmit(param);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    reset();
  };

  const handleFormSpyChange = values => {
    // const { selectedStartDate, selectedEndDate } = values;
    setValue('bookingStartDate', values.selectedStartDate);
    setValue('bookingEndDate', values.selectedEndDate);
    const startDate = timeOfDayFromLocalToTimeZone(selectedStartDate, timeZone);
    const endDate = timeOfDayFromLocalToTimeZone(selectedEndDate, timeZone);
    endDate?.setDate(endDate.getDate() + 1);

    const params = {
      orderData: {
        bookingStart: startDate,
        bookingEnd: endDate,
      },
      listingId,
      isOwnListing: false,
      isDayOrHourBooking: 'day',
      marketplaceCurrency: marketplaceCurrency,
    };

    dispatch(fetchTransactionLineItems(params));
  };

  const handleApplyClick = async () => {
    const coupon = getValues('couponCode');
    if (coupon !== PROVIDER_VALID_COUPON_CODE) {
      return;
    }

    const startDate = timeOfDayFromLocalToTimeZone(selectedStartDate, timeZone);
    const endDate = timeOfDayFromLocalToTimeZone(selectedEndDate, timeZone);
    endDate?.setDate(endDate.getDate() + 1);

    const params = {
      orderData: {
        bookingStart: startDate,
        bookingEnd: endDate,
        couponCode: coupon,
      },
      listingId,
      isOwnListing: false,
      isDayOrHourBooking: 'day',
      marketplaceCurrency: marketplaceCurrency,
    };

    dispatch(fetchTransactionLineItems(params));
  };

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
    [selectedStartDate]: {selected: true, disableTouchEvent: true},
    [selectedEndDate]: {selected: true, disableTouchEvent: true},
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
    return !timeSlots.find(timeSlot =>
      timeSlotEqualsDay(timeSlot, dayInListingTZ),
    );
  };

  const customDayComponent = memo(({date, state}) => {
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

    if (hasUnavailableDates) {
      setSelectedStartDate(selectedDay);
      setSelectedEndDate(null);
    } else {
      if (!selectedStartDate) {
        setSelectedStartDate(selectedDay);
      } else {
        setSelectedEndDate(selectedDay);
      }
    }
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
      <RenderTextInputField
        control={control}
        name={'bookingEndDate'}
        labelKey={'BookingDatesForm.bookingEndTitle'}
        placeholderKey={formattedDate}
        onPress={handleStartDate}
        editable={false}
      />

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
            !selectedStartDate || !selectedEndDate || fetchLineItemsInProgress
          }
        />
      </View>

      {showEstimatedBreakdown ? (
        <EstimatedCustomerBreakdownMaybe
          breakdownData={breakdownData}
          lineItems={lineItems}
          timeZone={timeZone}
          currency={price?.currency || marketplaceCurrency}
          marketplaceName={marketplaceName}
          processName={BOOKING_PROCESS_NAME}
        />
      ) : null}

      <Button
        text={t(buttonKey)}
        onPress={handleSubmit(handleOnSubmit)}
        loading={fetchLineItemsInProgress}
        disabled={
          !selectedStartDate || !selectedEndDate || fetchLineItemsInProgress
        }
      />
      {isCalendarOpen && (
        <Calendar
          isCalendarOpen={isCalendarOpen}
          setIsCalendarOpen={() => setIsCalendarOpen(false)}
          onSumbit={handleFormSpyChange}
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

export default BookingDatesForm;

const styles = StyleSheet.create({
  crossContainer: {
    alignItems: 'flex-end',
    marginBottom: widthScale(10),
  },
  container: {
    paddingBottom: widthScale(50),
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
