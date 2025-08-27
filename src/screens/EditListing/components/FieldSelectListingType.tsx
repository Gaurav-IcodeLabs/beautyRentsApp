import React from 'react';
import { Control } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { RenderDropdownField } from '../../../components';
import { store } from '../../../sharetribeSetup';
import { setListingType } from '../EditListing.slice';
import { fontScale, heightScale, screenWidth, widthScale } from '../../../util';
import { colors, fontWeight } from '../../../theme';

// Field component that either allows selecting listing type (if multiple types are available)
// or just renders hidden fields:
// - listingType              Set of predefined configurations for each listing type
// - transactionProcessAlias  Initiate correct transaction against Marketplace API
// - unitType                 Main use case: pricing unit

interface props {
  name: string;
  listingTypes: Record<string, string>[];
  hasExistingListingType: boolean;
  control: Control;
}

const FieldSelectListingType = (props: props) => {
  const { name, listingTypes, hasExistingListingType, control, t, getValues } =
    props;

  const handleOnChange = value => {
    store.dispatch(setListingType(value));
  };

  const getListingTypeLabel = listingType => {
    const listingTypeConfig = listingTypes.find(
      config => config.listingType === listingType,
    );
    return listingTypeConfig ? listingTypeConfig.label : listingType;
  };

  const hasMultipleListingTypes = listingTypes?.length > 1;
  return (
    <View>
      {hasMultipleListingTypes && !hasExistingListingType ? (
        <RenderDropdownField
          control={control}
          name={name}
          labelField="label"
          valueField="listingType"
          data={listingTypes}
          placeholderKey={t('EditListingDetailsForm.listingTypePlaceholder')}
          lableKey={t('EditListingDetailsForm.listingTypeLabel')}
          onDropDownValueChange={value => {
            handleOnChange(value);
          }}
        />
      ) : hasMultipleListingTypes && hasExistingListingType ? (
        <View style={styles.secondView}>
          <Text style={styles.secondLabel}>
            {t('EditListingDetailsForm.listingTypeLabel')}
          </Text>
          <View style={styles.secondaryView}>
            <Text style={styles.secondText}>
              {getListingTypeLabel(getValues(name))}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default FieldSelectListingType;

const styles = StyleSheet.create({
  secondView: {
    width: screenWidth - widthScale(40),
    marginBottom: widthScale(16),
  },
  secondLabel: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
    marginBottom: widthScale(10),
    color: colors.grey,
  },
  secondaryView: {
    paddingVertical: heightScale(10),
    borderRadius: widthScale(10),
  },
  secondText: {
    fontSize: fontScale(14),
    color: colors.black,
  },
});
