import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'

const InquiryMessageMaybe = props => {
  const { t } = useTranslation()
  const { protectedData, showInquiryMessage, isCustomer } = props
  if (showInquiryMessage) {
    return (
      <View>
        <Text>{t('TransactionPanel.inquiryMessageHeading')}</Text>
        <Text>{protectedData?.inquiryMessage}</Text>
      </View>
    )
  }
  return null
}

export default InquiryMessageMaybe

const styles = StyleSheet.create({})
