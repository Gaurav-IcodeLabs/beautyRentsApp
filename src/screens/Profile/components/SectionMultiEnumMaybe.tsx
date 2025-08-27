import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { fontScale, heightScale } from '../../../util'
import { colors, fontWeight } from '../../../theme'
import PropertyGroup from './PropertyGroup'

interface SectionMultiEnumMaybeProps {
  heading?: string
  options?: string[]
  selectedOptions: string[]
  showUnselectedOptions?: boolean
}

const SectionMultiEnumMaybe = (props: SectionMultiEnumMaybeProps) => {
  const {
    heading,
    options,
    selectedOptions,
    showUnselectedOptions = true,
  } = props
  const hasContent = showUnselectedOptions || selectedOptions?.length > 0
  if (!heading || !options || !hasContent) {
    return null
  }
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{heading}</Text>
      <PropertyGroup
        id="ProfilePage.amenities"
        options={options}
        selectedOptions={selectedOptions}
        showUnselectedOptions={showUnselectedOptions}
      />
    </View>
  )
}

export default SectionMultiEnumMaybe

const styles = StyleSheet.create({
  label: {
    fontSize: fontScale(16),
    color: colors.black,
    fontWeight: fontWeight.semiBold,
  },
  container: {
    marginBottom: heightScale(10),
    paddingBottom: heightScale(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.frostedGrey,
  },
})
