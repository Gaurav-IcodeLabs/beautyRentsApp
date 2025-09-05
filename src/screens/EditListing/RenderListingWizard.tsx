/* eslint-disable react/no-unstable-nested-components */
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { EditListingTabs, ListingState } from '../../appTypes';
import { store } from '../../sharetribeSetup';
import {
  requestCreateListingDraft,
  requestPublishListingDraft,
  requestUpdateListing,
  resetEditListing,
} from './EditListing.slice';
import {
  EditListingDeliveryPanel,
  EditListingDetailsPanel,
  EditListingLocationPanel,
  EditListingPhotosPanel,
  EditListingPricingAndStockPanel,
  EditListingPricingPanel,
} from './components';
import EditListingAvailabilityPanel from './components/EditListingAvailabilityPanel/EditListingAvailabilityPanel';
import { tabLabelAndSubmit } from './helper';
interface props {
  onTabChange: (value: boolean) => void;
  tab: string;
  config: any;
  listing: any;
  marketplaceTabs: string[];
  isNewListingFlow: boolean;
  isPriceDisabled: boolean;
  processName: string;
}

const RenderListingWizard = (props: props) => {
  const {
    isNewListingFlow,
    isPriceDisabled,
    processName,
    onTabChange,
    tab,
    config,
    listing,
    inProgress,
    marketplaceTabs,
    ...rest
  } = props;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const tabTranslations = tabLabelAndSubmit(
    t,
    tab,
    isNewListingFlow,
    isPriceDisabled,
    processName,
  );
  const tabSubmitButtonText = tabTranslations.submitButton;
  const onCompleteEditListingWizardTab = async (
    tab: string,
    values: object,
    moveToNextScreen: boolean,
  ) => {
    try {
      const isNewURI = !listing?.id?.uuid;
      const state = listing?.attributes?.state;
      const dispatch = store.dispatch;

      const onUpdateListingOrCreateListingDraft = isNewURI
        ? (values: object) =>
            dispatch(requestCreateListingDraft({ ...values, config }))
        : (values: object) =>
            dispatch(requestUpdateListing({ ...values, config }));

      const updateListingValues = isNewURI
        ? values
        : { ...values, id: listing.id };

      await onUpdateListingOrCreateListingDraft(updateListingValues);
      if (
        state === ListingState.LISTING_STATE_DRAFT &&
        tab === marketplaceTabs[marketplaceTabs.length - 1]
      ) {
        //publish listing and route to home screen for now
        await dispatch(requestPublishListingDraft(listing?.id));
        dispatch(resetEditListing());
        navigation.navigate('Main');
        return;
      } else if (
        state === ListingState.LISTING_STATE_PUBLISHED &&
        tab === marketplaceTabs[marketplaceTabs.length - 1]
      ) {
        // if listing is published then route to main screen
        dispatch(resetEditListing());
        navigation.navigate('Main');
        return;
      }
      if (moveToNextScreen) {
        onTabChange(true);
      }
    } catch (error) {
      console.log('failed to do task', error);
    }
  };

  const RenderPanel = () => {
    switch (tab) {
      case EditListingTabs.DETAILS: {
        return (
          <EditListingDetailsPanel
            tabSubmitButtonText={tabSubmitButtonText}
            config={config}
            listing={listing}
            onSubmit={
              values => onCompleteEditListingWizardTab(tab, values, true) //moveToNextScreen
            }
          />
        );
      }

      case EditListingTabs.PRICING_AND_STOCK: {
        return (
          <EditListingPricingAndStockPanel
            tabSubmitButtonText={tabSubmitButtonText}
            marketplaceCurrency={config.currency}
            listingMinimumPriceSubUnits={config.listingMinimumPriceSubUnits}
            onSubmit={
              (values: object) =>
                onCompleteEditListingWizardTab(tab, values, true) //moveToNextScreen
            }
            listing={listing}
            listingTypes={config.listing.listingTypes}
          />
        );
      }

      case EditListingTabs.PRICING: {
        return (
          <EditListingPricingPanel
            tabSubmitButtonText={tabSubmitButtonText}
            marketplaceCurrency={config.currency}
            listingMinimumPriceSubUnits={config.listingMinimumPriceSubUnits}
            onSubmit={
              (values: object) =>
                onCompleteEditListingWizardTab(tab, values, true) //moveToNextScreen
            }
            listing={listing}
          />
        );
      }

      case EditListingTabs.DELIVERY: {
        return (
          <EditListingDeliveryPanel
            listing={listing}
            tabSubmitButtonText={tabSubmitButtonText}
            marketplaceCurrency={config.currency}
            listingTypes={config.listing.listingTypes}
            onSubmit={(values: object) =>
              onCompleteEditListingWizardTab(tab, values, true)
            }
          />
        );
      }

      case EditListingTabs.LOCATION: {
        return (
          <EditListingLocationPanel
            tabSubmitButtonText={tabSubmitButtonText}
            listing={listing}
            onSubmit={
              (values: object) =>
                onCompleteEditListingWizardTab(tab, values, true) //moveToNextScreen
            }
          />
        );
      }

      case EditListingTabs.PHOTOS: {
        return (
          <EditListingPhotosPanel
            tabSubmitButtonText={tabSubmitButtonText}
            listingImageConfig={config.layout.listingImage}
            listing={listing}
            onSubmit={
              (values: object) =>
                onCompleteEditListingWizardTab(tab, values, true) //moveToNextScreen
            }
          />
        );
      }

      case EditListingTabs.AVAILABILITY: {
        return (
          <EditListingAvailabilityPanel
            tabSubmitButtonText={tabSubmitButtonText}
            listing={listing}
            onTabChange={onTabChange} // onTabChange passed => const [valuesFromLastSubmit, setValuesFromLastSubmit] = useState(null) not getting set due to asynchronus function inside the component  EditListingAvailabilityPanel
            onSubmit={(values: object, moveToNextScreen: boolean) => {
              return onCompleteEditListingWizardTab(
                tab,
                values,
                moveToNextScreen,
              );
            }}
            // adding removing props according to need
            // allExceptions={allExceptions}
            // weeklyExceptionQueries={weeklyExceptionQueries}
            // monthlyExceptionQueries={monthlyExceptionQueries}
            // onFetchExceptions={onFetchExceptions}
            // onAddAvailabilityException={onAddAvailabilityException}
            // onDeleteAvailabilityException={onDeleteAvailabilityException}
            // onNextTab={() =>
            //   redirectAfterDraftUpdate(
            //     listing.id,
            //     params,
            //     tab,
            //     marketplaceTabs,
            //     history,
            //     routeConfiguration
            //   )
            // }
            // config={config}
            // history={history}
            // routeConfiguration={routeConfiguration}
            // {...panelProps(AVAILABILITY)}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <RenderPanel />
    </View>
  );
};

export default RenderListingWizard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
});
