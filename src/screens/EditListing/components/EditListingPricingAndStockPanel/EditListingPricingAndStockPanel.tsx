import React from 'react'
import { Trans } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { Headings, Listing, ListingState } from '../../../../appTypes'
import { Heading } from '../../../../components'
import { useTypedSelector } from '../../../../sharetribeSetup'
import { STOCK_INFINITE_ITEMS, types, widthScale } from '../../../../util'
import {
  publishDraftInProgressSelector,
  updateInProgressSelector,
} from '../../EditListing.slice'
import EditListingPricingAndStockForm from './EditListingPricingAndStockForm'

interface props {
  marketplaceCurrency: any
  listingMinimumPriceSubUnits: any
  listing: Listing
  tabSubmitButtonText: string
  onSubmit: (values: object) => void
}

const BILLIARD = 1000000000000000

const getListingTypeConfig = (publicData, listingTypes) => {
  const selectedListingType = publicData.listingType
  return listingTypes.find(conf => conf.listingType === selectedListingType)
}

const getInitialValues = props => {
  const { listing, listingTypes } = props
  const isPublished =
    listing?.id &&
    listing?.attributes?.state !== ListingState.LISTING_STATE_DRAFT
  const price = listing?.attributes?.price
  const currentStock = listing?.currentStock

  const publicData = listing?.attributes?.publicData
  const listingTypeConfig = getListingTypeConfig(publicData, listingTypes)
  const hasInfiniteStock = STOCK_INFINITE_ITEMS.includes(
    listingTypeConfig?.stockType,
  )

  // The listing resource has a relationship: `currentStock`,
  // which you should include when making API calls.
  // Note: infinite stock is refilled to billiard using "stockUpdateMaybe"
  const currentStockQuantity = currentStock?.attributes?.quantity
  const stock =
    currentStockQuantity != null
      ? currentStockQuantity
      : isPublished
        ? 0
        : hasInfiniteStock
          ? BILLIARD
          : 1
  const stockTypeInfinity = []

  return { price, stock, stockTypeInfinity }
}

export const EditListingPricingAndStockPanel = (props: props) => {
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
    listingTypes,
  } = props

  const initialValues = getInitialValues(props)

  // Form needs to know data from listingType
  const publicData = listing?.attributes?.publicData
  const unitType = publicData.unitType
  const listingTypeConfig = getListingTypeConfig(publicData, listingTypes)

  const hasInfiniteStock = STOCK_INFINITE_ITEMS.includes(
    listingTypeConfig?.stockType,
  )

  const isPublished =
    listing?.id &&
    listing?.attributes?.state !== ListingState.LISTING_STATE_DRAFT
  const priceCurrencyValid =
    marketplaceCurrency && initialValues.price instanceof types.Money
      ? initialValues.price?.currency === marketplaceCurrency
      : !!marketplaceCurrency

  return (
    <View style={styles.container}>
      {isPublished ? (
        <Heading
          fieldType={Headings.HEADING1}
          content={
            <Trans
              i18nKey="EditListingPricingAndStockPanel.title"
              values={{ listingTitle: listing.attributes.title }}
            />
          }
        />
      ) : (
        <Heading
          fieldType={Headings.HEADING1}
          content={
            <Trans i18nKey="EditListingPricingAndStockPanel.createListingTitle" />
          }
        />
      )}
      {priceCurrencyValid ? (
        <EditListingPricingAndStockForm
          initialValues={initialValues}
          inProgress={inProgress}
          saveActionMsg={tabSubmitButtonText}
          unitType={unitType}
          listingMinimumPriceSubUnits={listingMinimumPriceSubUnits}
          listingType={listingTypeConfig}
          marketplaceCurrency={marketplaceCurrency}
          onSubmit={values => {
            const { price, stock, stockTypeInfinity } = values

            // Update stock only if the value has changed, or stock is infinity in stockType,
            // but not current stock is a small number (might happen with old listings)
            // NOTE: this is going to be used on a separate call to API
            // in EditListingPage.duck.js: sdk.stock.compareAndSet();

            const hasStockTypeInfinityChecked =
              stockTypeInfinity?.[0] === 'infinity'
            const hasNoCurrentStock =
              listing?.currentStock?.attributes?.quantity == null
            const hasStockQuantityChanged =
              stock && stock !== initialValues.stock
            // currentStockQuantity is null or undefined, return null - otherwise use the value
            const oldTotal = hasNoCurrentStock ? null : initialValues.stock
            const stockUpdateMaybe =
              hasInfiniteStock &&
              (hasNoCurrentStock || hasStockTypeInfinityChecked)
                ? {
                    stockUpdate: {
                      oldTotal,
                      newTotal: BILLIARD,
                    },
                  }
                : hasNoCurrentStock || hasStockQuantityChanged
                  ? {
                      stockUpdate: {
                        oldTotal,
                        newTotal: stock,
                      },
                    }
                  : {}

            // New values for listing attributes
            const updateValues = {
              price: new types.Money(price * 100, marketplaceCurrency),
              ...stockUpdateMaybe,
            }

            onSubmit(updateValues)
          }}
        />
      ) : (
        <View>
          <Text>
            <Trans
              i18nKey="EditListingPricingAndStockPanel.listingPriceCurrencyInvalid"
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
