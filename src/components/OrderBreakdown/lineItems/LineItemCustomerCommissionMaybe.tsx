import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {
  LINE_ITEM_CUSTOMER_COMMISSION,
  types as sdkTypes,
  widthScale,
} from '../../../util'
import { formatMoney } from '../../../util/currency'
import { useTranslation } from 'react-i18next'
import { colors } from '../../../theme'

const { Money } = sdkTypes

// Validate the assumption that the commission exists and the amount
// is zero or positive.
const isValidCommission = commissionLineItem => {
  return (
    commissionLineItem &&
    commissionLineItem.lineTotal instanceof Money &&
    commissionLineItem.lineTotal.amount >= 0
  )
}

const LineItemCustomerCommissionMaybe = props => {
  const { t } = useTranslation()
  const { lineItems, isCustomer, marketplaceName } = props

  const customerCommissionLineItem = lineItems.find(
    item => item.code === LINE_ITEM_CUSTOMER_COMMISSION && !item.reversal,
  )

  // If commission is passed it will be shown as a fee already added to the total price
  let commissionItem = null

  if (isCustomer && customerCommissionLineItem) {
    if (!isValidCommission(customerCommissionLineItem)) {
      // eslint-disable-next-line no-console
      console.error('invalid commission line item:', customerCommissionLineItem)
      throw new Error(
        'Commission should be present and the value should be zero or positive',
      )
    }

    const commission = customerCommissionLineItem.lineTotal

    commissionItem = (
      <>
        <View style={styles.container}>
          <Text>
            {t('OrderBreakdown.commission', {
              marketplaceName,
              role: 'customer',
            })}
          </Text>
          <Text>{formatMoney(commission)}</Text>
        </View>
        <View style={styles.itemSeperatorStyle} />
      </>
    )
  }
  return commissionItem
}

export default LineItemCustomerCommissionMaybe

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
