import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { z } from 'zod';
import {
  Button,
  Countdown,
  RenderTextInputField,
  ScreenHeader,
} from '../../components';
import { useAppDispatch } from '../../sharetribeSetup';
import {
  resetPassword,
  resetPasswordErrorSelector,
  resetPasswordInProgressSelector,
  resetPasswordState,
  resetPasswordSuccessSelector,
} from '../../slices/password.slice';
import { colors, fontWeight } from '../../theme';
import { fontScale, heightScale, widthScale } from '../../util';
import ResetSuccessComponent from './components/ResetSuccessComponent';
import { useNavigation } from '@react-navigation/native';

export const RecoverPassword = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(
      z.object({
        email: z
          .string()
          .email({ message: t('PasswordRecoveryForm.emailInvalid') }),
      }),
    ),
    mode: 'onChange',
  });
  const dispatch = useAppDispatch();

  const [isCounting, setIsCounting] = React.useState(false);
  const resetPasswordInProgress = useSelector(resetPasswordInProgressSelector);
  const resetPasswordError = useSelector(resetPasswordErrorSelector);
  const resetPasswordSuccess = useSelector(resetPasswordSuccessSelector);

  const handleOnPress = handleSubmit(async ({ email }) => {
    try {
      const res = await dispatch(resetPassword({ email }));
      if (res?.payload?.status === 200) {
        setIsCounting(true);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  });

  const handleLoginPress = () => {
    navigation.goBack();
  };

  useEffect(() => {
    return () => {
      dispatch(resetPasswordState());
    };
  }, [dispatch]);

  const key = resetPasswordSuccess
    ? 'PasswordRecoveryPage.emailSubmittedTitle'
    : 'PasswordRecoveryPage.forgotPasswordTitle';

  return (
    <>
      <ScreenHeader title={t(key)} />
      <View style={styles.container}>
        {!resetPasswordSuccess && (
          <>
            {/* <Text style={styles.headingText}>
              {t('PasswordRecoveryPage.forgotPasswordTitle')}
            </Text> */}
            <Text style={styles.infoText}>
              {t('PasswordRecoveryPage.forgotPasswordMessage')}
            </Text>
            <RenderTextInputField
              control={control}
              name={'email'}
              labelKey={'PasswordRecoveryForm.emailLabel'}
              placeholderKey={'PasswordRecoveryForm.emailPlaceholder'}
              disabled={false}
              autoCapitalize="none"
              onChangeText={(value: string, onChange) => {
                onChange(value);
                if (resetPasswordError) {
                  dispatch(resetPasswordState());
                }
              }}
            />
          </>
        )}
        {resetPasswordError && (
          <View>
            <Text style={styles.errorTxt}>
              {t('PasswordResetPage.resetFailed')}
            </Text>
          </View>
        )}

        <ResetSuccessComponent
          isCounting={isCounting}
          setIsCounting={setIsCounting}
          control={control}
          resetPasswordSuccess={resetPasswordSuccess}
        />

        <Countdown
          isCounting={isCounting}
          setIsCounting={setIsCounting}
          initialSeconds={30}
          txt={t('PasswordRecoveryPage.resendEmail')}
          containerStyle={styles.contdownContainerStyle}
          timerNumberStyle={styles.numberStyle}
        />

        {!resetPasswordSuccess ? (
          <View style={styles.buttonSection}>
            <Button
              onPress={handleOnPress}
              disabled={!isValid}
              style={styles.button}
              text={t('PasswordRecoveryForm.sendInstructions')}
              loading={resetPasswordInProgress}
            />

            <Text style={styles.loginLinkText}>
              {t('PasswordRecoveryForm.loginLinkInfo', {
                loginLink: (
                  <Text
                    key={'1'}
                    style={styles.loginLinkBtnText}
                    suppressHighlighting={true}
                    onPress={handleLoginPress}
                  >
                    {t('PasswordRecoveryForm.loginLinkText')}
                  </Text>
                ),
              })}
            </Text>
          </View>
        ) : null}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: widthScale(20),
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
    textAlign: 'center',
    color: colors.grey,
  },
  loginLinkText: {
    textAlign: 'center',
    marginTop: heightScale(15),
  },
  loginLinkBtn: {
    marginBottom: heightScale(-3),
  },
  loginLinkBtnText: {
    fontWeight: fontWeight.medium,
    fontSize: fontScale(14),
    color: colors.marketplaceColor,
  },
  buttonSection: {
    flex: 1,
    marginVertical: heightScale(30),
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: widthScale(20),
  },
  errorTxt: {
    fontSize: widthScale(14),
    color: colors.error,
  },
  contdownContainerStyle: {
    marginTop: widthScale(20),
  },
  numberStyle: {
    fontWeight: fontWeight.normal,
    fontSize: fontScale(14),
    color: colors.marketplaceColor,
  },
});
