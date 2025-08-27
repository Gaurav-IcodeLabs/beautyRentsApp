import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { z } from 'zod'
import { Button, RenderTextInputField } from '../../../../components'
import { widthScale } from '../../../../util'

const getPriceSchema = (listingMinimumPriceSubUnits = 100, t) => {
  //TODO-H => required validation logic pending
  const formSchema = z.object({
    price: z
      .number()
      .min(
        listingMinimumPriceSubUnits / 100,
        t('EditListingPricingAndStockForm.priceTooLow'),
      ),
  })

  return formSchema
}

const EditListingPricingForm = props => {
  const {
    initialValues,
    inProgress,
    saveActionMsg,
    onSubmit,
    unitType,
    listingMinimumPriceSubUnits,
  } = props
  const { t } = useTranslation()
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      price: initialValues?.price ? `${initialValues.price.amount / 100}` : 0,
    },
    resolver: zodResolver(getPriceSchema(listingMinimumPriceSubUnits, t)),
    mode: 'onChange',
  })

  return (
    <View>
      <RenderTextInputField
        control={control}
        name={'price'}
        labelKey={t('EditListingPricingForm.pricePerProduct',{unitType})}
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
  )
}

const styles = StyleSheet.create({
  button: {
    marginTop: widthScale(20),
  },
})

export default EditListingPricingForm
