import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {
  LINE_ITEM_CUSTOMER_COMMISSION,
  LINE_ITEM_PROVIDER_COMMISSION,
  types as sdkTypes,
  widthScale,
} from '../../../util'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '../../../util/currency'
import Decimal from 'decimal.js'
import { colors } from '../../../theme'
const { Money } = sdkTypes

// ========= Helpers ==========//
/**
 * Calculates the total price in sub units for multiple line items.
 */
const lineItemsTotal = (lineItems, marketplaceCurrency) => {
  const amount = lineItems.reduce((total, item) => {
    return total.plus(item.lineTotal.amount)
  }, new Decimal(0))
  const currency = lineItems[0]
    ? lineItems[0].lineTotal.currency
    : marketplaceCurrency
  return new Money(amount, currency)
}

/**
 * Checks if line item represents commission
 */
const isCommission = lineItem => {
  return (
    lineItem.code === LINE_ITEM_PROVIDER_COMMISSION ||
    lineItem.code === LINE_ITEM_CUSTOMER_COMMISSION
  )
}

/**
 * Returns non-commission, non-reversal line items
 */
const nonCommissionNonReversalLineItems = lineItems => {
  return lineItems.filter(item => !isCommission(item) && !item.reversal)
}

/**
 * Check if there is a commission line-item for the given user role.
 */
const hasCommission = (lineItems, userRole) => {
  let commissionLineItem = null

  if (userRole === 'customer') {
    commissionLineItem = lineItems.find(
      item => item.code === LINE_ITEM_CUSTOMER_COMMISSION,
    )
  } else if (userRole === 'provider') {
    commissionLineItem = lineItems.find(
      item => item.code === LINE_ITEM_PROVIDER_COMMISSION,
    )
  }
  return !!commissionLineItem
}

const LineItemSubTotalMaybe = props => {
  const { t } = useTranslation()
  const { lineItems, code, userRole, marketplaceCurrency } = props

  const refund = lineItems.find(item => item.code === code && item.reversal)

  // Show subtotal only if commission line-item is applicable to user or refund is issued.
  const showSubTotal = hasCommission(lineItems, userRole) || refund

  // all non-reversal, non-commission line items
  const subTotalLineItems = nonCommissionNonReversalLineItems(lineItems)
  // line totals of those line items combined
  const subTotal = lineItemsTotal(subTotalLineItems, marketplaceCurrency)

  const formattedSubTotal =
    subTotalLineItems.length > 0 ? formatMoney(subTotal) : null
  return formattedSubTotal && showSubTotal ? (
    <>
      <View style={styles.container}>
        <Text>{t('OrderBreakdown.subTotal')}</Text>
        <Text>{formattedSubTotal}</Text>
      </View>
      <View style={styles.itemSeperatorStyle} />
    </>
  ) : null
}

export default LineItemSubTotalMaybe

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
