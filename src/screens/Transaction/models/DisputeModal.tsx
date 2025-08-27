import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import React from 'react'
import { fontScale, widthScale } from '../../../util'
import { cross } from '../../../assets'
import { useTranslation } from 'react-i18next'
import { colors, fontWeight } from '../../../theme'
import { useConfiguration } from '../../../context'
import { useForm } from 'react-hook-form'
import { Button, RenderTextInputField } from '../../../components'
import { lightenColor } from '../../../util/data'

const DisputeInfo = props => {
  const { t } = useTranslation()
  const config = useConfiguration()
  const marketplaceName = config.marketplaceName
  const {
    control,
    disputeError,
    onDisputeOrder,
    handleSubmit,
    submitDisabled,
  } = props
  return (
    <>
      <Text style={styles.title}>{t('DisputeModal.title')}</Text>
      <Text style={styles.description}>
        {t('DisputeModal.description', { marketplaceName })}
      </Text>

      <RenderTextInputField
        control={control}
        name={'disputeReason'}
        labelKey={'DisputeModal.label'}
        placeholderKey={'DisputeModal.disputePlaceholder'}
        multiline
      />
      {disputeError ? (
        <Text>{t('DisputeModal.disputeSubmitFailed')}</Text>
      ) : null}
      <Button
        onPress={handleSubmit(onDisputeOrder)}
        disabled={submitDisabled}
        text={t('DisputeModal.submit')}
        style={styles.buttonStyle}
        textStyle={styles.buttonTextStyle}
      />
    </>
  )
}

const DisputeSentInfo = () => {
  const { t } = useTranslation()
  return (
    <>
      <Text style={styles.title}>{t('DisputeModal.sentTitle')}</Text>
      <Text style={styles.description}>{t('DisputeModal.sentMessage')}</Text>
      <Text style={styles.description}>{t('DisputeModal.sentNextStep')}</Text>
    </>
  )
}
const DisputeModal = props => {
  const { t } = useTranslation()

  const {
    isOpen,
    onCloseModal,
    onDisputeOrder,
    disputeSubmitted,
    disputeInProgress,
    disputeError,
  } = props

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm({
    defaultValues: {
      disputeReason: '',
    },
    mode: 'onChange',
  })

  const submitInProgress = disputeInProgress
  const submitDisabled = submitInProgress || disputeSubmitted
  return (
    <Modal visible={isOpen} animationType="fade" onRequestClose={onCloseModal}>
      <ScrollView contentContainerStyle={styles.centeredView}>
        <TouchableOpacity
          style={styles.closeContainerStyle}
          onPress={onCloseModal}>
          <Text>{t('DisputeModal.close')}</Text>
          <Image source={cross} style={styles.crossImageStyle} />
        </TouchableOpacity>
        {disputeSubmitted ? (
          <DisputeSentInfo />
        ) : (
          <DisputeInfo
            control={control}
            disputeError={disputeError}
            onDisputeOrder={onDisputeOrder}
            handleSubmit={handleSubmit}
            submitDisabled={submitDisabled}
          />
        )}
      </ScrollView>
    </Modal>
  )
}

export default DisputeModal

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    marginTop: widthScale(22),
    padding: widthScale(20),
  },
  closeContainerStyle: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    gap: 5,
  },
  crossImageStyle: {
    width: widthScale(20),
    height: widthScale(20),
  },
  title: {
    fontSize: fontScale(18),
    fontWeight: fontWeight.semiBold,
    paddingVertical: widthScale(10),
  },
  description: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.medium,
    paddingVertical: widthScale(10),
  },
  buttonStyle: {
    backgroundColor: lightenColor(colors.grey, 10),
    borderColor: colors.grey,
    borderWidth: 1,
  },
  buttonTextStyle: {
    color: colors.grey,
  },
})
