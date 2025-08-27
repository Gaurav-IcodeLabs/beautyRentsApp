import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fontScale, widthScale } from '../../../util';
import { colors, fontWeight } from '../../../theme';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

export default function SignUpHeader() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  return (
    <View style={Styles.container}>
      <Text style={Styles.heading}>{t('SignupForm.signUp')}</Text>
      <View style={Styles.haveAnAccSection}>
        <Text style={Styles.text}>{t('SignupForm.haveAnAccount')} </Text>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={Styles.textSignup}>{t('SignupForm.signIn')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const Styles = StyleSheet.create({
  container: {
    paddingHorizontal: widthScale(20),
    backgroundColor: colors.black,
    height: widthScale(240),
    paddingTop: widthScale(30),
    justifyContent: 'center',
  },
  heading: {
    fontSize: widthScale(32),
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  haveAnAccSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: widthScale(10),
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
