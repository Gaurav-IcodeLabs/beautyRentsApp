import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { z } from 'zod'
import {
  Button,
  Countdown,
  RenderTextInputField,
  ScreenHeader,
} from '../../components'
import { useColors } from '../../context'
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup'
import { resetPassword } from '../../slices/password.slice'
import { currentUserEmailSelector } from '../../slices/user.slice'
import { AppColors, fontWeight } from '../../theme'
import { fontScale, widthScale } from '../../util'

export const DeleteAccount = () => {
  const { t } = useTranslation()
  const userEmail = useTypedSelector(currentUserEmailSelector)
  const dispatch = useAppDispatch()
  const colors: AppColors = useColors()
  const [isCounting, setIsCounting] = React.useState(false)
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      password: '',
    },
    resolver: zodResolver(
      z.object({
        password: z.string().min(8),
      }),
    ),
    mode: 'onChange',
  })

  const onRecoverPassword = async () => {
    try {
      const res = await dispatch(resetPassword({ email: userEmail }))
      if (res?.payload?.status === 200) {
        setIsCounting(true)
      }
    } catch (error) {
      console.error('Error resetting password:', error)
    }
  }

  return (
    <>
      <ScreenHeader title={t('LayoutWrapperAccountSettingsSideNav.deleteAccountTabTitle')} />
      <View style={styles.container}>
        <Text style={styles.heading}>{t('DeleteAccountPage.heading')}</Text>
        <Text style={styles.description}>{t('DeleteAccountPage.details')}</Text>
        <Text style={styles.confirmDeleteTxt}>
          {t('DeleteAccountForm.confirmChangesTitle')}
        </Text>
        <Text style={styles.description}>
          {t('To delete your account, please enter your current password.')}
        </Text>
        <Text style={styles.description}>
          {t('DeleteAccountForm.resetPasswordInfo', {
            resetPasswordLink: (
              <TouchableOpacity
                disabled={isCounting}
                onPress={onRecoverPassword}
                style={[styles.linkTouchable, isCounting && { opacity: 0.5 }]}>
                <Text style={styles.resetInstructionsLink}>
                  {t('DeleteAccountForm.resendPasswordLinkText')}
                </Text>
              </TouchableOpacity>
            ),
          })}
        </Text>

        <Countdown
          isCounting={isCounting}
          setIsCounting={setIsCounting}
          initialSeconds={30}
          txt={t('PasswordRecoveryPage.resendEmail')}
          containerStyle={styles.contdownContainerStyle}
          timerNumberStyle={[
            styles.numberStyle,
            { color: colors.marketplaceColor },
          ]}
        />

        <RenderTextInputField
          control={control}
          name="password"
          placeholderKey={t('DeleteAccountForm.passwordPlaceholder')}
          labelKey={t('DeleteAccountForm.passwordLabel')}
          isPassword
        />
        <Button
          onPress={handleSubmit(onRecoverPassword)}
          disabled={!isValid}
          text={t('LayoutWrapperAccountSettingsSideNav.deleteAccountTabTitle')}
          style={styles.btnStyle}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: widthScale(16) },
  heading: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.semiBold,
    marginBottom: widthScale(10),
  },
  description: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    marginBottom: widthScale(10),
  },
  confirmDeleteTxt: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.semiBold,
    marginTop: widthScale(10),
    marginBottom: widthScale(10),
  },
  resetInstructionsLink: {
    lineHeight: widthScale(24),
    fontSize: fontScale(14),
    fontWeight: fontWeight.bold,
  },
  linkTouchable: {},
  contdownContainerStyle: {
    marginVertical: widthScale(10),
  },
  numberStyle: {
    fontWeight: fontWeight.normal,
    fontSize: fontScale(14),
  },
  btnStyle: { marginTop: widthScale(20) },
})
