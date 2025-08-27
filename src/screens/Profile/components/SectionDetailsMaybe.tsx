import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { colors, fontWeight } from '../../../theme'
import { fontScale, heightScale } from '../../../util'

interface SectionDetailsMaybeProps {
  existingUserFields: any[]
}

const SectionDetailsMaybe = (props: SectionDetailsMaybeProps) => {
  const { existingUserFields } = props
  return existingUserFields?.length > 0 ? (
    <View>
      {existingUserFields?.map(detail => {
        if (!detail?.label) return null
        return (
          <View style={styles.detailSection} key={detail.key}>
            <Text style={styles.label}>{detail.label}</Text>
            <Text style={styles.value}>{detail.value}</Text>
          </View>
        )
      })}
    </View>
  ) : null
}
const styles = StyleSheet.create({
  detailSection: {
    marginBottom: heightScale(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.frostedGrey,
    paddingBottom: heightScale(10),
  },
  label: {
    fontSize: fontScale(16),
    color: colors.black,
    fontWeight: fontWeight.semiBold,
  },
  value: {
    marginTop: heightScale(5),
    fontSize: fontScale(14),
    color: colors.black,
    fontWeight: fontWeight.normal,
  },
})
export default SectionDetailsMaybe
