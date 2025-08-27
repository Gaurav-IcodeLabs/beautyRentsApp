import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Button } from '../../Button/Button'
import { useTranslation } from 'react-i18next'

const InquiryWithoutPaymentForm = props => {
  const { t } = useTranslation()
  const { onSubmit } = props

  return (
    <>
      <Button
        text={t('InquiryWithoutPaymentForm.ctaButton')}
        onPress={() => onSubmit()}
      />
    </>
  )
}

export default InquiryWithoutPaymentForm

const styles = StyleSheet.create({})
