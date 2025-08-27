import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { z } from 'zod'
import { Button, RenderTextInputField } from '../../../../components'
import { STOCK_MULTIPLE_ITEMS, widthScale } from '../../../../util'

const getPriceSchema = (
  listingMinimumPriceSubUnits = 100,
  hasStockManagement,
  t,
) => {
  //stock validation is bugging. Form remains enabled even if its empty - TODO-M
  //also, need to figure out string/number issue in schema
  const formSchema = z.object({
    price: z
      .number()
      .min(
        listingMinimumPriceSubUnits / 100,
        t('EditListingPricingForm.priceTooLow'),
      ),
    stock: hasStockManagement
      ? z.string().min(0, t('EditListingPricingAndStockForm.stockIsRequired'))
      : z.string().optional(),
    stockTypeInfinity: z.array(z.string()).optional(),
  })

  return formSchema
}

const EditListingPricingAndStockForm = props => {
  const {
    initialValues,
    inProgress,
    saveActionMsg,
    onSubmit,
    unitType,
    listingMinimumPriceSubUnits,
    listingType,
  } = props
  const { t } = useTranslation()
  // Note: outdated listings don't have listingType!
  // I.e. listings that are created with previous listing type setup.
  const hasStockManagement = listingType?.stockType === STOCK_MULTIPLE_ITEMS
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      price: initialValues?.price ? `${initialValues.price.amount / 100}` : 0,
      stock: initialValues.stock ? `${initialValues.stock}` : 1,
      stockTypeInfinity: initialValues.stockTypeInfinity ?? [],
    },
    resolver: zodResolver(
      getPriceSchema(listingMinimumPriceSubUnits, hasStockManagement, t),
    ),
    mode: 'onChange',
  })

  return (
    <>
      <RenderTextInputField
        control={control}
        name={'price'}
        labelKey={'EditListingPricingAndStockForm.pricePerProduct'}
        placeholderKey={'EditListingPricingAndStockForm.priceInputPlaceholder'}
        type={'numeric'}
        onChangeText={(amount, onChange) => onChange(Number(amount))}
      />

      {hasStockManagement && (
        <RenderTextInputField
          control={control}
          name={'stock'}
          labelKey={'EditListingPricingAndStockForm.stockLabel'}
          placeholderKey={'EditListingPricingAndStockForm.stockPlaceholder'}
          type={'numeric'}
          onChangeText={(amount, onChange) => onChange(Number(amount))}
        />
      )}

      <Button
        text={saveActionMsg}
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid}
        loading={inProgress}
        style={styles.button}
      />
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    marginTop: widthScale(20),
  },
})

export default EditListingPricingAndStockForm
