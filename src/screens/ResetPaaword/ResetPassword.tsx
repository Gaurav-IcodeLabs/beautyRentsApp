import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { Button, RenderTextInputField, ScreenHeader } from '../../components';
import {
  resetPasswordState,
  setNewPassword,
  setNewPasswordErrorSelector,
  setNewPasswordInProgressSelector,
  setNewPasswordSuccessSelector,
} from '../../slices/password.slice';
import { colors, fontWeight } from '../../theme';
import { fontScale, heightScale, widthScale } from '../../util';
import { getEmailAndTokenFromUrl } from './helper';

export const ResetPassword = () => {
  const routes = useRoute();
  const { email, passwordResetToken } = routes.params;
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      password: '',
    },
    resolver: zodResolver(
      z.object({
        password: z.string().min(
          8,
          t('PasswordRecoveryPage.passwordTooShort', {
            minLength: 8,
          }),
        ),
      }),
    ),
    mode: 'onChange',
  });
  // const { token, email } = getEmailAndTokenFromUrl(url)

  const setNewPasswordInProgress = useSelector(
    setNewPasswordInProgressSelector,
  );
  const setNewPasswordError = useSelector(setNewPasswordErrorSelector);
  const setNewPasswordSuccess = useSelector(setNewPasswordSuccessSelector);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    return () => {
      dispatch(resetPasswordState());
    };
  }, [dispatch]);

  return (
    <>
      <ScreenHeader title={t('PasswordResetPage.mainHeading')} />
      <View style={styles.container}>
        {!setNewPasswordSuccess && (
          <>
            <Text style={styles.infoText}>
              {t('PasswordResetPage.helpText')}
            </Text>
            <RenderTextInputField
              control={control}
              name={'password'}
              labelKey={'PasswordResetForm.passwordLabel'}
              placeholderKey={'PasswordChangeForm.newPasswordPlaceholder'}
              autoCapitalize="none"
              isPassword={true}
            />
          </>
        )}

        {setNewPasswordError && (
          <Text style={styles.error}>
            {t('PasswordRecoveryPage.actionFailedTitle') +
              ' ' +
              t('PasswordRecoveryPage.actionFailedMessage')}
          </Text>
        )}
        {setNewPasswordSuccess && (
          <>
            <Text style={styles.successHeading}>
              {t('PasswordResetPage.passwordChangedHeading')}
            </Text>
            <Text style={styles.success}>
              {t('PasswordResetPage.passwordChangedHelpText')}
            </Text>
          </>
        )}

        <Button
          onPress={
            setNewPasswordSuccess
              ? () => navigation.replace('Login')
              : handleSubmit(({ password }) => {
                  dispatch(
                    setNewPassword({
                      email: email,
                      passwordResetToken: passwordResetToken,
                      newPassword: password,
                    }),
                  );
                })
          }
          disabled={!isValid}
          style={styles.button}
          text={
            setNewPasswordSuccess
              ? t('PasswordRecoveryPage.login')
              : t('PasswordResetForm.submitButtonText')
          }
          loading={setNewPasswordInProgress}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: widthScale(20),
    backgroundColor: colors.white,
  },
  headingText: {
    fontSize: fontScale(18),
    fontWeight: fontWeight.bold,
    marginBottom: heightScale(15),
  },
  infoText: {
    fontSize: fontScale(15),
    fontWeight: fontWeight.normal,
    marginBottom: heightScale(30),
  },
  button: {
    marginTop: widthScale(20),
  },
  error: {
    color: colors.error,
  },
  successHeading: {
    color: colors.success,
    fontSize: widthScale(20),
    fontWeight: fontWeight.bold,
    // textAlign: 'center',
    marginBottom: widthScale(20),
  },
  success: {
    color: colors.success,
  },
});
