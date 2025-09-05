import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import ColoredView from './ColoredView';
import {
  DATE_TYPE_DATE,
  DATE_TYPE_TIME,
  fontScale,
  widthScale,
} from '../../../../../util';
import { colors, fontWeight } from '../../../../../theme';
import { useTranslation } from 'react-i18next';
import { TimeRange } from '../../../../../components';

const formatDate = dateString => {
  const date = new Date(dateString);
  const options = { day: '2-digit', month: 'short' };
  return date.toLocaleDateString('en-US', options);
};

const ExceptionTimeList = props => {
  const { t } = useTranslation();
  const { exception, timeZone, useFullDays } = props;
  const { seats, start, end } = exception.attributes;
  const isAvailable = seats > 0;
  const startDate = formatDate(start);
  const endDate = formatDate(end);
  const availabilityInfo = isAvailable
    ? t('EditListingAvailabilityPanel.WeeklyCalendar.available')
    : t('EditListingAvailabilityPanel.WeeklyCalendar.notAvailable');

  return (
    <>
      <View style={styles.availabilityView}>
        {isAvailable ? (
          <ColoredView color={colors.success} />
        ) : (
          <ColoredView color={colors.error} />
        )}
        <Text style={styles.text1}>{availabilityInfo}</Text>
      </View>
      <View style={styles.timeRangeContainer}>
        <Text style={styles.text2}>{startDate} ,</Text>
        <TimeRange
          startDate={start}
          endDate={end}
          dateType={useFullDays ? DATE_TYPE_DATE : DATE_TYPE_TIME}
          timeZone={timeZone}
        />
      </View>
    </>
  );
};

export default ExceptionTimeList;

const styles = StyleSheet.create({
  availabilityView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text1: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.normal,
    color: colors.black,
  },
  text2: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.light,
    color: colors.black,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginTop: widthScale(5),
  },
});
