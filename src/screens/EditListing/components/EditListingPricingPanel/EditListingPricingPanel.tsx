import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { types, widthScale } from '../../../../util';
import { Heading } from '../../../../components';
import { Headings, Listing, ListingState } from '../../../../appTypes';
import { Trans } from 'react-i18next';
import EditListingPricingForm from './EditListingPricingForm';
import { useTypedSelector } from '../../../../sharetribeSetup';
import {
  publishDraftInProgressSelector,
  updateInProgressSelector,
} from '../../EditListing.slice';

const getInitialValues = (params: { listing: Listing }) => {
  const { listing } = params;
  const { price, publicData } = listing?.attributes || {};
  const { price_per_day } = publicData || {};
  const currency = price?.currency;
  const createMoney = value => {
    const usedCurrency = currency;
    return value && !isNaN(value) && usedCurrency
      ? new types.Money(value * 100, usedCurrency)
      : null;
  };

  return { price, price_per_day: createMoney(price_per_day) };
};

interface props {
  marketplaceCurrency: any;
  listingMinimumPriceSubUnits: any;
  listing: Listing;
  tabSubmitButtonText: string;
  onSubmit: (values: object) => void;
}

export const EditListingPricingPanel = (props: props) => {
  const updateInProgress = useTypedSelector(updateInProgressSelector);
  const publishDraftInProgress = useTypedSelector(
    publishDraftInProgressSelector,
  );
  const inProgress = updateInProgress || publishDraftInProgress;
  const {
    marketplaceCurrency,
    listingMinimumPriceSubUnits,
    listing,
    tabSubmitButtonText,
    onSubmit,
  } = props;
  const initialValues = getInitialValues(props);
  const isPublished =
    listing?.id &&
    listing?.attributes?.state !== ListingState.LISTING_STATE_DRAFT;
  const priceCurrencyValid =
    marketplaceCurrency && initialValues.price instanceof types.Money
      ? initialValues.price.currency === marketplaceCurrency
      : !!marketplaceCurrency;
  const unitType = listing?.attributes?.publicData?.unitType;

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
            const { price, price_per_day } = values;
            console.log('values', values);

            // New values for listing attributes
            const updateValues = {
              price: new types.Money(price * 100, marketplaceCurrency),
              ...(price_per_day ? { publicData: { price_per_day } } : {}),
            };
            // console.log('updateValues', updateValues);
            // return;

            onSubmit(updateValues);
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
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: widthScale(20),
    marginHorizontal: widthScale(20),
    overflow: 'visible',
  },
});
