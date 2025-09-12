import React, {FC, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Alert, Linking, StyleSheet, Text, View} from 'react-native';
import {Button, RenderDropdownField} from '../../../components';
import {
  defaultMCC,
  stripeAccountTypeOptions,
  supportedCountriesWithNames,
} from '../../../config/configStripe';
import {useAppDispatch, useTypedSelector} from '../../../sharetribeSetup';
import {createStripeAccount} from '../../../slices/StripeConnectAccount.slice';
import {currentUserIdSelector} from '../../../slices/user.slice';
import {colors, fontWeight} from '../../../theme';
import {fontScale, heightScale, widthScale} from '../../../util';
import RadioSingleSelect from './RadioSingleSelect';
import StripeTokenService from './StripeTokenService';
import {useTranslation} from 'react-i18next';
import {StripeConnect} from '../../../appTypes';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useConfiguration} from '../../../context';

type createNewAccountProps = {};
type ResponseAccountTokenType = {
  accountToken: string;
};
const CreateNewAccount: FC<createNewAccountProps> = () => {
  const currentUserID = useTypedSelector(currentUserIdSelector);
  const {marketplaceRootURL} = useConfiguration() as any;
  const {control, getValues, watch} = useForm({
    defaultValues: {
      businessProfileMCC: defaultMCC,
      country: {},
      businessProfileURL: `${marketplaceRootURL}/u/${currentUserID}`,
      accountType: '',
    },
  });
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const [isLoading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const {country = {}, accountType} = watch();

  const handleStripeAgreement = async () => {
    await Linking.openURL(
      StripeConnect.STRIPE_CONNECTED_ACCOUNT_AGREEMENT_LINK,
    );
  };

  const onSuccessGettingAccountTokenCreateStripeAccount = async (
    data: ResponseAccountTokenType,
  ) => {
    const {
      accountType: _accountType,
      businessProfileMCC,
      businessProfileURL,
      country: _country,
    } = getValues();
    if (data?.accountToken) {
      const dataX = {
        accountToken: data?.accountToken,
        country: _country?.code,
        accountType: _accountType,
        businessProfileMCC: businessProfileMCC,
        businessProfileURL: businessProfileURL,
      };
      try {
        await dispatch(createStripeAccount(dataX));
        setLoading(false);
      } catch (error: any) {
        console.log('error', error);
        Alert.alert(
          t('ProfileSettingsForm.updateProfileFailed'),
          error.message,
        );
      }
    } else {
      Alert.alert(t('StripeConnectAccountForm.missingStripeKey'));
    }
  };

  return (
    <KeyboardAwareScrollView
      bounces={false}
      automaticallyAdjustKeyboardInsets={true}
      contentContainerStyle={styles.contentScroll}>
      <View>
        <Text style={styles.verticalMa}>
          {t('StripeConnectAccountForm.accountTypeTitle')}
        </Text>
        <RadioSingleSelect
          name={'accountType'}
          control={control}
          options={stripeAccountTypeOptions}
          disabled={isLoading}
        />
        <RenderDropdownField
          data={supportedCountriesWithNames}
          control={control}
          name={'country'}
          lableKey={t('StripeSelectCountry')}
          placeholderKey={t('StripeSelectCountry')}
          valueField="name"
          labelField="name"
          itemRenderKey="name"
          onDropDownValueChange={(value, cb) => {
            cb(value);
          }}
        />
      </View>
      <Button
        text={t('StripeProceedButton')}
        onPress={() => {
          setOpen(true);
          setLoading(true);
        }}
        style={styles.button}
        loading={isLoading}
        disabled={isLoading || !accountType || !country?.code}
      />
      <Text style={styles.agreeText}>
        {t('StripeConnectAccountForm.stripeToSText', {
          stripeConnectedAccountTermsLink: 'Stripe Connected Account',
        })}{' '}
        <Text onPress={() => handleStripeAgreement()} style={styles.textWeight}>
          {t('StripeConnectAccountForm.stripeConnectedAccountTermsLink')}
        </Text>
      </Text>

      {accountType && open ? (
        <StripeTokenService
          isVisible={open}
          stripeData={{accountType: getValues()?.accountType}}
          onSuccess={(data: ResponseAccountTokenType) => {
            onSuccessGettingAccountTokenCreateStripeAccount(data);
          }}
          onCloseModal={() => {}}
        />
      ) : null}
    </KeyboardAwareScrollView>
  );
};

export default CreateNewAccount;

const styles = StyleSheet.create({
  margin: {
    marginTop: heightScale(15),
  },
  button: {
    marginTop: heightScale(15),
  },
  verticalMa: {
    marginVertical: heightScale(7),
    marginTop: heightScale(15),
    fontSize: fontScale(16),
    color: colors.black,
    fontWeight: fontWeight.medium,
  },
  agreeText: {
    fontWeight: fontWeight.normal,
    color: colors.grey,
    textAlign: 'center',
    marginTop: heightScale(15),
  },
  textWeight: {
    color: colors.black,
  },
  contentScroll: {
    paddingHorizontal: widthScale(20),
    overflow: 'visible',
  },
});
