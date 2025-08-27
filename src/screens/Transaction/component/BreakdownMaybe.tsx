import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { widthScale } from '../../../util'
import { colors } from '../../../theme'

const BreakdownMaybe = props => {
  const { t } = useTranslation()
  const { orderBreakdown, processName } = props
  return orderBreakdown ? (
    <View style={styles.container}>
      <Text>{t(`TransactionPanel.${processName}.orderBreakdownTitle`)}</Text>
      <View style={styles.itemSeperatorStyle} />
      {orderBreakdown}
    </View>
  ) : null
}

export default BreakdownMaybe

const styles = StyleSheet.create({
  itemSeperatorStyle: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.grey,
    marginVertical: widthScale(6),
  },
  container: {
    padding: widthScale(20),
  },
})
