import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import React, { useState } from 'react'
import { colors, fontWeight } from '../../../theme'
import { lightenColor } from '../../../util/data'
import {
  fontScale,
  isTransactionsTransitionAlreadyReviewed,
  widthScale,
} from '../../../util'
import { useTranslation } from 'react-i18next'
import { cross } from '../../../assets'
import { useColors, useConfiguration } from '../../../context'
import { useForm } from 'react-hook-form'
import { Button, RenderTextInputField } from '../../../components'
import { AppColors } from '../../../theme'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const getSchema = t => {
  const formSchema = z.object({
    reviewRating: z.number(),
    reviewContent: z.string().min(1, t('ReviewForm.reviewContentRequired')),
  })
  return formSchema
}

const ReviewRating = props => {
  const { control, setValue } = props
  const colorsData: AppColors = useColors()
  const { t } = useTranslation()

  const [rating, setRating] = useState(0)
  const handlePress = newRating => {
    setRating(newRating)
    setValue('reviewRating', newRating, { shouldValidate: true })
  }

  const renderNumber = number => {
    const isSelected = number <= rating
    const color = isSelected ? colorsData.marketplaceColor : colors.grey

    return (
      <TouchableOpacity key={number} onPress={() => handlePress(number)}>
        <Text style={[styles.number, { color }]} key={`number-${number}`}>
          {number}
        </Text>
      </TouchableOpacity>
    )
  }

  const numbers = Array.from({ length: 5 }, (_, i) => i + 1)

  return (
    <View style={styles.ratingContainer}>
      <Text>{t('ReviewForm.reviewRatingLabel')}</Text>
      <View style={styles.rating}>{numbers.map(renderNumber)}</View>
    </View>
  )
}

const ReviewForm = props => {
  const { t } = useTranslation()
  const { onSubmitReview, reviewSent, sendReviewInProgress, sendReviewError } =
    props
  const {
    handleSubmit,
    getValues,
    setValue,
    formState: { isValid, errors },
    control,
  } = useForm({
    defaultValues: {
      reviewRating: 0,
      reviewContent: '',
    },
    mode: 'onChange',
    resolver: zodResolver(getSchema(t)),
  })

  const errorMessage = isTransactionsTransitionAlreadyReviewed(sendReviewError)
    ? t('ReviewForm.reviewSubmitAlreadySent')
    : t('ReviewForm.reviewSubmitFailed')

  return (
    <>
      <ReviewRating control={control} setValue={setValue} />
      <RenderTextInputField
        control={control}
        name={'reviewContent'}
        labelKey={'ReviewForm.reviewContentLabel'}
        placeholderKey={'ReviewForm.reviewContentPlaceholder'}
        multiline
      />
      {sendReviewError ? <Text>{errorMessage}</Text> : null}
      <Button
        text={t('ReviewForm.reviewSubmit')}
        onPress={handleSubmit(onSubmitReview)}
        loading={sendReviewInProgress}
        disabled={!isValid}
      />
    </>
  )
}

const ReviewModal = props => {
  const { t } = useTranslation()
  const config = useConfiguration()
  const marketplaceName = config.marketplaceName
  const {
    isOpen,
    onCloseModal,
    user,
    onSubmitReview,
    sendReviewInProgress,
    sendReviewError,
    reviewSent,
  } = props

  const userDisplayName = user?.attributes?.profile.displayName || {}

  const displayName = userDisplayName ? userDisplayName : null
  return (
    <Modal visible={isOpen} onRequestClose={onCloseModal} animationType="fade">
      <ScrollView contentContainerStyle={styles.centeredView}>
        <TouchableOpacity
          style={styles.closeContainerStyle}
          onPress={onCloseModal}>
          <Text>{t('ReviewModal.later')}</Text>
          <Image source={cross} style={styles.crossImageStyle} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {t('ReviewModal.title', { revieweeName: displayName })}
        </Text>
        <Text style={styles.description}>
          {t('ReviewModal.description', { marketplaceName })}
        </Text>
        <ReviewForm
          onSubmitReview={onSubmitReview}
          reviewSent={reviewSent}
          sendReviewInProgress={sendReviewInProgress}
          sendReviewError={sendReviewError}
        />
      </ScrollView>
    </Modal>
  )
}

export default ReviewModal

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
    marginVertical: widthScale(10),
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
  rating: {
    flexDirection: 'row',
    gap: 10,
  },
  number: {
    fontSize: 20,
    textAlign: 'center',
  },
  ratingContainer: {
    paddingVertical: 10,
  },
})
