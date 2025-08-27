import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { types, widthScale } from '../../../../util'
import { Heading } from '../../../../components'
import { Headings, Listing, ListingState } from '../../../../appTypes'
import { Trans } from 'react-i18next'
import EditListingPricingForm from './EditListingPricingForm'
import { useTypedSelector } from '../../../../sharetribeSetup'
import {
  publishDraftInProgressSelector,
  updateInProgressSelector,
} from '../../EditListing.slice'

const getInitialValues = (params: { listing: Listing }) => {
  const { listing } = params
  const { price } = listing?.attributes || {}

  return { price }
}

interface props {
  marketplaceCurrency: any
  listingMinimumPriceSubUnits: any
  listing: Listing
  tabSubmitButtonText: string
  onSubmit: (values: object) => void
}

export const EditListingPricingPanel = (props: props) => {
  const updateInProgress = useTypedSelector(updateInProgressSelector)
  const publishDraftInProgress = useTypedSelector(
    publishDraftInProgressSelector,
  )
  const inProgress = updateInProgress || publishDraftInProgress
  const {
    marketplaceCurrency,
    listingMinimumPriceSubUnits,
    listing,
    tabSubmitButtonText,
    onSubmit,
  } = props
  const initialValues = getInitialValues(props)
  const isPublished =
    listing?.id &&
    listing?.attributes?.state !== ListingState.LISTING_STATE_DRAFT
  const priceCurrencyValid =
    marketplaceCurrency && initialValues.price instanceof types.Money
      ? initialValues.price.currency === marketplaceCurrency
      : !!marketplaceCurrency
  const unitType = listing?.attributes?.publicData?.unitType

  return (
    <View style={styles.container}>
      {isPublished ? (
        <Heading
          fieldType={Headings.HEADING1}
          content={
            <Trans
              i18nKey="EditListingPricingPanel.title"
              values={{ listingTitle: listing.attributes.title }}
            />
          }
        />
      ) : (
        <Heading
          fieldType={Headings.HEADING1}
          content={
            <Trans i18nKey="EditListingPricingPanel.createListingTitle" />
          }
        />
      )}

      {priceCurrencyValid ? (
        <EditListingPricingForm
          initialValues={initialValues}
          inProgress={inProgress}
          saveActionMsg={tabSubmitButtonText}
          unitType={unitType}
          listingMinimumPriceSubUnits={listingMinimumPriceSubUnits}
          onSubmit={values => {
            const { price } = values

            // New values for listing attributes
            const updateValues = {
              price: new types.Money(price * 100, marketplaceCurrency),
            }

            onSubmit(updateValues)
          }}
        />
      ) : (
        <View>
          <Text>
            <Trans
              i18nKey="EditListingPricingPanel.listingPriceCurrencyInvalid"
              values={{ marketplaceCurrency }}
            />
          </Text>
        </View>
      )}
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
