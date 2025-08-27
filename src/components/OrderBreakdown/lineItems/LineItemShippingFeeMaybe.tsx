import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LINE_ITEM_SHIPPING_FEE, widthScale } from '../../../util'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '../../../util/currency'
import { colors } from '../../../theme'

const LineItemShippingFeeMaybe = props => {
  const { t } = useTranslation()

  const { lineItems } = props

  const shippingFeeLineItem = lineItems.find(
    item => item.code === LINE_ITEM_SHIPPING_FEE && !item.reversal,
  )

  return shippingFeeLineItem ? (
    <>
      <View style={styles.container}>
        <Text>{t('OrderBreakdown.shippingFee')}</Text>
        <Text>{formatMoney(shippingFeeLineItem?.lineTotal)}</Text>
      </View>
      <View style={styles.itemSeperatorStyle} />
    </>
  ) : null
}

export default LineItemShippingFeeMaybe

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },

  itemSeperatorStyle: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.grey,
    marginVertical: widthScale(6),
  },
})
