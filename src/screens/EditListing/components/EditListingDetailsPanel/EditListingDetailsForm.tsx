import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { RenderTextInputField, Button } from '../../../../components';
import { fontScale, widthScale } from '../../../../util';
import AddListingFields from '../AddListingFields';
import FieldSelectCategory from '../FieldSelectCategory';
import FieldSelectListingType from '../FieldSelectListingType';
import { getDefaultValues, getListngDetailsSchema } from './helper';
import { selectedListingTypeSelector } from '../../EditListing.slice';
import { useTypedSelector } from '../../../../sharetribeSetup';
import RadioSingleSelect from '../../../StripePayout/components/RadioSingleSelect';
import { colors, fontWeight } from '../../../../theme';

interface props {
  selectableListingTypes: Record<string, string>[];
  hasExistingListingType: boolean;
  selectableCategories: Record<string, string>[];
  initialValues: Record<string, string>;
  categoryPrefix: string;
  saveActionMsg: string;
  listingFieldsConfig: any;
  pickSelectedCategories: any;
  onSubmit: (values: object) => void;
  inProgress: boolean;
}

// Form that asks title, description, transaction process and unit type for pricing
// In addition, it asks about custom fields according to marketplace-custom-config.js
const EditListingDetailsForm = (props: props) => {
  const [allCategoriesChosen, setAllCategoriesChosen] = useState(false);
  const selectedListingType = useTypedSelector(selectedListingTypeSelector);
  const { t } = useTranslation();
  const {
    selectableListingTypes,
    hasExistingListingType,
    selectableCategories,
    initialValues: iV,
    categoryPrefix,
    saveActionMsg,
    listingFieldsConfig,
    pickSelectedCategories,
    onSubmit,
    inProgress,
  } = props;
  //Uppon changing listing type, it changes tabs accordingly and causes a re-render. This re-render is reseting the entire form state. For this reason, we use the following workaround: Saved the selectedListingType in redux store and used it in the form initialValues when re-render happens. Can be improved later.
  const initialValues = selectedListingType
    ? {
        ...iV,
        listingType: selectedListingType.listingType,
        transactionProcessAlias: selectedListingType.transactionProcessAlias,
        unitType: selectedListingType.unitType,
      }
    : iV;
  const {
    control,
    handleSubmit,
    formState: { isValid },
    watch,
    setValue,
    getValues,
  } = useForm({
    defaultValues: getDefaultValues(initialValues),
    resolver: zodResolver(
      getListngDetailsSchema(initialValues, listingFieldsConfig, t),
    ),
    mode: 'onChange',
  });
  const listingType = watch('listingType');
  const bookingType = watch('bookingType');
  console.log('bookingType', bookingType);
  const hasCategories = selectableCategories && selectableCategories.length > 0;
  const showCategories = listingType && hasCategories;
  const showTitle = hasCategories ? allCategoriesChosen : listingType;
  const showDescription = hasCategories ? allCategoriesChosen : listingType;
  const showListingFields = hasCategories ? allCategoriesChosen : listingType;

  // console.log('listingType', listingType)

  const bookingTypeOptions = [
    {
      id: 'instantBooking',
      type: 'radio',
      label: t('EditListingDetailsForm.instantBooking'),
      key: 'instantBooking',
    },
    {
      id: 'requestBasedBooking',
      type: 'radio',
      label: t('EditListingDetailsForm.requestBasedBooking'),
      key: 'requestBasedBooking',
    },
  ];

  return (
    <View style={styles.container}>
      <FieldSelectListingType
        name="listingType"
        listingTypes={selectableListingTypes}
        hasExistingListingType={hasExistingListingType}
        control={control}
        t={t}
        getValues={getValues}
      />

      {showCategories ? (
        <FieldSelectCategory
          watch={watch}
          setValue={setValue}
          prefix={categoryPrefix}
          listingCategories={selectableCategories}
          control={control}
          allCategoriesChosen={allCategoriesChosen}
          setAllCategoriesChosen={setAllCategoriesChosen}
          t={t}
        />
      ) : null}

      <RenderTextInputField
        control={control}
        name={'title'}
        labelKey={'EditListingDetailsForm.title'}
        placeholderKey={'EditListingDetailsForm.titlePlaceholder'}
        disabled={!showTitle}
      />

      <RenderTextInputField
        control={control}
        name={'description'}
        labelKey={'EditListingDetailsForm.description'}
        placeholderKey={'EditListingDetailsForm.descriptionPlaceholder'}
        multiline
        disabled={!showDescription}
      />

      {showCategories ? (
        <>
          <Text style={styles.text}>
            {t('EditListingDetailsForm.chooseType')}
          </Text>
          <RadioSingleSelect
            name={'bookingType'}
            control={control}
            options={bookingTypeOptions}
          />
        </>
      ) : null}

      {showListingFields ? (
        <AddListingFields
          listingType={listingType}
          listingFieldsConfig={listingFieldsConfig}
          selectedCategories={pickSelectedCategories(watch())}
          control={control}
          t={t}
        />
      ) : null}

      <Button
        text={saveActionMsg}
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid}
        style={styles.button}
        loading={inProgress}
      />
    </View>
  );
};

export default EditListingDetailsForm;

const styles = StyleSheet.create({
  container: {
    // alignSelf: 'center',
    paddingHorizontal: widthScale(20),
  },
  button: {
    marginTop: widthScale(20),
  },
  text: {
    marginBottom: widthScale(10),
    fontWeight: fontWeight.medium,
    fontSize: fontScale(14),
    color: colors.black,
  },
});
