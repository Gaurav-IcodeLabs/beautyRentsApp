import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useConfiguration } from '../../../context'
import {
  isFieldForCategory,
  pickCategoryFields,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
  widthScale,
} from '../../../util'
import { pickCustomFieldProps } from '../../../util'
import SectionDetailsMaybe from './SectionDetailsMaybe'
import SectionMultiEnumMaybe from './SectionMultiEnumMaybe'
import SectionTextMaybe from './SectionTextMaybe'

interface CustomListingFieldsProps {
  publicData: any
  metadata: any
}

const CustomListingFields = (props: CustomListingFieldsProps) => {
  const { publicData, metadata } = props
  const config = useConfiguration()
  const listingConfig = config.listing
  const listingFieldConfigs = listingConfig.listingFields
  const categoryConfiguration = config.categoryConfiguration
  const { key: categoryPrefix, categories: listingCategoriesConfig } =
    categoryConfiguration
  const categoriesObj = pickCategoryFields(
    publicData,
    categoryPrefix,
    1,
    listingCategoriesConfig,
  )
  const currentCategories = Object.values(categoriesObj)

  const isFieldForSelectedCategories = fieldConfig => {
    const isTargetCategory = isFieldForCategory(currentCategories, fieldConfig)
    return isTargetCategory
  }
  const propsForCustomFields =
    pickCustomFieldProps(
      publicData,
      metadata,
      listingFieldConfigs,
      'listingType',
      isFieldForSelectedCategories,
    ) || []

  return (
    <View style={styles.container}>
      <SectionDetailsMaybe
        isFieldForCategory={isFieldForSelectedCategories}
        publicData={publicData}
        metadata={metadata}
        listingFieldConfigs={listingFieldConfigs}
      />
      {propsForCustomFields.map((customFieldProps: any, index: number) => {
        const { schemaType, ...fieldProps } = customFieldProps
        return schemaType === SCHEMA_TYPE_MULTI_ENUM ? (
          <SectionMultiEnumMaybe {...fieldProps} key={index} />
        ) : schemaType === SCHEMA_TYPE_TEXT ? (
          <SectionTextMaybe {...fieldProps} key={index} />
        ) : null
      })}
    </View>
  )
}

export default CustomListingFields

const styles = StyleSheet.create({
  container: {
    marginTop: widthScale(10),
  },
})
