import React from 'react'
import { Trans } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Headings, Listing, ListingState } from '../../../../appTypes'
import { Heading } from '../../../../components'
import { types, widthScale } from '../../../../util'
import EditListingLocationForm from './EditListingLocationForm'
import { useTypedSelector } from '../../../../sharetribeSetup'
import {
  publishDraftInProgressSelector,
  updateInProgressSelector,
} from '../../EditListing.slice'

const { LatLng } = types

const getInitialValues = (props: { listing: Listing }) => {
  const { listing } = props
  const { geolocation, publicData } = listing?.attributes || {}

  // Only render current search if full place object is available in the URL params
  // TODO bounds are missing - those need to be queried directly from Google Places
  const locationFieldsPresent = publicData?.location?.address && geolocation
  const location = publicData?.location || {}
  const { address, building } = location

  return {
    building,
    ...(locationFieldsPresent
      ? {
          address,
          geolocation: {
            lat: geolocation?.lat,
            lng: geolocation?.lng,
          },
        }
      : null),
  }
}

interface EditListingLocationPanelProps {
  listing: Listing
  onSubmit: (values: object) => void
  tabSubmitButtonText: string
}

export const EditListingLocationPanel = (
  props: EditListingLocationPanelProps,
) => {
  const updateInProgress = useTypedSelector(updateInProgressSelector)
  const publishDraftInProgress = useTypedSelector(
    publishDraftInProgressSelector,
  )
  const inProgress = updateInProgress || publishDraftInProgress
  const { listing, onSubmit, tabSubmitButtonText } = props

  const isPublished =
    listing?.id &&
    listing?.attributes.state !== ListingState.LISTING_STATE_DRAFT

  return (
    <View style={styles.container}>
      {isPublished ? (
        <Heading
          fieldType={Headings.HEADING1}
          content={
            <Trans
              i18nKey="EditListingLocationPanel.title"
              values={{ listingTitle: listing.attributes.title }}
            />
          }
        />
      ) : (
        <Heading
          fieldType={Headings.HEADING1}
          content={
            <Trans i18nKey="EditListingLocationPanel.createListingTitle" />
          }
        />
      )}

      <EditListingLocationForm
        initialValues={getInitialValues(props)}
        inProgress={inProgress}
        saveActionMsg={tabSubmitButtonText}
        onSubmit={values => {
          const { building = '', address, geolocation } = values

          // New values for listing attributes
          const updateValues = {
            geolocation: new LatLng(geolocation.lat, geolocation.lng),
            publicData: {
              location: { address, building },
            },
          }
          onSubmit(updateValues)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: widthScale(20),
    marginHorizontal: widthScale(20),
    overflow: 'visible',
  },
})
