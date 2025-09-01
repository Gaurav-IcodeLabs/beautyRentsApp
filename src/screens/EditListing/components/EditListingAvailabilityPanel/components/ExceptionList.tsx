import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { deleteIcon } from '../../../../../assets';
import { useColors } from '../../../../../context';
import {
  useAppDispatch,
  useTypedSelector,
} from '../../../../../sharetribeSetup';
import { AppColors, colors, fontWeight } from '../../../../../theme';
import {
  availabilityPerDate,
  fontScale,
  getStartOf,
  getStartOfWeek,
  heightScale,
  widthScale,
} from '../../../../../util';
import {
  allExceptionsSelector,
  deleteExceptionIdSelector,
  deleteExceptionInProgressSelector,
  requestDeleteAvailabilityException,
} from '../../../EditListing.slice';
import {
  endOfAvailabilityExceptionRange,
  getStartOfSelectedWeek,
} from '../EditListingAvailabilityPanel.helper';
import ColoredView from './ColoredView';
import ExceptionTimeList from './ExceptionTimeList';
import { lightenColor } from '../../../../../util/data';

const TODAY = new Date();

const formatDate = dateString => {
  const date = new Date(dateString);
  const options = { day: '2-digit', month: 'short' };
  return date.toLocaleDateString('en-US', options);
};

const formateEndate = dateString => {
  const date = new Date(dateString);
  date.setDate(date.getDate() - 1);
  const options = { day: '2-digit', month: 'short' };
  return date.toLocaleDateString('en-US', options);
};

const ExceptionComponent = props => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { exception, useFullDays, timeZone } = props;
  const { seats, start, end } = exception.attributes;
  const isAvailable = seats > 0;
  const formateStart = formatDate(start);
  const formateEnd = formateEndate(end);

  const colorsData: AppColors = useColors();
  const deleteExceptionInProgress = useSelector(
    deleteExceptionInProgressSelector,
  );
  const deleteExceptionId = useTypedSelector(deleteExceptionIdSelector);

  const availabilityInfo = isAvailable
    ? t('EditListingAvailabilityPanel.WeeklyCalendar.available')
    : t('EditListingAvailabilityPanel.WeeklyCalendar.notAvailable');
  const handleDeleteException = async () => {
    await dispatch(requestDeleteAvailabilityException({ id: exception.id }));
  };

  return (
    <View style={styles.exceptionView}>
      <View>
        {useFullDays ? (
          <>
            <View style={styles.availabilityView}>
              {isAvailable ? (
                <ColoredView color={colorsData.marketplaceColor} />
              ) : (
                <ColoredView color={colors.lightRedColor} />
              )}
              <Text style={styles.text1}>{availabilityInfo}</Text>
            </View>
            <Text
              style={styles.text2}
            >{`${formateStart} - ${formateEnd}`}</Text>
          </>
        ) : (
          <ExceptionTimeList
            exception={exception}
            timeZone={timeZone}
            useFullDays={useFullDays}
          />
        )}
      </View>
      <TouchableOpacity
        onPress={handleDeleteException}
        disabled={deleteExceptionInProgress}
        style={styles.deleteBtn}
      >
        {deleteExceptionInProgress &&
        deleteExceptionId === exception.id.uuid ? (
          <ActivityIndicator size={'small'} color={colors.black} />
        ) : (
          <Image source={deleteIcon} style={styles.deleteIcon} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const ExceptionList = props => {
  const {
    listingId,
    availabilityPlan,
    weeklyExceptionQueries,
    isDaily,
    useFullDays,
    firstDayOfWeek,
    hasAvailabilityPlan,
  } = props;
  const availabilityExceptions = useTypedSelector(allExceptionsSelector);
  const [currentWeek, setCurrentWeek] = useState(
    getStartOfSelectedWeek({
      ...props,
      timeZone: availabilityPlan.timezone,
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
    availabilityExceptions,
  );

  const daysOfWeekStrings = Object.keys(availableDates);
  return (
    <>
      {availabilityExceptions.map((exception, index) => {
        return (
          <ExceptionComponent
            key={index}
            exception={exception}
            useFullDays={useFullDays}
            timeZone={timeZone}
          />
        );
      })}
    </>
  );
};

export default ExceptionList;

const styles = StyleSheet.create({
  text1: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    lineHeight: fontScale(17),
  },
  text2: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.light,
    lineHeight: fontScale(17),
  },
  exceptionView: {
    flexDirection: 'row',
    // alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: heightScale(10),
  },
  availabilityView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteBtn: {
    marginRight: widthScale(5),
    backgroundColor: lightenColor(colors.marketplaceColor, 10),
    width: widthScale(35),
    height: widthScale(35),
    borderRadius: widthScale(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    width: widthScale(15),
    height: widthScale(15),
    tintColor: colors.error,
  },
});
