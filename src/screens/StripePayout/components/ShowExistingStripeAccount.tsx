import {Linking, StyleSheet, Text, View, Image} from 'react-native';
import React, {FC, useState} from 'react';
import {
  getBankAccountLast4Digits,
  getStripeAccountData,
  hasRequirements,
} from '../../../helpers/StripeHelpers';
import {useAppDispatch, useTypedSelector} from '../../../sharetribeSetup';
import {
  getStripeConnectAccountLink,
  stripeAccountSelector,
} from '../../../slices/StripeConnectAccount.slice';
import {fontScale, heightScale, widthScale} from '../../../util';
import {colors, fontWeight} from '../../../theme';
import {useTranslation} from 'react-i18next';
import {Button} from '../../../components';
import {checkMark} from '../../../assets';
import StripeWebViewDetailForm from './StripeWebViewDetailForm';
import {StripeConnect} from '../../../appTypes';
import {REACT_NATIVE_SDK_BASE_URL} from '@env';

const ShowExistingStripeAccount: FC = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const [isLoadingStripeLink, setLoadingStripeLink] = useState(false);
  const [isWebViewVisible, setWebViewVisible] = useState({
    show: false,
    url: '',
  });
  const stripeAccount = useTypedSelector(stripeAccountSelector) as any;
  const stripeConnected = !!stripeAccount && !!stripeAccount.id;
  const accountId = stripeAccount?.id;
  const stripeAccountData = stripeConnected
    ? getStripeAccountData(stripeAccount)
    : null;
  const stripeBankAccountLastDigits =
    getBankAccountLast4Digits(stripeAccountData);
  const requirementsMissing =
    stripeAccount &&
    (hasRequirements(stripeAccountData, 'past_due') ||
      hasRequirements(stripeAccountData, 'currently_due'));

  const handleStripeAgreement = async () => {
    await Linking.openURL(
      StripeConnect.STRIPE_CONNECTED_ACCOUNT_AGREEMENT_LINK,
    );
  };

  const handleGetStripeConnectAccountLink = async (type: string) => {
    try {
      setLoadingStripeLink(true);

      const url = await dispatch(
        getStripeConnectAccountLink({
          type,
          accountId,
          failureURL: `${REACT_NATIVE_SDK_BASE_URL}/account/payments/failure`,
          successURL: `${REACT_NATIVE_SDK_BASE_URL}/account/payments/success`,
        }),
      ).unwrap();

      setWebViewVisible({show: true, url});
      // Linking.openURL(url);
    } catch (err) {
      console.error('Failed to get Stripe account link:', err);
    } finally {
      setLoadingStripeLink(false);
    }
  };

  return (
    <View style={styles.topMargin}>
      <View style={styles.cardContainer}>
        <Text style={styles.cardText}>Account</Text>
        <Text style={styles.cardText}>
          •••• •••• •••• {stripeBankAccountLastDigits}
        </Text>
      </View>
      {requirementsMissing ? (
        <>
          <View style={styles.Box}>
            <Text style={styles.infoText}>
              {t('StripeRequirmentMissingText')}
            </Text>
            <Button
              loading={isLoadingStripeLink}
              disabled={isLoadingStripeLink}
              text={t('StripeVerifyButtonText')}
              onPress={() =>
                handleGetStripeConnectAccountLink('custom_account_verification')
              }
            />
          </View>
          <Text style={styles.agreeText}>
            {t('StripeConnectAccountForm.stripeToSText', {
              stripeConnectedAccountTermsLink: 'Stripe Connected Account',
            })}{' '}
            <Text
              style={styles.textWeight}
              onPress={() => handleStripeAgreement()}>
              {t('StripeConnectAccountForm.stripeConnectedAccountTermsLink')}
            </Text>
          </Text>
        </>
      ) : (
        <View>
          <View style={styles.greenBox}>
            <View style={styles.tick}>
              <Image source={checkMark} />
            </View>
            <Text
              // eslint-disable-next-line react-native/no-inline-styles
              style={[styles.infoText, {alignSelf: 'center'}]}>
              {t('StripeConnectAccountStatusBox.verificationSuccessTitle')}
            </Text>
            <Button
              loading={isLoadingStripeLink}
              disabled={isLoadingStripeLink}
              text={t('StripeEditAccountText')}
              onPress={() =>
                handleGetStripeConnectAccountLink('custom_account_verification')
              }
            />
          </View>
          <Text style={styles.agreeText}>
            {t('StripeConnectAccountForm.stripeToSText', {
              stripeConnectedAccountTermsLink: 'Stripe Connected Account',
            })}{' '}
            <Text
              onPress={() => handleStripeAgreement()}
              style={styles.textWeight}>
              {t('StripeConnectAccountForm.stripeConnectedAccountTermsLink')}
            </Text>
          </Text>
        </View>
      )}

      {isWebViewVisible.show && (
        <StripeWebViewDetailForm
          webViewUrl={isWebViewVisible.url}
          isVisible={isWebViewVisible.show}
          setVisible={setWebViewVisible}
        />
      )}
    </View>
  );
};

export default ShowExistingStripeAccount;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.lightGrey,
    height: heightScale(45),
    borderRadius: fontScale(10),
    justifyContent: 'space-between',
    paddingHorizontal: widthScale(15),
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    color: colors.black,
    fontSize: fontScale(16),
    fontWeight: fontWeight.bold,
  },
  Box: {
    paddingVertical: heightScale(15),
    paddingHorizontal: widthScale(10),
    width: '100%',
    backgroundColor: colors.lightGrey,
    borderWidth: 1,
    borderColor: colors.marketplaceColor,
    marginTop: heightScale(15),
    borderRadius: widthScale(10),
  },
  infoText: {
    fontSize: widthScale(14),
    fontWeight: fontWeight.medium,
    color: colors.black,
    textAlign: 'justify',
    marginBottom: heightScale(10),
  },
  agreeText: {
    fontWeight: fontWeight.medium,
    color: colors.grey,
    textAlign: 'center',
    marginTop: heightScale(15),
  },
  topMargin: {
    marginTop: heightScale(20),
    paddingHorizontal: widthScale(20),
  },
  greenBox: {
    paddingVertical: heightScale(15),
    paddingHorizontal: widthScale(10),
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: 'green',
    marginTop: heightScale(15),
    borderRadius: widthScale(10),
  },
  tick: {
    height: heightScale(50),
    width: heightScale(50),
    backgroundColor: 'lightgreen',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: heightScale(15),
    borderRadius: fontScale(35),
  },
  textWeight: {
    color: colors.black,
  },
});
