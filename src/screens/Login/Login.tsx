import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LoginScreenProps } from '../../appTypes';
import { useConfiguration } from '../../context';
import { useAppDispatch } from '../../sharetribeSetup';
import { login } from '../../slices/auth.slice';
import { colors, fontWeight } from '../../theme';
import { fontScale, heightScale, widthScale } from '../../util';
import LoginForm from './LoginForm';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
interface LoginValues {
  email: string;
  password: string;
}

export const Login: React.FC<LoginScreenProps> = props => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const config = useConfiguration();

  const { navigation } = props;

  const submitLogin = async (values: LoginValues) => {
    const { email, password } = values;
    const res = await dispatch(login({ username: email, password })).unwrap();

    if (res?.id.uuid) {
      navigation.navigate('Main');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        style={styles.formScrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.marketplaceName}>
            {t('LoginForm.welcome', {
              marketplaceName: config.marketplaceName,
            })}
          </Text>

          <View style={styles.haveAnAccSection}>
            <Text style={styles.text}>{t('LoginForm.dontHaveAnAccount')} </Text>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.textSignup}>{t('SignupForm.signUp')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <LoginForm submitLogin={submitLogin} />
      </KeyboardAwareScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  formScrollContainer: {
    flex: 1,
    backgroundColor: colors.white,
    // paddingVertical: heightScale(10),
    // paddingHorizontal: widthScale(20),
  },
  headerSection: {
    paddingHorizontal: widthScale(20),
    justifyContent: 'flex-end',
    backgroundColor: colors.black,
    height: widthScale(280),
    paddingBottom: widthScale(30),
  },
  marketplaceName: {
    fontWeight: fontWeight.bold,
    fontSize: fontScale(32),
    marginBottom: heightScale(10),
    color: colors.white,
  },
  haveAnAccSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: colors.white,
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
  },
  textSignup: {
    color: colors.marketplaceColor,
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
    textDecorationLine: 'underline',
  },
});
