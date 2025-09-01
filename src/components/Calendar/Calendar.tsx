import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { CalendarList } from 'react-native-calendars';
import { Button } from '../Button/Button';
import { widthScale } from '../../util';
import { useTranslation } from 'react-i18next';
import { cross } from '../../assets';
import moment from 'moment';
export const Calendar = props => {
  const { t } = useTranslation();
  const {
    setIsCalendarOpen,
    isCalendarOpen,
    onSumbit,
    customDayComponent,
    markedDatesNew,
    onDayPress,
    selectedStartDate,
    selectedEndDate,
  } = props;

  const handleSubmit = () => {
    onSumbit({ selectedStartDate, selectedEndDate });
    setIsCalendarOpen();
  };
  if (!isCalendarOpen) {
    return null;
  }

  return (
    <Modal
      visible={isCalendarOpen}
      animationType="fade"
      onRequestClose={setIsCalendarOpen}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.closeContainerStyle}
          onPress={setIsCalendarOpen}
        >
          <Image source={cross} style={styles.crossImageStyle} />
        </TouchableOpacity>
        <View style={styles.calenderContainer}>
          <CalendarList
            firstDay={1}
            onDayPress={day => onDayPress(day)}
            current={moment().format('YYYY-MM-DD')}
            minDate={moment().format('YYYY-MM-DD')}
            maxDate={moment().add(90, 'days').format('YYYY-MM-DD')}
            hideExtraDays={true}
            markedDates={markedDatesNew}
            dayComponent={customDayComponent}
            markingType={'period'}
            arrowsHitSlop={10}
            calendarStyle={styles.calendarStyle}
            pastScrollRange={0}
            futureScrollRange={3}
          />
        </View>
        <Button
          text={t('Calendar.buttonTitle')}
          onPress={handleSubmit}
          style={styles.buttonStyle}
        />
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: widthScale(50),
    paddingVertical: widthScale(20),
  },
  closeContainerStyle: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    paddingHorizontal: widthScale(20),
  },
  crossImageStyle: {
    width: widthScale(20),
    height: widthScale(20),
  },
  calendarStyle: {
    alignContent: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  buttonStyle: {
    marginHorizontal: widthScale(20),
  },
  calenderContainer: {
    maxHeight: '90%',
  },
});
