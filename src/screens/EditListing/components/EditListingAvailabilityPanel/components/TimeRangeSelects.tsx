import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { TimeSlotDropdown } from '../../../../../components';
import { filterEndHours } from '../EditListingAvailabilityPanel.helper';
import { deleteIcon } from '../../../../../assets';
import { fontScale, widthScale } from '../../../../../util';
import { colors } from '../../../../../theme';

const TimeRangeSelects = props => {
  const {
    index,
    availableStartHours,
    availableEndHours,
    value,
    update,
    onRemove,
    entries,
    t,
  } = props;

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <TimeSlotDropdown
          lableKey="Start time"
          isModal={false}
          data={availableStartHours.map(tz => ({
            label: tz,
            option: tz,
          }))}
          containerStyle={styles.containerWidth}
          value={value.startTime}
          onValueChange={item => {
            update(index, {
              startTime: item.option,
              endTime: value.endTime,
            });
          }}
        />
        <TimeSlotDropdown
          lableKey="End time"
          isModal={false}
          data={filterEndHours(availableEndHours, entries, index).map(tz => ({
            label: tz,
            option: tz,
          }))}
          containerStyle={styles.containerWidth}
          value={value.endTime}
          onValueChange={item => {
            update(index, {
              startTime: value.startTime,
              endTime: item.option,
            });
          }}
        />
      </View>
      <View style={styles.deleteWrapper}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onRemove(index)}
        >
          <Image source={deleteIcon} style={styles.removeStyle} />
          <Text style={styles.deleteText}>
            {t('EditListingAvailabilityPlanForm.delete')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TimeRangeSelects;

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: widthScale(10),
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerWidth: {
    width: '48%',
  },
  removeStyle: {
    width: widthScale(18),
    height: widthScale(18),
  },
  deleteWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthScale(6),
    paddingHorizontal: widthScale(10),
    paddingVertical: widthScale(4),
  },
  deleteText: {
    fontSize: fontScale(14),
    color: colors.black,
  },
});
