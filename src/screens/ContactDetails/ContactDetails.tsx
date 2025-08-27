import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { ContactDetailsProps } from '../../appTypes'
import { Button, RenderTextInputField, ScreenHeader } from '../../components'
import { useConfiguration } from '../../context'
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup'
import {
  currentUserSelector,
  updateCurrentUser,
  updateCurrentUserInProgressSelector,
} from '../../slices/user.slice'
import { colors, fontWeight } from '../../theme'
import {
  fontScale,
  heightScale,
  isTooManyEmailVerificationRequestsError,
  screenHeight,
  screenWidth,
  widthScale,
} from '../../util'

import {
  changeEmail,
  changeEmailErrorSelector,
  changeEmailInProgressSelector,
  sendVerificationEmail,
  sendVerificationEmailErrorSelector,
  sendVerificationEmailInProgressSelector,
  verifyEmail,
  verifyEmailErrorSelector,
  verifyEmailInProgressSelector,
  verifyEmailSuccessSelector,
} from './ContactDetails.slice'
import { z } from 'zod'
import { useRoute } from '@react-navigation/native'

const getSchema = (t: (key: string) => string) => {
  const formSchema = z.object({
    email: z.string().email(t('LoginForm.emailInvalid')),
    password: z.string().min(8, t('LoginForm.passwordRequired')),
    phoneNumber: z
      .string()
      .min(10, t('ContactDetailsForm.phoneNumberInvalid', { minLength: 10 })),
  })

  return formSchema
}

