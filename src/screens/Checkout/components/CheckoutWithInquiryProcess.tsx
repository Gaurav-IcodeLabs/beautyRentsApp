import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useConfiguration } from '../../../context'
import { displayPrice, fontScale, heightScale, widthScale } from '../../../util'
import { formatMoney } from '../../../util/currency'
import { useForm } from 'react-hook-form'
import { Button, RenderTextInputField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getProcess } from '../../../transactions'
import { getTransactionTypeData } from '../Checkout.helper'
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup'
import {
  initiateInquiryErrorSelector,
  initiateInquiryInProgressSelector,
  initiateInquiryWithoutPayment,
} from '../Checkout.slice'
import { useNavigation } from '@react-navigation/native'
import { CheckoutConstants } from '../../../appTypes/enums/checkout'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const getSchema = t => {
  const formSchema = z.object({
    inquiryMessage: z
      .string()
      .min(1, t('CheckoutPageWithInquiryProcess.messageRequired')),
  })
  return formSchema
}

const CheckoutWithInquiryProcess = props => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const config = useConfiguration()
  const dispatch = useAppDispatch()
  const initiateInquiryInProgress = useTypedSelector(
    initiateInquiryInProgressSelector,
  )
  const initiateInquiryError = useTypedSelector(initiateInquiryErrorSelector)
  const { processName, pageData, listingTitle, title } = props
  const { listing } = pageData
  const { price, publicData } = listing?.attributes || {}
  const firstImage = listing?.images?.length > 0 ? listing.images[0] : null

  const listingType = publicData?.listingType
  const listingTypeConfigs = config.listing.listingTypes
  const listingTypeConfig = listingTypeConfigs.find(
    conf => conf.listingType === listingType,
  )
  const showPrice = displayPrice(listingTypeConfig)

  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm({
    defaultValues: { inquiryMessage: '' },
    mode: 'onChange',
    resolver: zodResolver(getSchema(t)),
  })

  const handleSendInquiry = async values => {
    const { inquiryMessage } = values
    const { listingType, transactionProcessAlias, unitType } =
      pageData?.listing?.attributes?.publicData || {}

    const process = processName ? getProcess(processName) : null
    const transitions = process.transitions
    const transition = transitions.INQUIRE_WITHOUT_PAYMENT

    // These are the inquiry parameters for the (one and only) transition
    const inquiryParams = {
      listingId: pageData?.listing?.id,
      protectedData: {
        inquiryMessage,
        ...getTransactionTypeData(listingType, unitType, config),
      },
    }

    const response = await dispatch(
      initiateInquiryWithoutPayment({
        inquiryParams,
        processAlias: transactionProcessAlias,
        transitionName: transition,
      }),
    ).unwrap()

    if (response?.uuid) {
      navigation.replace('Transaction', {
        transactionRole: CheckoutConstants.CUSTOMER,
        transactionId: response,
      })
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titleStyle}>{title}</Text>
      <RenderTextInputField
        multiline
        control={control}
        name={'inquiryMessage'}
        labelKey={'CheckoutPageWithInquiryProcess.messageLabel'}
        placeholderKey={'CheckoutPageWithInquiryProcess.messagePlaceholder'}
        onChangeText={(value, onChange) => {
          onChange(value)
        }}
      />

      <Button
        text={t('CheckoutPageWithInquiryProcess.submitButtonText')}
        onPress={handleSubmit(handleSendInquiry)}
        loading={initiateInquiryInProgress}
        disabled={!isValid}
      />
    </View>
  )
}

export default CheckoutWithInquiryProcess

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: widthScale(20),
  },
  titleStyle: {
    fontSize: fontScale(16),
    paddingBottom: heightScale(10),
  },
})
