import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {
  LINE_ITEM_PROVIDER_COMMISSION,
  types as sdkTypes,
  widthScale,
} from '../../../util'
import { formatMoney } from '../../../util/currency'
import { useTranslation } from 'react-i18next'
import { colors } from '../../../theme'

const { Money } = sdkTypes
// Validate the assumption that the commission exists and the amount
// is zero or negative.
const isValidCommission = commissionLineItem => {
  return (
    commissionLineItem.lineTotal instanceof Money &&
    commissionLineItem.lineTotal.amount <= 0
  )
}

const LineItemProviderCommissionMaybe = props => {
  const { t } = useTranslation()
  const { lineItems, isProvider, marketplaceName } = props

  const providerCommissionLineItem = lineItems.find(
    item => item.code === LINE_ITEM_PROVIDER_COMMISSION && !item.reversal,
  )

  // If commission is passed it will be shown as a fee already reduces from the total price
  let commissionItem = null

  // Sharetribe Web Template is using the default-booking and default-purchase transaction processes.
  // They containt the provider commissions, so by default, the providerCommissionLineItem should exist.
  // If you are not using provider commisison you might want to remove this whole component from OrderBreakdown.js file.
  // https://www.sharetribe.com/docs/concepts/transaction-process/
  if (isProvider && providerCommissionLineItem) {
    if (!isValidCommission(providerCommissionLineItem)) {
      // eslint-disable-next-line no-console
      console.error('invalid commission line item:', providerCommissionLineItem)
      throw new Error(
        'Commission should be present and the value should be zero or negative',
      )
    }

    const commission = providerCommissionLineItem.lineTotal

    commissionItem = (
      <>
        <View style={styles.container}>
          <Text>
            {t('OrderBreakdown.commission', {
              marketplaceName,
              role: 'provider',
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

export default LineItemProviderCommissionMaybe

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
