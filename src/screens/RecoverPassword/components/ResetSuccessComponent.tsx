import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  resetPasswordState,
  resetPassword,
} from '../../../slices/password.slice';
import { useAppDispatch } from '../../../sharetribeSetup';
import { fontScale, heightScale, widthScale } from '../../../util';
import { colors, fontWeight } from '../../../theme';
import { useWatch } from 'react-hook-form';

interface ResetSuccessComponentProps {
  resetPasswordSuccess: boolean;
  isCounting: boolean;
  setIsCounting: (isCounting: boolean) => void;
  control: any;
}

const ResetSuccessComponent = (props: ResetSuccessComponentProps) => {
  const {
    resetPasswordSuccess,
    isCounting,
    setIsCounting = () => {},
    control,
  } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  // const colors = useColors()
  const { email: userEmail } = useWatch({ control });
  if (!resetPasswordSuccess) return null;

  const handleOnPress = async () => {
    try {
      const res = await dispatch(resetPassword({ email: userEmail }));
      if (res?.payload?.status === 200) {
        setIsCounting(true);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const handleFixIt = () => {
    dispatch(resetPasswordState());
  };

  return (
    <View>
      {resetPasswordSuccess ? (
        <View>
          <Text style={styles.infoText}>
            {t('PasswordRecoveryPage.emailSubmittedMessage', {
              submittedEmailText: userEmail,
            })}
          </Text>

          <View>
            <Text style={styles.fixText}>
              {t('PasswordRecoveryPage.resendEmailInfo', {
                resendEmailLink: (
                  <Text
                    key={'1'}
                    style={styles.linkBtn}
                    suppressHighlighting={true}
                    onPress={handleOnPress}
                  >
                    {t('PasswordRecoveryPage.resendEmailLinkText')}
                  </Text>
                ),
              })}
            </Text>

            <Text style={styles.fixText}>
              {t('ModalMissingInformation.fixEmail', {
                fixEmailLink: (
                  <Text
                    key={'2'}
                    style={styles.linkBtn}
                    suppressHighlighting={true}
                    onPress={handleFixIt}
                  >
                    {t('ModalMissingInformation.fixEmailLinkText')}
                  </Text>
                ),
              })}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default ResetSuccessComponent;

const styles = StyleSheet.create({
  infoText: {
    paddingHorizontal: widthScale(20),
    marginTop: widthScale(20),
    fontSize: fontScale(15),
    fontWeight: fontWeight.normal,
    marginBottom: heightScale(30),
    color: colors.grey,
    textAlign: 'center',
    lineHeight: widthScale(22),
  },
  linkBtn: {
    fontSize: fontScale(14),
    color: colors.marketplaceColor,
    fontWeight: fontWeight.semiBold,
    textDecorationLine: 'underline',
  },
  fixText: {
    marginTop: widthScale(8),
    fontSize: fontScale(14),
    color: colors.grey,
    fontWeight: fontWeight.semiBold,
    textAlign: 'center',
  },
});
