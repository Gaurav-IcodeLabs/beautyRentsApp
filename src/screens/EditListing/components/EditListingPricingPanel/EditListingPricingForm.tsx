import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';
import { Button, RenderTextInputField } from '../../../../components';
import { widthScale } from '../../../../util';
import { DAY } from '../../../../transactions';

const getPriceSchema = (listingMinimumPriceSubUnits = 100, t: any) => {
  const minPrice = listingMinimumPriceSubUnits / 100;

  return z
    .object({
      price: z
        .number({
          invalid_type_error: t('EditListingPricingForm.priceRequired'),
        })
        .min(minPrice, t('EditListingPricingForm.priceTooLow', { minPrice }))
        .or(z.literal(0)) // allow 0 as "empty"
        .optional()
        .nullable(),

      price_per_day: z
        .number({
          invalid_type_error: t('EditListingPricingForm.priceRequired'),
        })
        .min(minPrice, t('EditListingPricingForm.priceTooLow', { minPrice }))
        .or(z.literal(0)) // allow 0 as "empty"
        .optional()
        .nullable(),
    })
    .superRefine((data, ctx) => {
      if (!data.price && !data.price_per_day) {
        ctx.addIssue({
          code: 'custom',
          path: ['price'],
          message: t('EditListingPricingForm.priceRequired'),
        });
        ctx.addIssue({
          code: 'custom',
          path: ['price_per_day'],
          message: t('EditListingPricingForm.priceRequired'),
        });
      }
    });
};

const EditListingPricingForm = props => {
  const {
    initialValues,
    inProgress,
    saveActionMsg,
    onSubmit,
    unitType,
    listingMinimumPriceSubUnits,
  } = props;

  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      price: initialValues?.price
        ? `${initialValues.price.amount / 100}`
        : undefined,
      price_per_day: initialValues?.price_per_day
        ? `${initialValues.price.amount / 100}`
        : undefined,
    },
    resolver: zodResolver(getPriceSchema(listingMinimumPriceSubUnits, t)),
    mode: 'onChange',
  });

  return (
    <View>
      <RenderTextInputField
        control={control}
        name={'price_per_day'}
        labelKey={t('EditListingPricingForm.pricePerProduct', {
          unitType: DAY,
        })}
        placeholderKey={'EditListingPricingForm.priceInputPlaceholder'}
        editable={!inProgress}
        type={'numeric'}
        onChangeText={(amount, onChange) => onChange(Number(amount))}
      />

      <RenderTextInputField
        control={control}
        name={'price'}
        labelKey={t('EditListingPricingForm.pricePerProduct', { unitType })}
        placeholderKey={'EditListingPricingForm.priceInputPlaceholder'}
        editable={!inProgress}
        type={'numeric'}
        onChangeText={(amount, onChange) => onChange(Number(amount))}
      />

      <Button
        text={saveActionMsg}
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid}
        loading={inProgress}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: widthScale(20),
  },
});

export default EditListingPricingForm;
