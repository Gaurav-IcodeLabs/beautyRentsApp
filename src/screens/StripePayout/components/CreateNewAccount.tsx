// import { useStripe } from '@stripe/stripe-react-native'
import React, { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  RenderDropdownField,
  RenderTextInputField,
} from '../../../components';
import {
  defaultMCC,
  stripeAccountTypeOptions,
  supportedCountriesWithNames,
} from '../../../config/configStripe';
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup';
import { createStripeAccount } from '../../../slices/StripeConnectAccount.slice';
import {
  currentUserDisplayNameSelector,
  currentUserIdSelector,
} from '../../../slices/user.slice';
import { colors, fontWeight } from '../../../theme';
import { heightScale, widthScale } from '../../../util';
import {
  mapInputsToStripeAccountKeys,
  requiredInputs,
} from '../../../util/payoutUtils';
import RadioSingleSelect from './RadioSingleSelect';
import StripeTokenService from './StripeTokenService';
import { useTranslation } from 'react-i18next';
import { StripeConnect } from '../../../appTypes';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

type createNewAccountProps = {};
type ResponseAccountTokenType = {
  accountToken: string;
};
const CreateNewAccount: FC<createNewAccountProps> = () => {
  const currentUserID = useTypedSelector(currentUserIdSelector);
  const { control, getValues, watch } = useForm({
    defaultValues: {
      businessProfileMCC: defaultMCC,
      country: {},
      businessProfileURL: `${process.env.EXPO_PUBLIC_SDK_BASE_URL}/u/${currentUserID}`,
      accountType: '',
    },
  });
  const { t } = useTranslation();
  // const { createToken } = useStripe()
  const dispatch = useAppDispatch();
  const [isLoading, setLoading] = useState(false);
  const [bankAccountToken, setBankAccountToken] = useState({});
  const { country = {}, accountType } = watch();
  const currentUserName = useTypedSelector(currentUserDisplayNameSelector);
  const requiredInputsX =
    country?.code && requiredInputs(country && country?.code);
  const createBankAccountToken = async () => {
    // try {
    //   const { accountType, country } = getValues();
    //   const valuesToSend = mapInputsToStripeAccountKeys(
    //     country.code,
    //     getValues(),
    //   );
    //   const {
    //     account_number,
    //     routing_number,
    //     account_holder_name,
    //     branch_name,
    //     bank_name,
    //   } = valuesToSend;
    //   setLoading(true);
    //   const token = await createToken({
    //     type: 'BankAccount',
    //     accountHolderName: currentUserName,
    //     accountHolderType: accountType,
    //     ...(account_number && { accountNumber: account_number }),
    //     ...(routing_number && { routingNumber: routing_number }),
    //     country: country?.code,
    //     currency: country?.currency,
    //   });
    //   console.log(token, 'token');
    //   if (token?.token?.bankAccount) {
    //     setBankAccountToken(token?.token);
    //     // setLoading(false)
    //   } else if (token.error?.code === 'Failed' && token.error?.message) {
    //     setLoading(false);
    //     Alert.alert(
    //       'Please Check with your details entered',
    //       token.error?.message,
    //     );
    //   } else {
    //     setLoading(false);
    //     Alert.alert('Something Went Wrong', token.error?.message);
    //   }
    // } catch (error) {
    //   setLoading(false);
    //   Alert.alert('Error', error?.message);
    //   console.log(error, 'erro');
    // } finally {
    //   // setLoading(false)
    // }
  };
  const handleStripeAgreement = async () => {
    await Linking.openURL(
      StripeConnect.STRIPE_CONNECTED_ACCOUNT_AGREEMENT_LINK,
    );
  };
  const onSuccessGettingAccountTokenCreateStripeAccount = async (
    data: ResponseAccountTokenType,
  ) => {
    const { accountType, businessProfileMCC, businessProfileURL, country } =
      getValues();
    if (data?.accountToken) {
      const dataX = {
        accountToken: data?.accountToken,
        bankAccountToken: bankAccountToken?.id,
        country: country?.code,
        accountType: accountType,
        businessProfileMCC: businessProfileMCC,
        businessProfileURL: businessProfileURL,
      };
      try {
        await dispatch(createStripeAccount(dataX));
        setLoading(false);
      } catch (error) {
        Alert.alert(
          t('ProfileSettingsForm.updateProfileFailed'),
          error.message,
        );
      }
    } else {
      Alert.alert(t('ProfileSettingsForm.updateProfileFailed'));
    }
  };
  return (
    <View>
      <KeyboardAwareScrollView
        bounces={false}
        automaticallyAdjustKeyboardInsets={true}
        contentContainerStyle={styles.contentScroll}
      >
        <View>
          {/* ---------------------------------- */}
          {/* //Radio Account Type Select */}
          {/* ---------------------------------- */}
          <Text style={styles.verticalMa}>Account Type</Text>
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

        {/* ---------------------------------- */}
        {/* //Rendering The Inputs Based on Country and Account Type Selection */}
        {/* ---------------------------------- */}

        {country?.code && accountType ? (
          <View style={styles.margin}>
            {requiredInputsX?.map((input: string, index: number) => (
              <View key={index}>
                <RenderTextInputField
                  labelKey=""
                  name={input}
                  control={control}
                  placeholderKey={input}
                  editable={!isLoading}
                />
              </View>
            ))}
          </View>
        ) : null}
        <Button
          text={t('StripeProceedButton')}
          onPress={createBankAccountToken}
          style={styles.button}
          loading={isLoading}
          disabled={isLoading || !accountType || !country?.code}
        />
        <Text style={styles.agreeText}>
          {t('StripeConnectAccountForm.stripeToSText', {
            stripeConnectedAccountTermsLink: 'Stripe Connected Account',
          })}{' '}
          <Text
            onPress={() => handleStripeAgreement()}
            style={styles.textWeight}
          >
            {t('StripeConnectAccountForm.stripeConnectedAccountTermsLink')}
          </Text>
        </Text>

        {accountType && bankAccountToken?.created ? (
          /////////////////////////////////////////////////
          // Please Change the PKTESTKEY In STRIPE TOKEN //
          // SERVICE ELEMENT IF YOU ARE USING TEST KEY or//
          // Replace it with ENV.
          /////////////////////////////////////////////////

          <StripeTokenService
            isVisible={!!bankAccountToken?.created}
            stripeData={{ accountType: getValues()?.accountType }}
            onSuccess={(data: ResponseAccountTokenType) => {
              onSuccessGettingAccountTokenCreateStripeAccount(data);
            }}
            onCloseModal={() => {}}
          />
        ) : null}
      </KeyboardAwareScrollView>
    </View>
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
