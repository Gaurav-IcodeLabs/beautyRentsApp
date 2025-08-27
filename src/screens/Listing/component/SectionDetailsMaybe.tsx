import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { colors, fontWeight } from '../../../theme'
import { fontScale, isFieldForListingType, widthScale } from '../../../util'

interface SectionDetailsMaybeProps {
  publicData: any
  metadata: any
  listingFieldConfigs: any
  isFieldForCategory: any
}

const SectionDetailsMaybe = (props: SectionDetailsMaybeProps) => {
  const {
    publicData,
    metadata = {},
    listingFieldConfigs,
    isFieldForCategory,
  } = props
  if (!publicData || !listingFieldConfigs) {
    return null
  }
  const { t } = useTranslation()

  const pickListingFields = (filteredConfigs, config) => {
    const { key, schemaType, enumOptions, showConfig = {} } = config
    const listingType = publicData.listingType
    const isTargetListingType = isFieldForListingType(listingType, config)
    const isTargetCategory = isFieldForCategory(config)
    const { isDetail, label } = showConfig
    const publicDataValue = publicData[key]
    const metadataValue = metadata[key]
    const value = publicDataValue || metadataValue
    if (
      isDetail &&
      isTargetListingType &&
      isTargetCategory &&
      typeof value !== 'undefined'
    ) {
      const findSelectedOption = enumValue =>
        enumOptions?.find(o => enumValue === `${o.option}`)
      const getBooleanMessage = value =>
        value ? 'SearchPage.detailYes' : 'SearchPage.detailNo'
      const optionConfig = findSelectedOption(value)

      return schemaType === 'enum'
        ? filteredConfigs.concat({ key, value: optionConfig?.label, label })
        : schemaType === 'boolean'
          ? filteredConfigs.concat({
              key,
              value: getBooleanMessage(value),
              label,
            })
          : schemaType === 'long'
            ? filteredConfigs.concat({ key, value, label })
            : filteredConfigs
    }
    return filteredConfigs
  }

  const existingListingFields = listingFieldConfigs.reduce(
    pickListingFields,
    [],
  )

  return existingListingFields.length > 0 ? (
    <View style={styles.container}>
      {/* <Text style={styles.detailsTitle}>{t('ListingPage.detailsTitle')}</Text> */}
      {existingListingFields.map(item => {
        const { key, value, label } = item
        return (
          <View style={styles.listingFeildContainer} key={key}>
            <Text style={styles.labelText}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        )
      })}
    </View>
  ) : (
    <View />
  )
}

export default SectionDetailsMaybe

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: widthScale(20),
    marginBottom: widthScale(10),
  },
  detailsTitle: {
    fontWeight: fontWeight.bold,
    fontSize: fontScale(16),
    marginBottom: widthScale(10),
  },
  listingFeildContainer: {
    marginBottom: widthScale(10),
    borderBottomWidth: 1,
    paddingBottom: widthScale(10),
    borderBottomColor: colors.frostedGrey,
  },
  labelText: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontScale(16),
  },
  value: {
    fontSize: fontScale(14),
    marginTop: widthScale(5),
    fontWeight: fontWeight.normal,
  },
})
