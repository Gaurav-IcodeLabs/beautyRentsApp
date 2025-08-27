import React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native'
import { cross } from '../../../../../assets'
import { Button } from '../../../../../components'
import { useTypedSelector } from '../../../../../sharetribeSetup'
import { fontWeight } from '../../../../../theme'
import { fontScale, heightScale, widthScale } from '../../../../../util'
import { updateInProgressSelector } from '../../../EditListing.slice'
import AvailabilityPlanEntries from './AvailabilityPlanEntries'
import FieldTimeZoneSelect from './FieldTimeZoneSelect'

const EditListingAvailabilityPlanForm = props => {
  const { t } = useTranslation()
  const updateInProgress = useTypedSelector(updateInProgressSelector)
  const {
    listingTitle,
    availabilityPlan,
    weekdays,
    useFullDays,
    onSubmit,
    initialValues,
    isEditPlanModalOpen,
    onCloseEditPlan,
  } = props

  const { control, handleSubmit, setValue, getValues, watch } = useForm({
    defaultValues: initialValues,
  })
  const values = useWatch({ control })

  const concatDayEntriesReducer = (entries, day) =>
    values[day] ? entries.concat(values[day]) : entries

  const hasUnfinishedEntries = !!weekdays
    .reduce(concatDayEntriesReducer, [])
    .find(e => !e.startTime || !e.endTime)

  const submitDisabled = hasUnfinishedEntries
  const activePlans = watch('activePlanDays');
  return (
    <Modal
      visible={isEditPlanModalOpen}
      animationType="fade"
      onRequestClose={onCloseEditPlan}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.closeContainerStyle}
          onPress={onCloseEditPlan}>
          <Image source={cross} style={styles.crossImageStyle} />
        </TouchableOpacity>
        <Text style={styles.tableTitle}>
          {t('EditListingAvailabilityPlanForm.title', { listingTitle })}
        </Text>

        <FieldTimeZoneSelect control={control} name="timezone" />
        <Text style={styles.modalTitle}>
          {t('EditListingAvailabilityPlanForm.hoursOfOperationTitle')}
        </Text>
        {weekdays.map(w => {
          return (
            <AvailabilityPlanEntries
              dayOfWeek={w}
              useFullDays={useFullDays}
              key={w}
              control={control}
              getValues={getValues}
              setValue={setValue}
            />
          )
        })}
        <Button
          text={t('EditListingAvailabilityPlanForm.saveSchedule')}
          loading={updateInProgress}
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
          disabled={!activePlans || activePlans.length === 0}
        />
      </ScrollView>
    </Modal>
  )
}

export default EditListingAvailabilityPlanForm

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: widthScale(22),
    padding: widthScale(20),
  },
  closeContainerStyle: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  crossImageStyle: {
    width: widthScale(20),
    height: widthScale(20),
  },
  button: {
    marginTop: widthScale(30),
  },
  tableTitle: {
    fontSize: fontScale(18),
    fontWeight: fontWeight.semiBold,
    letterSpacing: fontScale(0.02),
    marginVertical: heightScale(5),
  },
  modalTitle: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    lineHeight: fontScale(21),
  },
})
