import React, { useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Headings, Listing, ListingState } from '../../../../appTypes'
import { Button } from '../../../../components'
import { useColors, useConfiguration } from '../../../../context'
import { useAppDispatch, useTypedSelector } from '../../../../sharetribeSetup'
import { AppColors, colors, fontWeight } from '../../../../theme'
import { DAY, isFullDay } from '../../../../transactions'
import {
  fontScale,
  getDefaultTimeZone,
  heightScale,
  isIphone8,
  timeOfDayFromLocalToTimeZone,
  timestampToDate,
  widthScale,
} from '../../../../util'
import {
  allExceptionsSelector,
  fetchLoadDataExceptions,
  requestAddAvailabilityException,
} from '../../EditListing.slice'
import {
  WEEKDAYS,
  createAvailabilityPlan,
  createInitialValues,
  rotateDays,
} from './EditListingAvailabilityPanel.helper'
import { Trans, useTranslation } from 'react-i18next'
import EditListingAvailabilityPlanForm from './components/EditListingAvailabilityPlanForm'
import WeeklyCalendar from './components/WeeklyCalendar'
import EditListingAvailabilityExceptionForm from './components/EditListingAvailabilityExceptionForm'
import ExceptionList from './components/ExceptionList'
import { Heading } from '../../../../components'

