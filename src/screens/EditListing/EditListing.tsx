import {
  NavigationProp,
  ParamListBase,
  RouteProp,
} from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { EditListingTabs, ListingState } from '../../appTypes';
import { ScreenHeader } from '../../components';
import { useConfiguration } from '../../context';
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup';
import { entitiesSelector } from '../../slices/marketplaceData.slice';
import {
  INQUIRY_PROCESS_NAME,
  isBookingProcess,
  isPurchaseProcess,
} from '../../transactions';
import { displayPrice, types as sdkTypes } from '../../util';
import { ensureOwnListing } from '../../util/data';
import HeaderTabs from './components/HeaderTabs/HeaderTabs';
import {
  listingIdSelector,
  requestShowListing,
  resetEditListing,
  selectedListingTypeSelector,
  showListingsErrorSelector,
} from './EditListing.slice';
import {
  getListingTypeConfig,
  getOwnListing,
  TABS_BOOKING,
  TABS_DETAILS_ONLY,
  TABS_INQUIRY,
  TABS_PRODUCT,
  tabsActive,
  tabsForBookingProcess,
  tabsForInquiryProcess,
  tabsForPurchaseProcess,
} from './helper';
import RenderListingWizard from './RenderListingWizard';
import { colors } from '../../theme';

const draftId = '00000000-0000-0000-0000-000000000000';
interface props {
  navigation: NavigationProp<ParamListBase>;
  route: RouteProp<{}>;
}

export const EditListing = (props: props) => {
  const { route } = props;
  const { t } = useTranslation();
  const config = useConfiguration();
  const dispatch = useAppDispatch();
  const selectedListingType = useTypedSelector(selectedListingTypeSelector);
  const [selectedTab, setSelectedTab] = useState(EditListingTabs.DETAILS);
  const [isRequestListing, setIsRequestListing] = useState(false);
  const entities = useTypedSelector(entitiesSelector);
  const listingId = useTypedSelector(listingIdSelector);
  const showListingsError = useTypedSelector(showListingsErrorSelector);

  const handleShowListing = async () => {
    if (route.params?.listingId) {
      try {
        setIsRequestListing(true);
        await dispatch(
          requestShowListing({ id: route.params?.listingId, config }),
        ).unwrap();
      } finally {
        setIsRequestListing(false);
      }
    }
  };

  useEffect(() => {
    handleShowListing();
  }, [route.params?.listingId]);

  //Editlistingpage
  const id = listingId || new sdkTypes.UUID(draftId);
  const currentListing = ensureOwnListing(getOwnListing(entities, id));
  //Editlistingpage

  const validListingTypes = config.listing.listingTypes;
  const listingTypeConfig = getListingTypeConfig(
    currentListing,
    selectedListingType,
    config,
  );

  const existingListingType =
    currentListing.attributes?.publicData?.listingType;
  const invalidExistingListingType = existingListingType && !listingTypeConfig;
  // TODO: displayPrice aka config.defaultListingFields?.price with false value is only available with inquiry process
  //       if it's enabled with other processes, translations for "new" flow needs to be updated.
  const isPriceDisabled = !displayPrice(listingTypeConfig);

  const savedProcessAlias =
    currentListing.attributes?.publicData?.transactionProcessAlias;
  const transactionProcessAlias =
    savedProcessAlias || selectedListingType?.transactionProcessAlias;

  // Transaction process alias is used here, because the process defineds whether the listing is supported
  // I.e. old listings might not be supported through listing types, but client app might still support those processes.
  const processName = transactionProcessAlias
    ? transactionProcessAlias.split('/')[0]
    : validListingTypes.length === 1
    ? validListingTypes[0].transactionType.process
    : INQUIRY_PROCESS_NAME;

  const hasListingTypeSelected =
    existingListingType ||
    selectedListingType ||
    validListingTypes.length === 1;

  const { state: currentListingState } = currentListing.attributes;

  const isNewListingFlow =
    currentListingState !== ListingState.LISTING_STATE_PUBLISHED;
  // For oudated draft listing, we don't show other tabs but the "details"
  const tabs =
    isNewListingFlow && (invalidExistingListingType || !hasListingTypeSelected)
      ? TABS_DETAILS_ONLY
      : isBookingProcess(processName)
      ? tabsForBookingProcess(TABS_BOOKING, listingTypeConfig)
      : isPurchaseProcess(processName)
      ? tabsForPurchaseProcess(TABS_PRODUCT, listingTypeConfig)
      : tabsForInquiryProcess(TABS_INQUIRY, listingTypeConfig);

  // Check if wizard tab is active / linkable.
  // When creating a new listing, we don't allow users to access next tab until the current one is completed.
  const tabsStatus = tabsActive(isNewListingFlow, currentListing, tabs, config);

  const title = isNewListingFlow
    ? t('EditListingPage.titleCreateListing')
    : t('EditListingPage.titleEditListing');

  const onTabChange = (moveToNext: boolean, i: number | undefined) => {
    const activeIndex = i ?? tabs.indexOf(selectedTab);
    const index = moveToNext ? activeIndex + 1 : activeIndex;
    if (!moveToNext && !tabsStatus[tabs[index]]) {
      return;
    }
    setSelectedTab(tabs[index]);
  };

  const handleBackPress = () => {
    dispatch(resetEditListing());
    props.navigation.pop();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={title} onLeftIconPress={handleBackPress} />
      {isRequestListing ? (
        <ActivityIndicator size={'small'} />
      ) : showListingsError ? (
        <Text>{t('EditListing.showListingError')}</Text>
      ) : (
        <>
          <HeaderTabs
            isNewListingFlow={isNewListingFlow}
            tabs={tabs}
            onTabChange={onTabChange}
            selectedTab={selectedTab}
            isPriceDisabled={isPriceDisabled}
            processName={processName}
          />
          <View style={styles.innerContainer}>
            <RenderListingWizard
              isNewListingFlow={isNewListingFlow}
              isPriceDisabled={isPriceDisabled}
              processName={processName}
              tab={selectedTab}
              listing={currentListing}
              marketplaceTabs={tabs}
              onTabChange={(moveToNext: boolean) =>
                onTabChange(moveToNext, undefined)
              }
              config={config}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  innerContainer: { flex: 1 },
});
