import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { z } from 'zod'
import { Geolocation } from '../../../../appTypes'
import {
  LocationModal,
  RenderTextInputField,
  Button,
} from '../../../../components'
import { widthScale } from '../../../../util'

const getLocationSchema = () => {
  const formSchema = z.object({
    address: z.string().min(1),
    building: z.string().optional(),
    geolocation: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  })

  return formSchema
}
interface props {
  initialValues: {
    building: string
    address: string
    geolocation: Geolocation
  }
  inProgress: boolean
  saveActionMsg: string
  onSubmit: () => {}
}

const EditListingLocationForm = (props: props) => {
  const { initialValues, inProgress, saveActionMsg, onSubmit } = props
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { isValid },
    setValue,
  } = useForm({
    defaultValues: {
      building: initialValues?.building ?? '',
      address: initialValues?.address ?? '',
      geolocation: initialValues?.geolocation ?? '',
    },
    resolver: zodResolver(getLocationSchema()),
    mode: 'onChange',
  })

  return (
    <View>
      <RenderTextInputField
        control={control}
        labelKey="EditListingLocationForm.address"
        name="address"
        placeholderKey="EditListingLocationForm.addressPlaceholder"
        onPress={() => {
          setShowModal(true)
        }}
      />

      {showModal && (
        <LocationModal
          visible={showModal}
          onModalClose={() => setShowModal(false)}
          renderSearchInputField={true}
          onSelectLocation={(key, value) => {
            setValue(key, value)
            setValue('building', '', { shouldValidate: true }) //to make button enable
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
        labelKey="EditListingLocationForm.building"
        name="building"
        placeholderKey="EditListingLocationForm.buildingPlaceholder"
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

export default EditListingLocationForm
