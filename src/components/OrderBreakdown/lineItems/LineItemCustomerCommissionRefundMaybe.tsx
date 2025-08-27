import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LINE_ITEM_CUSTOMER_COMMISSION, widthScale } from '../../../util'
import { formatMoney } from '../../../util/currency'
import { useTranslation } from 'react-i18next'
import { colors } from '../../../theme'

const LineItemCustomerCommissionRefundMaybe = props => {
  const { t } = useTranslation()
  const { lineItems, isCustomer, marketplaceName } = props

  const refund = lineItems.find(
    item => item.code === LINE_ITEM_CUSTOMER_COMMISSION && item.reversal,
  )

  return isCustomer && refund ? (
    <>
      <View style={styles.container}>
        <Text>
          {t('OrderBreakdown.refundCustomerFee', { marketplaceName })}
        </Text>
        <Text>{formatMoney(refund.lineTotal)}</Text>
      </View>
      <View style={styles.itemSeperatorStyle} />
    </>
  ) : null
}

export default LineItemCustomerCommissionRefundMaybe

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
