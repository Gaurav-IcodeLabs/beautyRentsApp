import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { Button, RenderTextInputField, ScreenHeader } from '../../components';
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup';
import {
  changePassword,
  changePasswordErrorSelector,
  changePasswordInProgressSelector,
  resetPasswordState,
} from '../../slices/password.slice';
import { colors, fontWeight } from '../../theme';
import { fontScale, heightScale, widthScale } from '../../util';

export const PasswordSettings = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const inProgress = useTypedSelector(changePasswordInProgressSelector);
  const error = useTypedSelector(changePasswordErrorSelector);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      newPassword: '',
      currentPassword: '',
    },
    resolver: zodResolver(
      z.object({
        newPassword: z.string().min(8, {
          message: t('ContactDetailsForm.passwordTooShort', { minLength: 8 }),
        }),
        currentPassword: z.string().min(8, {
          message: t('ContactDetailsForm.passwordTooShort', { minLength: 8 }),
        }),
      }),
    ),
    mode: 'onChange',
  });
  const { newPassword } = useWatch({ control });

  const handleSaveChanges = handleSubmit(async params => {
    try {
      dispatch(resetPasswordState());
      const res = await dispatch(changePassword(params));
      if (res?.payload?.status === 200) {
        setValue('newPassword', '');
        setValue('currentPassword', '');
      }
    } catch (error) {
      console.log('error', error);
    }
  });

  return (
    <View style={styles.root}>
      <ScreenHeader title={t('PasswordChangePage.heading')} />
      <View style={styles.container}>
        <RenderTextInputField
          control={control}
          name={'newPassword'}
          labelKey={'PasswordChangeForm.newPasswordLabel'}
          placeholderKey={'PasswordChangeForm.newPasswordPlaceholder'}
          isPassword
        />
        {newPassword?.length ? (
          <>
            <Text style={styles.titleText}>
              {t('PasswordChangeForm.confirmChangesTitle')}
            </Text>
            <Text style={styles.titleInfoText}>
              {t('PasswordChangeForm.confirmChangesInfo')}
            </Text>
            <Text style={styles.titleResetInfoText}>
              {t('PasswordChangeForm.resetPasswordInfo')}
            </Text>

            <RenderTextInputField
              control={control}
              name={'currentPassword'}
              labelKey={'PasswordChangeForm.passwordLabel'}
              placeholderKey={'PasswordChangeForm.passwordPlaceholder'}
              isPassword
            />
          </>
        ) : null}

        {error ? (
          <Text style={styles.errorText}>
            {t('PasswordChangeForm.passwordFailed')}
          </Text>
        ) : null}

        <Button
          onPress={handleSaveChanges}
          disabled={!isValid}
          style={styles.button}
          text={t('PasswordChangeForm.saveChanges')}
          loading={inProgress}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    padding: widthScale(20),
  },
  button: {
    marginTop: 'auto',
    marginBottom: widthScale(40),
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
  },
  titleResetInfoText: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    marginBottom: heightScale(30),
  },
  errorText: {
    fontSize: fontScale(14),
    color: colors.error,
    marginTop: heightScale(20),
  },
});
