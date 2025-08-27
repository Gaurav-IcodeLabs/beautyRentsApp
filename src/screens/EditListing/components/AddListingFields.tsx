import { View, Text } from 'react-native'
import React from 'react'
import {
  EXTENDED_DATA_SCHEMA_TYPES,
  isFieldForCategory,
  isFieldForListingType,
} from '../../../util'
import { CustomExtendedDataField } from '../../../components'
import { Control } from 'react-hook-form'

interface props {
  listingType: string
  listingFieldsConfig: Record<string, string>[]
  selectedCategories: {
    categoryLevel1?: string
    categoryLevel2?: string
    categoryLevel3?: string
    categoryLevel4?: string
  }
  control: Control
  t: (key: string) => string
}

// Add collect data for listing fields (both publicData and privateData) based on configuration
const AddListingFields = (props: props) => {
  const { listingType, listingFieldsConfig, selectedCategories, control, t } =
    props
  const targetCategoryIds = Object.values(selectedCategories)
  const fields = listingFieldsConfig.reduce((pickedFields, fieldConfig) => {
    const { key, schemaType, scope } = fieldConfig || {}
    const namespacedKey = scope === 'public' ? `pub_${key}` : `priv_${key}`

    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType)
    const isProviderScope = ['public', 'private'].includes(scope)
    const isTargetListingType = isFieldForListingType(listingType, fieldConfig)
    const isTargetCategory = isFieldForCategory(targetCategoryIds, fieldConfig)

    return isKnownSchemaType &&
      isProviderScope &&
      isTargetListingType &&
      isTargetCategory
      ? [
          ...pickedFields,
          <CustomExtendedDataField
            key={namespacedKey}
            name={namespacedKey}
            fieldConfig={fieldConfig}
            defaultRequiredMessage={t(
              'EditListingDetailsForm.defaultRequiredMessage',
            )}
            control={control}
            t={t}
          />,
        ]
      : pickedFields
  }, [])

  return <View>{fields}</View>
}

export default AddListingFields
