import React from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckBox } from '../../../../../components';
import { colors, fontWeight } from '../../../../../theme';
import { fontScale, widthScale } from '../../../../../util';
import {
  ALL_END_HOURS,
  ALL_START_HOURS,
  DAYMAP,
  getEntryBoundaries,
} from '../EditListingAvailabilityPanel.helper';
import TimeRangeSelects from './TimeRangeSelects';
import { useTranslation } from 'react-i18next';

const AvailabilityPlanEntries = props => {
  const { t } = useTranslation();
  const { dayOfWeek, control, useFullDays, setValue, getValues } = props;
  const entries = useWatch({ control, name: dayOfWeek }) ?? [];
  const { fields, remove, update } = useFieldArray({
    control,
    name: dayOfWeek,
  });

  const getEntryStartTimes = getEntryBoundaries(entries, true);
  const getEntryEndTimes = getEntryBoundaries(entries, false);

  const noBottomBorder = dayOfWeek !== 'sun';

  const handleWeeksCheckBox = () => {
    const activeDays = getValues('activePlanDays') ?? [];
    const isDayActive = activeDays.includes(dayOfWeek);

    if (useFullDays) {
      // If full days (00:00 - 24:00) are used we'll hide the start time and end time fields.
      if (isDayActive) {
        const cleanedDays = activeDays.filter(d => d !== dayOfWeek);
        setValue('activePlanDays', cleanedDays);
        setValue(`${dayOfWeek}`, []);
      } else {
        setValue('activePlanDays', [...activeDays, dayOfWeek]);
        setValue(`${dayOfWeek}`, [{ startTime: '00:00', endTime: '24:00' }]);
      }
    } else {
      if (isDayActive) {
        const cleanedDays = activeDays.filter(d => d !== dayOfWeek);
        setValue('activePlanDays', cleanedDays);
        setValue(`${dayOfWeek}`, []);
      } else {
        setValue('activePlanDays', [...activeDays, dayOfWeek]);
        setValue(`${dayOfWeek}`, [{ startTime: null, endTime: null }]);
      }
    }
  };

  const addTimeSlots = () => {
    const prevSlots = getValues(dayOfWeek) ?? [];
    setValue(`${dayOfWeek}`, [
      ...prevSlots,
      { startTime: null, endTime: null },
    ]);
  };

  const removeTimeSlot = index => {
    remove(index);

    const hasOnlyOneEntry = fields.length === 1;
    if (hasOnlyOneEntry) {
      const activeDays = getValues('activePlanDays') ?? [];
      const cleanedDays = activeDays.filter(d => d !== dayOfWeek);
      setValue('activePlanDays', cleanedDays);
      setValue(`${dayOfWeek}`, []);
    }
  };

  return (
    <View>
      <View style={styles.entriesStyle}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleWeeksCheckBox}
          style={styles.button}
        >
          <CheckBox checked={!!entries.length} onPress={handleWeeksCheckBox} />
          <Text style={styles.dayText}>{DAYMAP[dayOfWeek]}</Text>
        </TouchableOpacity>
      </View>
      {!useFullDays ? (
        <>
          <View>
            {fields.map((field, index) => {
              // Pick available start hours
              const pickUnreservedStartHours = h =>
                !getEntryStartTimes(index).includes(h);
              const availableStartHours = ALL_START_HOURS.filter(
                pickUnreservedStartHours,
              );
              // Pick available end hours
              const pickUnreservedEndHours = h =>
                !getEntryEndTimes(index).includes(h);
              const availableEndHours = ALL_END_HOURS.filter(
                pickUnreservedEndHours,
              );

              return !useFullDays ? (
                <TimeRangeSelects
                  key={field.id}
                  index={index}
                  value={field}
                  entries={entries}
                  control={control}
                  availableStartHours={availableStartHours}
                  availableEndHours={availableEndHours}
                  update={update}
                  onRemove={removeTimeSlot}
                  t={t}
                />
              ) : null;
            })}
          </View>
          {entries.length ? (
            <View style={styles.addAnotherSection}>
              <TouchableOpacity
                onPress={addTimeSlots}
                style={styles.addAnotherStyle}
              >
                <Text style={styles.addAnotherText}>
                  {t('EditListingAvailabilityPlanForm.addAnother')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </>
      ) : null}

      {noBottomBorder && <View style={styles.bottomView} />}
    </View>
  );
};

export default AvailabilityPlanEntries;

const styles = StyleSheet.create({
  entriesStyle: {
    flexDirection: 'row',
    paddingVertical: widthScale(10),
    padding: widthScale(10),
  },
  dayText: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.light,
  },
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: widthScale(10),
  },
  bottomView: {
    borderBottomWidth: 1,
    borderColor: colors.lightGrey,
  },
  addAnotherSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  addAnotherStyle: {
    paddingVertical: widthScale(10),
    marginBottom: widthScale(5),
    paddingHorizontal: widthScale(10),
  },
  addAnotherText: {
    fontSize: fontScale(14),
    color: colors.black,
  },
});
