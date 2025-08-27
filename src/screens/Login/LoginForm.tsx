import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, RenderTextInputField } from '../../components';
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup';
import {
  loginErrorSelector,
  loginInProgressSelector,
  resetAuthState,
} from '../../slices/auth.slice';
import { colors, fontWeight } from '../../theme';
import { fontScale, heightScale, widthScale } from '../../util';
import { getSchema } from './helper';

const LoginForm = props => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const loginInProgress = useTypedSelector(loginInProgressSelector);
  const loginError = useTypedSelector(loginErrorSelector);
  const { submitLogin } = props;

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(getSchema(t)),
    mode: 'onChange',
  });

  const goingToForgetPassword = () => {
    navigation.navigate('RecoverPassword');
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginForm}>
        <RenderTextInputField
          control={control}
          name={'email'}
          type="email-address"
          labelKey={'SignupForm.emailLabel'}
          placeholderKey={'SignupForm.emailPlaceholder'}
          onChangeText={(value, onChange) => {
            onChange(value.toLowerCase());
            if (loginError) dispatch(resetAuthState());
          }}
        />
        <RenderTextInputField
          control={control}
          name={'password'}
          labelKey={'SignupForm.passwordLabel'}
          placeholderKey={'SignupForm.passwordPlaceholder'}
          isPassword
          onChangeText={(value, onChange) => {
            onChange(value);
            if (loginError) dispatch(resetAuthState());
          }}
        />
      </View>

      <View style={styles.resetPassSection}>
        <TouchableOpacity onPress={goingToForgetPassword} activeOpacity={0.5}>
          <Text style={styles.text}>{t('LoginForm.forgotPassword')}</Text>
        </TouchableOpacity>
      </View>
      {loginError && loginError?.message.includes('401') ? (
        <Text style={styles.textLoginFailed}>
          {t('AuthenticationPage.loginFailed')}
        </Text>
      ) : null}
      <Button
        onPress={handleSubmit(submitLogin)}
        disabled={!isValid}
        text={t('LoginForm.logIn')}
        loading={loginInProgress}
        loaderColor={colors.white}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: widthScale(20),
  },
  loginForm: {
    marginTop: heightScale(10),
  },
  text: {
    color: colors.marketplaceColor,
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
  },
  btnText: {
    fontWeight: fontWeight.medium,
    fontSize: fontScale(14),
  },
  resetPassSection: {
    alignItems: 'flex-end',
    marginBottom: heightScale(10),
  },
  textLoginFailed: {
    color: colors.error,
    textAlign: 'center',
  },
  button: {
    marginTop: widthScale(30),
  },
});

export default LoginForm;
