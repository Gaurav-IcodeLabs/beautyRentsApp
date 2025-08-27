import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Button,
  CheckBox,
  LocationModal,
  RenderTextInputField,
} from '../../../../components'
import {
  displayDeliveryPickup,
  displayDeliveryShipping,
  fontScale,
  heightScale,
  widthScale,
} from '../../../../util'
import { useTranslation } from 'react-i18next'
import { fontWeight } from '../../../../theme'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ListingDeliveryOptionsTypes } from '../../../../appTypes'

const getSchema = (hasStockInUse, t, options) => {
  const { pickup, shipping } = options

  const pickupSchema = {
    deliveryOptions: z
      .array(
        z.enum([
          ListingDeliveryOptionsTypes.PICKUP,
          ListingDeliveryOptionsTypes.SHIPPING,
        ]),
      )
      .nonempty(),
    address: z
      .string()
      .min(1, { message: t('EditListingLocationForm.addressRequired') })
      .trim(),
    building: z.string().optional(),
    geolocation: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }

  const shippingSchema = {
    deliveryOptions: z
      .array(
        z.enum([
          ListingDeliveryOptionsTypes.PICKUP,
          ListingDeliveryOptionsTypes.SHIPPING,
        ]),
      )
      .nonempty(),
    shippingPriceInSubunitsOneItem: z
      .number()
      .min(1, { message: t('EditListingDeliveryForm.shippingOneItemRequired') })
      .refine(value => value !== undefined && value !== null, {
        message: t('EditListingDeliveryForm.shippingOneItemRequired'),
      }),
    ...(hasStockInUse
      ? {
          shippingPriceInSubunitsAdditionalItems: z
            .number()
            .min(1, {
              message: t(
                'EditListingDeliveryForm.shippingAdditionalItemsRequired',
              ),
            })
            .refine(value => value !== undefined && value !== null, {
              message: t(
                'EditListingDeliveryForm.shippingAdditionalItemsRequired',
              ),
            }),
        }
      : {}),
  }

  if (pickup && shipping) {
    return z.object({ ...pickupSchema, ...shippingSchema })
  } else if (pickup) {
    return z.object(pickupSchema)
  } else if (shipping) {
    return z.object(shippingSchema)
  }
}

interface props {
  hasStockInUse: boolean
  saveActionMsg: string
  marketplaceCurrency: string
  initialValues: object
  listingTypeConfig: object
  onSubmit: (values: object) => void
  inProgress: boolean
}

