import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, fontWeight } from '../../../theme'
import { fontScale, heightScale } from '../../../util'

const SectionTextMaybe = props => {
  const { text, heading } = props

  return text ? (
    <View style={styles.container}>
      {heading ? <Text style={styles.label}>{heading}</Text> : null}
      <Text style={styles.value}>{text}</Text>
    </View>
  ) : null
}
const styles = StyleSheet.create({
  container: {
    marginBottom: heightScale(10),
    paddingBottom: heightScale(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.frostedGrey,
  },
  label: {
    fontSize: fontScale(16),
    color: colors.black,
    fontWeight: fontWeight.semiBold,
  },
  value: {
    fontSize: fontScale(14),
    color: colors.black,
    fontWeight: fontWeight.normal,
    marginTop: heightScale(5),
  },
})
export default SectionTextMaybe