interface EditListingAvailabilityPanelProps {
  listing: Listing
  onSubmit: (values: object, moveToNextScreen: boolean) => void
  onTabChange: (value: boolean) => void
  tabSubmitButtonText: string
}
const EditListingAvailabilityPanel = (
  props: EditListingAvailabilityPanelProps,
) => {
  const { t } = useTranslation()
  const config = useConfiguration()
  const dispatch = useAppDispatch()
  const colors: AppColors = useColors()
  const { listing, onSubmit, onTabChange, tabSubmitButtonText } = props

  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false)
  const [isEditExceptionsModalOpen, setIsEditExceptionsModalOpen] =
    useState(false)
  const allExceptions = useTypedSelector(allExceptionsSelector)
  const firstDayOfWeek = config.localization.firstDayOfWeek
  const listingAttributes = listing?.attributes
  const unitType = listingAttributes?.publicData?.unitType
  const useFullDays = isFullDay(unitType)
  const hasAvailabilityPlan = !!listingAttributes?.availabilityPlan
  const isPublished =
    listing?.id && listingAttributes?.state !== ListingState.LISTING_STATE_DRAFT
  const defaultAvailabilityPlan = {
    type: 'availability-plan/time',
    timezone: getDefaultTimeZone(),
    entries: [
      // { dayOfWeek: 'mon', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'tue', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'wed', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'thu', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'fri', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'sat', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'sun', startTime: '09:00', endTime: '17:00', seats: 1 },
    ],
  }

  const availabilityPlan =
    listingAttributes?.availabilityPlan || defaultAvailabilityPlan
  const initialValues = createInitialValues(availabilityPlan)

  const handleSubmit = values => {
    return onSubmit(createAvailabilityPlan(values), false)
      .then(() => {
        const exceptionParams = {
          listing: listing,
          firstDayOfWeek: 1,
        }
        dispatch(fetchLoadDataExceptions(exceptionParams))
        setIsEditPlanModalOpen(false)
      })
      .catch(e => {
        // Don't close modal if there was an error
      })
  }

  useEffect(() => {
    const exceptionParams = {
      listing: listing,
      firstDayOfWeek: 1,
    }
    dispatch(fetchLoadDataExceptions(exceptionParams))
  }, [])

  //   // Save exception click handler
  const saveException = async values => {
    const {
      availability,
      exceptionStartTime,
      exceptionEndTime,
      exceptionStartDate,
      exceptionEndDate,
    } = values
    const startDate = exceptionStartDate
      ? timeOfDayFromLocalToTimeZone(
          exceptionStartDate,
          availabilityPlan.timezone,
        )
      : null
    const endDate = exceptionEndDate
      ? timeOfDayFromLocalToTimeZone(
          exceptionEndDate,
          availabilityPlan.timezone,
        )
      : null

    // Add one day (24 hours) to the date
    endDate.setDate(endDate.getDate() + 1)

    // TODO: add proper seat handling
    const seats = availability === 'available' ? 1 : 0
    // Exception date/time range is given through FieldDateRangeInput or
    // separate time fields.
    const range = useFullDays
      ? {
          start: startDate,
          end: endDate,
        }
      : {
          start: timestampToDate(exceptionStartTime),
          end: timestampToDate(exceptionEndTime),
        }
    const params = {
      listingId: listing.id,
      seats,
      ...range,
    }

    const response = await dispatch(
      requestAddAvailabilityException(params),
    ).unwrap()

    const exceptionParams = {
      listing: listing,
      firstDayOfWeek: 1,
    }
    dispatch(fetchLoadDataExceptions(exceptionParams))
    setIsEditExceptionsModalOpen(false)
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.mainView}>
        {isPublished ? (
          <Heading
            fieldType={Headings.HEADING1}
            content={
              <Trans
                i18nKey="EditListingAvailabilityPanel.title"
                values={{ listingTitle: listing.attributes.title }}
              />
            }
          />
        ) : (
          <Heading
            fieldType={Headings.HEADING1}
            content={
              <Trans i18nKey="EditListingAvailabilityPanel.createListingTitle" />
            }
          />
        )}

        {!hasAvailabilityPlan ? (
          <Text style={styles.modalTitle}>
            {t('EditListingAvailabilityPanel.availabilityPlanInfo')}
          </Text>
        ) : null}

        <TouchableOpacity onPress={() => setIsEditPlanModalOpen(true)}>
          <Text
            style={[
              styles.modalFooter,
              {
                color: colors.marketplaceColorLight,
              },
            ]}>
            {hasAvailabilityPlan
              ? t('EditListingAvailabilityPanel.editAvailabilityPlan')
              : t('EditListingAvailabilityPanel.setAvailabilityPlan')}
          </Text>
        </TouchableOpacity>

        {hasAvailabilityPlan ? (
          <WeeklyCalendar
            listingId={listing.id}
            availabilityPlan={availabilityPlan}
            isDaily={unitType === DAY}
            useFullDays={useFullDays}
            firstDayOfWeek={firstDayOfWeek}
          />
        ) : null}

        {hasAvailabilityPlan ? (
          <TouchableOpacity onPress={() => setIsEditExceptionsModalOpen(true)}>
            <Text
              style={[
                styles.addException,
                {
                  color: colors.marketplaceColorLight,
                },
              ]}>
              {t('EditListingAvailabilityPanel.addException')}
            </Text>
          </TouchableOpacity>
        ) : null}

        {allExceptions ? (
          <ExceptionList
            listingId={listing.id}
            availabilityPlan={availabilityPlan}
            isDaily={unitType === DAY}
            useFullDays={useFullDays}
            firstDayOfWeek={firstDayOfWeek}
          />
        ) : null}

        {isEditPlanModalOpen ? (
          <EditListingAvailabilityPlanForm
            listingTitle={listingAttributes?.title}
            availabilityPlan={availabilityPlan}
            weekdays={rotateDays(WEEKDAYS, firstDayOfWeek)}
            useFullDays={useFullDays}
            onSubmit={handleSubmit}
            initialValues={initialValues}
            isEditPlanModalOpen={isEditPlanModalOpen}
            onCloseEditPlan={() => setIsEditPlanModalOpen(false)}
          />
        ) : null}

        {isEditExceptionsModalOpen ? (
          <EditListingAvailabilityExceptionForm
            isEditExceptionsModalOpen={isEditExceptionsModalOpen}
            onCloseEditPlan={() => setIsEditExceptionsModalOpen(false)}
            listingId={listing.id}
            onSubmit={saveException}
            isDaily={unitType === DAY}
            timeZone={availabilityPlan.timezone}
            useFullDays={useFullDays}
          />
        ) : null}
        <Button
        text={tabSubmitButtonText}
        onPress={() => onTabChange(true)}
        disabled={!hasAvailabilityPlan}
        loading={false}
        style={[isIphone8() ? styles.buttonVerticalMargin : styles.button]}
      />
      </ScrollView>
      
    </>
  )
}

export default EditListingAvailabilityPanel

const styles = StyleSheet.create({
  mainView: {
    marginHorizontal: widthScale(24),
    flexGrow: 1,
  },
  button: {marginTop: heightScale(20), marginBottom: widthScale(50) },
  buttonVerticalMargin: { marginBottom: heightScale(20) },
  modalTitle: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    lineHeight: fontScale(21),
    marginVertical: heightScale(15),
  },
  modalFooter: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
    lineHeight: fontScale(21),

    marginVertical: heightScale(15),
  },
  addException: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
    lineHeight: fontScale(21),
    color: colors.marketplaceColorLight,
    marginVertical: heightScale(15),
  },
})
