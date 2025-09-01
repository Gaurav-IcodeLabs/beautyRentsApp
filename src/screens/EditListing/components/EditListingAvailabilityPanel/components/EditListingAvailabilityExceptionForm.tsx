import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { cross } from '../../../../../assets';
import { Button } from '../../../../../components';
import RadioButton from '../../../../../components/RadioButton/RadioButton';
import { useTypedSelector } from '../../../../../sharetribeSetup';
import { fontWeight } from '../../../../../theme';
import { fontScale, heightScale, widthScale } from '../../../../../util';
import {
  addExceptionInProgressSelector,
  allExceptionsSelector,
} from '../../../EditListing.slice';
import ExceptionDateRange from './ExceptionDateRange';
import { Controller, useForm } from 'react-hook-form';
import ExceptionDateTimeRange from './ExceptionDateTimeRange';

const AVAILABLE = 'available';
const NOT_AVAILABLE = 'not-available';

const EditListingAvailabilityExceptionForm = props => {
  const { t } = useTranslation();
  const {
    isEditExceptionsModalOpen,
    onCloseEditPlan,
    listingId,
    onSubmit,
    isDaily,
    timeZone,
    useFullDays,
  } = props;
  const allExceptions = useTypedSelector(allExceptionsSelector);
  const addExceptionInProgress = useTypedSelector(
    addExceptionInProgressSelector,
  );

  const { control, setValue, watch, handleSubmit } = useForm({
    defaultValues: {
      availability: '',
      exceptionStartDate: '',
      exceptionEndDate: '',
      exceptionStartTime: null,
      exceptionEndTime: null,
    },
    mode: 'onChange',
  });
  const {
    exceptionStartDate,
    exceptionEndDate,
    availability,
    exceptionStartTime,
    exceptionEndTime,
  } = watch();

  const disableButton =
    !availability?.length ||
    !exceptionStartDate?.length ||
    !exceptionEndDate?.length ||
    !exceptionStartTime ||
    !exceptionEndTime;

  return (
    <Modal
      visible={isEditExceptionsModalOpen}
      animationType="fade"
      onRequestClose={onCloseEditPlan}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <TouchableOpacity
          style={styles.closeContainerStyle}
          onPress={onCloseEditPlan}
        >
          <Image source={cross} style={styles.crossImageStyle} />
        </TouchableOpacity>
        <Text style={styles.tableTitle}>
          {t('EditListingAvailabilityExceptionForm.title')}
        </Text>
        <Controller
          name={'availability'}
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <>
              <TouchableOpacity
                style={styles.radioContainer}
                onPress={() => onChange(AVAILABLE)}
              >
                <RadioButton
                  isActive={value === AVAILABLE}
                  size={widthScale(15)}
                  onPress={() => onChange(AVAILABLE)}
                />
                <Text style={styles.textRadio}>
                  {t('EditListingAvailabilityExceptionForm.available')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioContainer}
                onPress={() => onChange(NOT_AVAILABLE)}
              >
                <RadioButton
                  isActive={value === NOT_AVAILABLE}
                  size={widthScale(15)}
                  onPress={() => onChange(AVAILABLE)}
                />
                <Text style={styles.textRadio}>
                  {t('EditListingAvailabilityExceptionForm.notAvailable')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        />

        {useFullDays ? (
          <ExceptionDateRange
            control={control}
            onSumbit={values => {
              setValue('exceptionStartDate', values.selectedStartDate, {
                shouldValidate: true,
              });
              setValue('exceptionEndDate', values.selectedEndDate, {
                shouldValidate: true,
              });
            }}
            listingId={listingId}
            // allExceptions={allExceptions}
            timeZone={timeZone}
            isDaily={isDaily}
            //    monthlyExceptionQueries={monthlyExceptionQueries}
            //    onMonthChanged={onMonthChanged}
          />
        ) : (
          <ExceptionDateTimeRange
            control={control}
            allExceptions={allExceptions}
            timeZone={timeZone}
            listingId={listingId}
            setValue={setValue}
          />
        )}

        <Button
          loading={addExceptionInProgress}
          text={t('EditListingAvailabilityExceptionForm.addException')}
          onPress={handleSubmit(onSubmit)}
          disabled={disableButton}
        />
      </ScrollView>
    </Modal>
  );
};

export default EditListingAvailabilityExceptionForm;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    marginTop: widthScale(60),
    paddingHorizontal: widthScale(20),
    paddingBottom: widthScale(50),
  },
  closeContainerStyle: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  crossImageStyle: {
    width: widthScale(20),
    height: widthScale(20),
  },
  tableTitle: {
    fontSize: fontScale(18),
    fontWeight: fontWeight.semiBold,
    letterSpacing: fontScale(0.02),
    marginVertical: heightScale(15),
  },
  radioContainer: {
    flexDirection: 'row',
    padding: widthScale(10),
    gap: widthScale(10),
    alignItems: 'center',
  },
  textRadio: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.medium,
  },
  modalTitle: {
    fontSize: fontScale(18),
    fontWeight: fontWeight.medium,
    lineHeight: fontScale(21),
    marginVertical: heightScale(5),
  },
  textStyle: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    lineHeight: fontScale(17),
  },
});
