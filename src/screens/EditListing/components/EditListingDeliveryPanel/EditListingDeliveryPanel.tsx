import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import {
  displayDeliveryPickup,
  displayDeliveryShipping,
  STOCK_MULTIPLE_ITEMS,
  widthScale,
  types as sdkTypes,
} from '../../../../util'
import { Trans, useTranslation } from 'react-i18next'
import { Headings, ListingState } from '../../../../appTypes'
import { Heading } from '../../../../components'
import EditListingDeliveryForm from './EditListingDeliveryForm'
import { useTypedSelector } from '../../../../sharetribeSetup'
import {
  publishDraftInProgressSelector,
  updateInProgressSelector,
} from '../../EditListing.slice'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
const { Money } = sdkTypes

const getInitialValues = props => {
  const { listing, listingTypes, marketplaceCurrency } = props
  const { geolocation, publicData, price } = listing?.attributes || {}

  const listingType = listing?.attributes?.publicData?.listingType
  const listingTypeConfig = listingTypes.find(
    conf => conf.listingType === listingType,
  )
  const displayShipping = displayDeliveryShipping(listingTypeConfig)
  const displayPickup = displayDeliveryPickup(listingTypeConfig)
  const displayMultipleDelivery = displayShipping && displayPickup

  // Only render current search if full place object is available in the URL params
  // TODO bounds are missing - those need to be queried directly from Google Places
  const locationFieldsPresent = publicData?.location?.address && geolocation
  const location = publicData?.location || {}
  const { address, building } = location
  const {
    shippingEnabled,
    pickupEnabled,
    shippingPriceInSubunitsOneItem,
    shippingPriceInSubunitsAdditionalItems,
  } = publicData
  const deliveryOptions = []

  if (shippingEnabled || (!displayMultipleDelivery && displayShipping)) {
    deliveryOptions.push('shipping')
  }
  if (pickupEnabled || (!displayMultipleDelivery && displayPickup)) {
    deliveryOptions.push('pickup')
  }

  const currency = price?.currency || marketplaceCurrency
  const shippingOneItemAsMoney =
    shippingPriceInSubunitsOneItem != null
      ? new Money(shippingPriceInSubunitsOneItem, currency)
      : null
  const shippingAdditionalItemsAsMoney =
    shippingPriceInSubunitsAdditionalItems != null
      ? new Money(shippingPriceInSubunitsAdditionalItems, currency)
      : null

  // Initial values for the form
  return {
    building,
    location: locationFieldsPresent
      ? {
          search: address,
          selectedPlace: { address, origin: geolocation },
        }
      : { search: undefined, selectedPlace: undefined },
    deliveryOptions,
    shippingPriceInSubunitsOneItem: shippingOneItemAsMoney,
    shippingPriceInSubunitsAdditionalItems: shippingAdditionalItemsAsMoney,
  }
}

interface props {
  listing: any
  tabSubmitButtonText: any
  listingTypes: any
  marketplaceCurrency: string
  onSubmit: (value: any) => {}
}

export const EditListingDeliveryPanel = (props: props) => {
  const { t } = useTranslation()
  const updateInProgress = useTypedSelector(updateInProgressSelector)
  const publishDraftInProgress = useTypedSelector(
    publishDraftInProgressSelector,
  )
  const inProgress = updateInProgress || publishDraftInProgress
  const {
    listing,
    listingTypes,
    tabSubmitButtonText,
    onSubmit,
    marketplaceCurrency,
  } = props
  const { publicData, state } = listing?.attributes || {}
  const isPublished = listing?.id && state !== ListingState.LISTING_STATE_DRAFT
  const priceCurrencyValid =
    listing?.attributes?.price?.currency === marketplaceCurrency
  const listingType = listing?.attributes?.publicData?.listingType
  const listingTypeConfig = listingTypes.find(
    conf => conf.listingType === listingType,
  )
  const hasStockInUse = listingTypeConfig.stockType === STOCK_MULTIPLE_ITEMS

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}>
      {isPublished ? (
        <Heading
          fieldType={Headings.HEADING1}
          content={
            <Trans
              i18nKey="EditListingDeliveryPanel.title"
              values={{ listingTitle: listing.attributes.title }}
            />
          }
          containerStyle={styles.headingContainer}
        />
      ) : (
        <Heading
          fieldType={Headings.HEADING1}
          content={
            <Trans i18nKey="EditListingDeliveryPanel.createListingTitle" />
          }
          containerStyle={styles.headingContainer}
        />
      )}
      {priceCurrencyValid ? (
        <EditListingDeliveryForm
          initialValues={getInitialValues(props)}
          inProgress={inProgress}
          listingTypeConfig={listingTypeConfig}
          marketplaceCurrency={marketplaceCurrency}
          hasStockInUse={hasStockInUse}
          saveActionMsg={tabSubmitButtonText}
          onSubmit={values => {
            const {
              building = '',
              address,
              geolocation,
              shippingPriceInSubunitsOneItem,
              shippingPriceInSubunitsAdditionalItems,
              deliveryOptions,
            } = values

            const shippingEnabled = deliveryOptions.includes('shipping')
            const pickupEnabled = deliveryOptions.includes('pickup')
            const newshippingPriceInSubunitsOneItem = new Money(
              shippingPriceInSubunitsOneItem * 100,
              marketplaceCurrency,
            )
            const newshippingPriceInSubunitsAdditionalItems = new Money(
              shippingPriceInSubunitsAdditionalItems * 100,
              marketplaceCurrency,
            )

            const pickupDataMaybe =
              pickupEnabled && address
                ? { location: { address, building } }
                : {}

            const shippingDataMaybe =
              shippingEnabled && shippingPriceInSubunitsOneItem != null
                ? {
                    // Note: we only save the "amount" because currency should not differ from listing's price.
                    // Money is always dealt in subunits (e.g. cents) to avoid float calculations.
                    shippingPriceInSubunitsOneItem:
                      newshippingPriceInSubunitsOneItem.amount,
                    shippingPriceInSubunitsAdditionalItems:
                      newshippingPriceInSubunitsAdditionalItems?.amount,
                  }
                : {}

            // New values for listing attributes
            const updateValues = {
              // geolocation: origin,
              geolocation: geolocation,
              publicData: {
                pickupEnabled,
                ...pickupDataMaybe,
                shippingEnabled,
                ...shippingDataMaybe,
              },
            }
            // Save the initialValues to state
            // LocationAutocompleteInput doesn't have internal state
            // and therefore re-rendering would overwrite the values during XHR call.
            onSubmit(updateValues)
          }}
        />
      ) : (
        <Text>{t('EditListingPricingPanel.listingPriceCurrencyInvalid')}</Text>
      )}
      <View style={styles.bottomSpacer} />
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: widthScale(20),
  },
  headingContainer: {
    marginBottom: widthScale(20),
    marginLeft: widthScale(20),
  },
  bottomSpacer: { height: widthScale(100) },
})
