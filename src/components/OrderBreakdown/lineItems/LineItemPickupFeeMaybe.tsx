import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LINE_ITEM_PICKUP_FEE, widthScale } from '../../../util'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '../../../util/currency'
import { colors } from '../../../theme'

const LineItemPickupFeeMaybe = props => {
  const { t } = useTranslation()
  const { lineItems } = props

  const pickupFeeLineItem = lineItems.find(
    item => item.code === LINE_ITEM_PICKUP_FEE && !item.reversal,
  )
  return pickupFeeLineItem ? (
    <>
      <View style={styles.container}>
        <Text>{t('OrderBreakdown.pickupFee')}</Text>
        <Text>{formatMoney(pickupFeeLineItem?.lineTotal)}</Text>
      </View>
      <View style={styles.itemSeperatorStyle} />
    </>
  ) : null
}

export default LineItemPickupFeeMaybe

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  itemSeperatorStyle: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.grey,
    marginVertical: widthScale(6),
  },
})
