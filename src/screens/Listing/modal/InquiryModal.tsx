import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import React from 'react'
import { fontScale, heightScale, widthScale } from '../../../util'
import { cross } from '../../../assets'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, RenderTextInputField } from '../../../components'
import { fontWeight } from '../../../theme'
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup'
import {
  sendInquiry,
  sendInquiryErrorSelector,
  sendInquiryInProgressSelector,
} from '../Listing.slice'
import { useNavigation } from '@react-navigation/native'
import { CheckoutConstants } from '../../../appTypes/enums/checkout'
import { Listing } from '../../../appTypes'

interface InquiryModalProps {
  isInquiryModalOpen: boolean
  onCloseInquiryModal: () => void
  listing: Listing
}

const getSchema = t => {
  const formSchema = z.object({
    message: z.string().min(1, t('InquiryForm.messageRequired')),
  })
  return formSchema
}

const InquiryModal = (props: InquiryModalProps) => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const { isInquiryModalOpen, onCloseInquiryModal, listing } = props
  const sendInquiryInProgress = useTypedSelector(state =>
    sendInquiryInProgressSelector(state, listing?.id?.uuid),
  )
  const sendInquiryError = useTypedSelector(state =>
    sendInquiryErrorSelector(state, listing?.id?.uuid),
  )
  const {
    handleSubmit,
    formState: { isValid },
    control,
  } = useForm({
    defaultValues: {
      message: '',
    },
    mode: 'onChange',
    resolver: zodResolver(getSchema(t)),
  })
  const authorDisplayName = listing?.author?.attributes?.profile?.displayName
  const listingTitle = listing?.attributes?.title
  const messageLabel = t('InquiryForm.messageLabel', { authorDisplayName })
  const messagePlaceholder = t('InquiryForm.messagePlaceholder', {
    authorDisplayName,
  })

  const onSubmitInquiry = async values => {
    const { message } = values
    const response = await dispatch(sendInquiry({ listing, message })).unwrap()
    if (response?.uuid) {
      navigation.navigate('Transaction', {
        transactionRole: CheckoutConstants.CUSTOMER,
        transactionId: response,
      })
      onCloseInquiryModal()
    }
  }
  console.log('sendInquiryInProgress', sendInquiryInProgress)
  return (
    <Modal
      visible={isInquiryModalOpen}
      onRequestClose={onCloseInquiryModal}
      animationType="slide">
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.closeContainerStyle}
          onPress={onCloseInquiryModal}>
          <Image source={cross} style={styles.crossImageStyle} />
        </TouchableOpacity>

        <Text style={styles.titleStyle}>
          {t('InquiryForm.heading', { listingTitle })}
        </Text>
        <RenderTextInputField
          control={control}
          name={'message'}
          labelKey={messageLabel}
          placeholderKey={messagePlaceholder}
          multiline
        />
        {sendInquiryError ? (
          <Text>{t('InquiryForm.sendInquiryErrorNoProcess')}</Text>
        ) : null}
        <Button
          text={t('InquiryForm.submitButtonText')}
          onPress={handleSubmit(onSubmitInquiry)}
          loading={sendInquiryInProgress}
          disabled={!isValid}
        />
      </View>
    </Modal>
  )
}

export default InquiryModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: widthScale(22),
    padding: widthScale(20),
  },
  closeContainerStyle: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  crossImageStyle: {
    width: widthScale(20),
    height: widthScale(20),
  },
  titleStyle: {
    fontSize: fontScale(18),
    fontWeight: fontWeight.bold,
    paddingVertical: heightScale(20),
  },
})
