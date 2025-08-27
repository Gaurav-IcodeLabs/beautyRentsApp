import React from 'react';
import { Trans } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Headings, ListingState } from '../../../../appTypes';
import { ErrorMessage, Heading } from '../../../../components';
import { pickCategoryFields, widthScale } from '../../../../util';
import EditListingDetailsForm from './EditListingDetailsForm';
import {
  getInitialValues,
  getTransactionInfo,
  hasSetListingType,
  pickListingFieldsData,
  setNoAvailabilityForUnbookableListings,
} from './helper';
import { useTypedSelector } from '../../../../sharetribeSetup';
import {
  createListingDraftInProgressSelector,
  publishDraftInProgressSelector,
  updateInProgressSelector,
} from '../../EditListing.slice';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { colors } from '../../../../theme';
interface props {
  listing: any;
  config: any;
  tabSubmitButtonText: any;
  onSubmit: (value: any) => {};
}

type values = {
  [key: string]: any;
};

export const EditListingDetailsPanel = (props: props) => {
  const createListingDraftInProgress = useTypedSelector(
    createListingDraftInProgressSelector,
  );
  const updateInProgress = useTypedSelector(updateInProgressSelector);
  const publishDraftInProgress = useTypedSelector(
    publishDraftInProgressSelector,
  );
  const inProgress =
    createListingDraftInProgress || updateInProgress || publishDraftInProgress;
  const { listing, config, tabSubmitButtonText, onSubmit } = props;

  const { publicData, state } = listing?.attributes || {};
  const listingTypes = config.listing.listingTypes;
  const listingFields = config.listing.listingFields;
  const listingCategories = config.categoryConfiguration.categories;
  const categoryKey = config.categoryConfiguration.key;

  const { hasExistingListingType, existingListingTypeInfo } =
    hasSetListingType(publicData);
  const hasValidExistingListingType =
    hasExistingListingType &&
    !!listingTypes.find((conf: values) => {
      const listinTypesMatch =
        conf.listingType === existingListingTypeInfo.listingType;
      const unitTypesMatch =
        conf.transactionType?.unitType === existingListingTypeInfo.unitType;
      return listinTypesMatch && unitTypesMatch;
    });

  const initialValues = getInitialValues(
    props,
    existingListingTypeInfo,
    listingTypes,
    listingFields,
    listingCategories,
    categoryKey,
  );

  const noListingTypesSet = listingTypes?.length === 0;
  const hasListingTypesSet = listingTypes?.length > 0;
  const canShowEditListingDetailsForm =
    hasListingTypesSet &&
    (!hasExistingListingType || hasValidExistingListingType);
  const isPublished = listing?.id && state !== ListingState.LISTING_STATE_DRAFT;

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      {isPublished ? (
        <Heading
          fieldType={Headings.HEADING1}
          content={
            <Trans
              i18nKey="EditListingDetailsPanel.title"
              values={{ listingTitle: listing.attributes.title }}
            />
          }
          containerStyle={styles.headingContainer}
        />
      ) : (
        <Heading
          fieldType={Headings.HEADING1}
          content={
            <Trans i18nKey="EditListingDetailsPanel.createListingTitle" />
          }
          containerStyle={styles.headingContainer}
        />
      )}

      {canShowEditListingDetailsForm ? (
        <EditListingDetailsForm
          initialValues={initialValues}
          saveActionMsg={tabSubmitButtonText}
          selectableListingTypes={listingTypes.map((conf: values) =>
            getTransactionInfo([conf], {}, true),
          )}
          hasExistingListingType={hasExistingListingType}
          selectableCategories={listingCategories}
          pickSelectedCategories={(values: values) =>
            pickCategoryFields(values, categoryKey, 1, listingCategories)
          }
          categoryPrefix={categoryKey}
          listingFieldsConfig={listingFields}
          inProgress={inProgress}
          onSubmit={(values: values) => {
            console.log('values', values);
            return;
            const {
              title,
              description,
              listingType,
              transactionProcessAlias,
              unitType,
              ...rest
            } = values;

            const nestedCategories = pickCategoryFields(
              rest,
              categoryKey,
              1,
              listingCategories,
            );
            // Remove old categories by explicitly saving null for them.
            const cleanedNestedCategories = {
              ...[1, 2, 3].reduce(
                (a, i) => ({ ...a, [`${categoryKey}${i}`]: null }),
                {},
              ),
              ...nestedCategories,
            };
            const publicListingFields = pickListingFieldsData(
              rest,
              'public',
              listingType,
              nestedCategories,
              listingFields,
            );
            const privateListingFields = pickListingFieldsData(
              rest,
              'private',
              listingType,
              nestedCategories,
              listingFields,
            );
            // New values for listing attributes
            const updateValues = {
              title: title.trim(),
              description,
              publicData: {
                listingType,
                transactionProcessAlias,
                unitType,
                ...cleanedNestedCategories,
                ...publicListingFields,
              },
              privateData: privateListingFields,
              ...setNoAvailabilityForUnbookableListings(
                transactionProcessAlias,
              ),
            };

            onSubmit(updateValues);
          }}
        />
      ) : (
        <ErrorMessage
          marketplaceName={config.marketplaceName}
          noListingTypesSet={noListingTypesSet}
          invalidExistingListingType={!hasValidExistingListingType}
        />
      )}

      <View style={styles.bottomSpacer} />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: widthScale(20),
    backgroundColor: colors.white,
  },
  headingContainer: {
    marginBottom: widthScale(20),
    marginLeft: widthScale(20),
  },
  bottomSpacer: {
    height: widthScale(120),
  },
});
