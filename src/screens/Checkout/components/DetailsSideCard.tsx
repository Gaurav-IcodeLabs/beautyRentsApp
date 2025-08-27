import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useTypedSelector } from '../../../sharetribeSetup'
import { speculateTransactionErrorSelector } from '../Checkout.slice'

const DetailsSideCard = props => {
  const { t } = useTranslation()
  const { isInquiryProcess, processName, breakdown } = props
  const speculateTransactionError = useTypedSelector(
    speculateTransactionErrorSelector,
  )

  return (
    <View>
      <Text>{speculateTransactionError}</Text>
      {!!breakdown ? (
        <Text>{t(`CheckoutPage.${processName}.orderBreakdown`)}</Text>
      ) : null}
      {breakdown}
    </View>
  )
}

export default DetailsSideCard

const styles = StyleSheet.create({})
