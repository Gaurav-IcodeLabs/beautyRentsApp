import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { getProcess, resolveLatestProcessName } from '../../../transactions'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '../../../util/currency'

const LineItemTotalPrice = props => {
  const { t } = useTranslation()
  const { transaction, isProvider } = props
  const processName = resolveLatestProcessName(
    transaction?.attributes?.processName,
  )
  if (!processName) {
    return null
  }
  const process = getProcess(processName)
  const isCompleted = process.isCompleted(
    transaction?.attributes?.lastTransition,
  )
  const isRefunded = process.isRefunded(transaction?.attributes?.lastTransition)

  let providerTotalMessageId = 'OrderBreakdown.providerTotalDefault'
  if (isCompleted) {
    providerTotalMessageId = 'OrderBreakdown.providerTotalReceived'
  } else if (isRefunded) {
    providerTotalMessageId = 'OrderBreakdown.providerTotalRefunded'
  }

  const totalLabel = isProvider
    ? t(providerTotalMessageId)
    : t('OrderBreakdown.total')

  const totalPrice = isProvider
    ? transaction.attributes.payoutTotal
    : transaction.attributes.payinTotal
  const formattedTotalPrice = formatMoney(totalPrice)
  return (
    <View style={styles.container}>
      <Text>{totalLabel}</Text>
      <Text>{formattedTotalPrice}</Text>
    </View>
  )
}

export default LineItemTotalPrice

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
