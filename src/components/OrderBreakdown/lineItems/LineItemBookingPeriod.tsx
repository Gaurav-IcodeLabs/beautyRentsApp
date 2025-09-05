import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import {
  fontScale,
  LINE_ITEM_HOUR,
  LINE_ITEM_NIGHT,
  subtractTime,
  widthScale,
} from '../../../util';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { colors, fontWeight } from '../../../theme';

const BookingPeriod = props => {
  const { t } = useTranslation();
  const { startDate, endDate, dateType, timeZone } = props;

  const formattedStartString = dayjs(startDate).format('DD MMM dddd');

  const formattedEndString = dayjs(endDate).format('DD MMM dddd');
  return (
    <View style={styles.bookingContainer}>
      <View style={styles.section}>
        <Text style={styles.label}>{t('OrderBreakdown.bookingStart')}</Text>
        <Text style={styles.value}>{formattedStartString}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>{t('OrderBreakdown.bookingEnd')}</Text>
        <Text style={[styles.value, { textAlign: 'right' }]}>
          {formattedEndString}
        </Text>
      </View>
    </View>
  );
};

const LineItemBookingPeriod = props => {
  const { booking, code, dateType, timeZone } = props;

  if (!booking) {
    return null;
  }
  // Attributes: displayStart and displayEnd can be used to differentiate shown time range
  // from actual start and end times used for availability reservation. It can help in situations
  // where there are preparation time needed between bookings.
  // Read more: https://www.sharetribe.com/api-reference/marketplace.html#bookings
  const { start, end, displayStart, displayEnd } = booking.attributes;
  const localStartDate = displayStart || start;
  const localEndDateRaw = displayEnd || end;

  const isNightly = code === LINE_ITEM_NIGHT;
  const isHour = code === LINE_ITEM_HOUR;
  const endDay =
    isNightly || isHour
      ? localEndDateRaw
      : subtractTime(localEndDateRaw, 1, 'days');
  return (
    <>
      <BookingPeriod
        startDate={localStartDate}
        endDate={endDay}
        dateType={dateType}
        timeZone={timeZone}
      />
      <View style={styles.itemSeperatorStyle} />
    </>
  );
};

export default LineItemBookingPeriod;

const styles = StyleSheet.create({
  bookingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {},
  itemSeperatorStyle: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.grey,
    marginVertical: widthScale(6),
  },
  label: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    color: colors.black,
  },
  value: {
    marginTop: widthScale(5),
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    color: colors.black,
  },
});