export const ContactDetails: React.FC<ContactDetailsProps> = ({
  navigation,
}) => {
  const { t } = useTranslation()
  const config = useConfiguration()
  const routes = useRoute()
  const { verificationToken } = routes.params || ''
  const currentUser = useTypedSelector(currentUserSelector)
  const dispatch = useAppDispatch()
  const emailChangeError = useTypedSelector(changeEmailErrorSelector)
  const changeEmailInProgress = useTypedSelector(changeEmailInProgressSelector)
  const { emailVerified, email, pendingEmail } = currentUser?.attributes || {}
  const { publicData, protectedData } = currentUser?.attributes?.profile || {}
  const currentPhoneNumber = protectedData?.phoneNumber || ''
  const userType = publicData?.userType
  const { userTypes = [] } = config.user
  const userTypeConfig =
    userType && userTypes.find(config => config.userType === userType)
  const { required } = userTypeConfig?.phoneNumberSettings || {}
  const isRequired = required === true //true
  const isPhDisabled = userTypeConfig?.defaultUserFields?.phoneNumber === false
  const updateUserInProgress = useTypedSelector(
    updateCurrentUserInProgressSelector,
  )
  const verifyEmailInProgress = useTypedSelector(verifyEmailInProgressSelector)
  const verifyEmailSuccess = useTypedSelector(verifyEmailSuccessSelector)
  const verifyEmailFailure = useTypedSelector(verifyEmailErrorSelector)
  const sendVerificationEmailInProgress = useTypedSelector(
    sendVerificationEmailInProgressSelector,
  )
  const sendVerificationEmailError = useTypedSelector(
    sendVerificationEmailErrorSelector,
  )

  const tooManyVerificationRequests = isTooManyEmailVerificationRequestsError(
    sendVerificationEmailError,
  )

  useEffect(() => {
    if (verificationToken != null) {
      dispatch(verifyEmail(verificationToken))
    }
  }, [])
  const {
    control,
    handleSubmit,
    formState: { isValid },
    setValue,
  } = useForm({
    defaultValues: {
      email: email ?? '',
      password: '',
      phoneNumber: currentPhoneNumber ?? '',
    },
    resolver: zodResolver(getSchema(t)),
    mode: 'onChange',
  })
  const { email: updatedEmail, phoneNumber: UpdatedPhoneNumber } = useWatch({
    control,
  })
  const changesInEmail = email !== updatedEmail
  const changesInPh = currentPhoneNumber !== UpdatedPhoneNumber
  const handleSaveChanges = handleSubmit(async params => {
    try {
      const actions = []
      if (changesInEmail) {
        actions.push(dispatch(changeEmail(params)))
      }
      if (changesInPh) {
        actions.push(
          dispatch(
            updateCurrentUser({
              protectedData: {
                phoneNumber: UpdatedPhoneNumber,
              },
            }),
          ),
        )
      }
      if (actions.length > 0) {
        await Promise.all(actions)
      }
      setValue('password', '')
    } catch (error) {
      console.log('error', error)
    }
  })
  const handleResendVerificationEmail = async () => {
    await dispatch(sendVerificationEmail())
  }
  let resendEmailMessage = null
  resendEmailMessage = tooManyVerificationRequests
    ? t('ContactDetailsForm.tooManyVerificationRequests')
    : sendVerificationEmailInProgress
      ? t('ContactDetailsForm.emailSent')
      : t('ContactDetailsForm.resendEmailVerificationText')

  return (
    <>
      <ScreenHeader title={t('ContactDetailsPage.heading')} />
      <View style={styles.container}>
        <RenderTextInputField
          control={control}
          name={'email'}
          labelKey={'ContactDetailsForm.emailLabel'}
          placeholderKey={'PasswordRecoveryForm.emailPlaceholder'}
          disabled={false}
          autoCapitalize="none"
        />
        {emailVerified && !pendingEmail ? (
          <Text style={styles.emailVerifyText}>
            {t('ContactDetailsForm.emailVerified')}
          </Text>
        ) : !emailVerified && !pendingEmail ? (
          <TouchableOpacity onPress={handleResendVerificationEmail}>
            <Text style={styles.emailNotVerifyText}>
              {t('ContactDetailsForm.emailUnverified', { resendEmailMessage })}
            </Text>
          </TouchableOpacity>
        ) : pendingEmail ? (
          <Text style={styles.emailNotVerifyText}>
            {t('ContactDetailsForm.pendingEmailUnverified')}
          </Text>
        ) : null}

        <RenderTextInputField
          type={'numeric'}
          control={control}
          name={'phoneNumber'}
          labelKey={'ContactDetailsForm.phoneLabel'}
          placeholderKey={'ContactDetailsForm.phonePlaceholder'}
          disabled={isPhDisabled}
          rules={{ isRequired: true }}
        />

        {changesInEmail || changesInPh ? (
          <>
            <Text style={styles.titleText}>
              {t('ContactDetailsForm.confirmChangesTitle')}
            </Text>
            <Text style={styles.titleInfoText}>
              {t('ContactDetailsForm.confirmChangesInfo')}
            </Text>

            <RenderTextInputField
              control={control}
              name={'password'}
              labelKey={'ContactDetailsForm.passwordLabel'}
              placeholderKey={'ContactDetailsForm.passwordPlaceholder'}
              isPassword
            />

            {emailChangeError ? (
              emailChangeError.message.includes('403') ? (
                <Text style={styles.errorText}>
                  {t('ContactDetailsForm.passwordFailed')}
                </Text>
              ) : emailChangeError.message.includes('409') ? (
                <Text style={styles.errorText}>
                  {t('ContactDetailsForm.emailTakenError')}
                </Text>
              ) : (
                <Text style={styles.errorText}>
                  {t('ContactDetailsForm.genericFailure')}
                </Text>
              )
            ) : null}
          </>
        ) : null}
        <Button
          onPress={handleSaveChanges}
          disabled={!isValid || (!changesInEmail && !changesInPh)}
          style={styles.button}
          text={t('ContactDetailsForm.saveChanges')}
          loading={changeEmailInProgress || updateUserInProgress}
        />
      </View>

      {verifyEmailInProgress && (
        <View style={styles.activityIndicator}>
          <ActivityIndicator size="large" color={colors.darkGrey} />
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: widthScale(20),
    marginHorizontal: widthScale(16),
  },
  emailVerifyText: {
    color: colors.success,
    marginLeft: widthScale(10),
    marginBottom: heightScale(20),
  },
  emailNotVerifyText: {
    color: colors.error,
    marginLeft: widthScale(10),
    marginBottom: heightScale(20),
  },
  titleText: {
    fontSize: fontScale(18),
    marginTop: heightScale(20),
    fontWeight: fontWeight.semiBold,
  },
  titleInfoText: {
    fontSize: fontScale(14),
    marginTop: heightScale(20),
    fontWeight: fontWeight.normal,
    marginBottom: heightScale(30),
  },
  errorText: {
    color: colors.error,
  },
  button: {
    marginTop: widthScale(20),
  },
  activityIndicator: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: screenHeight,
    width: screenWidth,
  },
})