const EditListingDeliveryForm = (props: props) => {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState({
    pickup: false,
    shipping: false,
  })
  const {
    hasStockInUse,
    initialValues,
    listingTypeConfig,
    marketplaceCurrency,
    saveActionMsg,
    onSubmit,
    inProgress,
  } = props || {}

  const {
    control,
    handleSubmit,
    formState: { isValid },
    setValue,
    watch,
    getValues,
    trigger,
  } = useForm({
    defaultValues: {
      address: '',
      checkboxPickup: false,
      checkboxShipping: false,
      geolocation: null,
      ...initialValues,
    },
    resolver: zodResolver(getSchema(hasStockInUse, t, selectedOptions)),
    mode: 'onChange',
  })
  const value = watch()
  const displayShipping = displayDeliveryShipping(listingTypeConfig)
  const displayPickup = displayDeliveryPickup(listingTypeConfig)
  const shippingEnabled =
    displayShipping &&
    value.deliveryOptions?.includes(ListingDeliveryOptionsTypes.SHIPPING)
  const pickupEnabled =
    displayPickup &&
    value.deliveryOptions?.includes(ListingDeliveryOptionsTypes.PICKUP)

  const handleCheckboxChange = (name, value) => {
    const currentDeliveryOptions = getValues('deliveryOptions')
    let updatedDeliveryOptions = [...currentDeliveryOptions]

    if (value) {
      updatedDeliveryOptions = [...new Set([...updatedDeliveryOptions, name])]
    } else {
      updatedDeliveryOptions = updatedDeliveryOptions.filter(
        option => option !== name,
      )
    }
    setValue('deliveryOptions', updatedDeliveryOptions, {
      shouldValidate: true,
    })
  }

  useEffect(() => {
    if (selectedOptions.pickup) {
      trigger('address')
    } else if (selectedOptions.shipping) {
      trigger('shippingPriceInSubunitsOneItem')
    }
  }, [selectedOptions])

  return (
    <View style={styles.container}>
      <View style={styles.checkboxSection}>
        <CheckBox
          checked={selectedOptions.pickup}
          onPress={() => {
            setSelectedOptions(option => {
              handleCheckboxChange(
                ListingDeliveryOptionsTypes.PICKUP,
                !option.pickup,
              )
              return { ...option, pickup: !option.pickup }
            })
          }}
        />

        <Text style={styles.pickupOrShippingText}>
          {t('EditListingDeliveryForm.pickupLabel')}
        </Text>
      </View>

      <RenderTextInputField
        control={control}
        labelKey="EditListingDeliveryForm.address"
        name="address"
        placeholderKey="EditListingDeliveryForm.addressPlaceholder"
        editable={false}
        style={styles.inputLocation}
        onPress={() => {
          if (pickupEnabled) {
            setShowModal(true)
          }
        }}
      />

      {showModal && (
        <LocationModal
          visible={showModal}
          onModalClose={() => setShowModal(false)}
          renderSearchInputField={true}
          onSelectLocation={(key, value) => {
            setValue(key, value)
          }}
          control={control}
          t={t}
          showLabel={true}
          placeholderKey="EditListingLocationForm.addressPlaceholder"
          labelKey="EditListingLocationForm.address"
        />
      )}

      <RenderTextInputField
        control={control}
        style={styles.inputBuilding}
        labelKey="EditListingLocationForm.building"
        name="building"
        placeholderKey="EditListingLocationForm.buildingPlaceholder"
        editable={pickupEnabled}
      />

      <View style={styles.checkboxSection}>
        <CheckBox
          checked={selectedOptions.shipping}
          onPress={() => {
            setSelectedOptions(option => {
              handleCheckboxChange(
                ListingDeliveryOptionsTypes.SHIPPING,
                !option.shipping,
              )
              return { ...option, shipping: !option.shipping }
            })
          }}
        />
        <Text style={styles.pickupOrShippingText}>
          {t('EditListingDeliveryForm.shippingLabel')}
        </Text>
      </View>

      <RenderTextInputField
        control={control}
        style={styles.inputLocation}
        editable={shippingEnabled}
        name={'shippingPriceInSubunitsOneItem'}
        labelKey={'EditListingDeliveryForm.shippingOneItemLabel'}
        placeholderKey={'EditListingDeliveryForm.shippingOneItemPlaceholder'}
        type={'numeric'}
        onChangeText={(amount, onChange) => onChange(Number(amount))}
      />

      {hasStockInUse ? (
        <RenderTextInputField
          control={control}
          style={styles.inputBuilding}
          editable={shippingEnabled}
          name={'shippingPriceInSubunitsAdditionalItems'}
          labelKey={'EditListingDeliveryForm.shippingAdditionalItemsLabel'}
          placeholderKey={
            'EditListingDeliveryForm.shippingAdditionalItemsPlaceholder'
          }
          type={'numeric'}
          onChangeText={(amount, onChange) => onChange(Number(amount))}
        />
      ) : null}

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
  container: {
    marginHorizontal: widthScale(20),
  },
  checkboxSection: {
    flexDirection: 'row',
  },
  pickupOrShippingText: {
    marginLeft: widthScale(10),
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
  },
  inputLocation: {
    marginTop: heightScale(20),
    marginHorizontal: widthScale(10),
  },
  inputBuilding: {
    marginTop: heightScale(5),
    marginHorizontal: widthScale(10),
    marginBottom: heightScale(20),
  },
  button: {
    marginTop: widthScale(20),
  },
})
export default EditListingDeliveryForm
