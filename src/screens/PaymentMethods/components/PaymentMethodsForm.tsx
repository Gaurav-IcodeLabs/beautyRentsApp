import { zodResolver } from '@hookform/resolvers/zod';
// import {
//   CardField,
//   StripeProvider,
//   createPaymentMethod,
// } from '@stripe/stripe-react-native'
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import {
  Button,
  RenderDropdownField,
  RenderTextInputField,
} from '../../../components';
import { useConfiguration } from '../../../context';
import getCountryCodes from '../../../locales/countryCodes';
import { useAppDispatch } from '../../../sharetribeSetup';
import {
  addPaymentMethodInProgressSelector,
  createStripeCustomerInProgressSelector,
  savePaymentMethod,
} from '../../../slices/paymentMethods.slice';
import {
  currentUserEmailSelector,
  currentUserProfileSelector,
  stripeCustomerSelector,
} from '../../../slices/user.slice';
import { colors, fontWeight } from '../../../theme';
import {
  commonShadow,
  fontScale,
  heightScale,
  widthScale,
} from '../../../util';
import { BillingDetails, getSchema } from '../helper';

const PaymentMethodsForm = () => {
  const { stripe = {} } = useConfiguration();
  const config = useConfiguration();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentUserEmail = useSelector(currentUserEmailSelector);
  const currentUserProfile = useSelector(currentUserProfileSelector);
  const stripeCustomer = useSelector(stripeCustomerSelector);
  const addPaymentMethodInProgress = useSelector(
    addPaymentMethodInProgressSelector,
  );
  const createStripeCustomerInProgress = useSelector(
    createStripeCustomerInProgressSelector,
  );
  const [paymentForm, setPaymentForm] = useState(false);

  const isLoading =
    addPaymentMethodInProgress || createStripeCustomerInProgress;

  const onSubmit = async (billingD: BillingDetails) => {
    const { name, country, addressLine1, addressLine2, postal, city } =
      billingD;
    // try {
    //   let billingEmail = currentUserEmail
    //   const { paymentMethod, error } = await createPaymentMethod({
    //     paymentMethodType: 'Card',
    //     paymentMethodData: {
    //       billingDetails: {
    //         email: billingEmail,
    //         name: name,
    //         address: {
    //           country,
    //           line1: addressLine1,
    //           line2: addressLine2,
    //           postalCode: `${postal}`,
    //         },
    //       },
    //     },
    //   })
    //   if (paymentMethod?.id) {
    //     savePaymentMethod(stripeCustomer, paymentMethod?.id)
    //   }
    //   if (error) {
    //     Alert.alert('Error', error?.localizedMessage)
    //   }
    // } catch (error) {
    //   console.log('error', error)
    // }
  };

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: currentUserProfile?.firstName,
      addressLine2: '',
      addressLine1: '',
      city: '',
      country: '',
      postal: '',
    },
    resolver: zodResolver(getSchema(t)),
  });

  const countryCodes = getCountryCodes('en');

  return (
    // <StripeProvider publishableKey={stripe.publishableKey}>
    <ScrollView contentContainerStyle={styles.flex}>
      <View style={styles.masterView}>
        <View style={styles.cardView}>
          <Text style={styles.headerTextStyle}>
            {t('PaymentMethodsForm.paymentCardDetails')}
          </Text>
          {/* <CardField
              onCardChange={cardDetails => setPaymentForm(cardDetails.complete)}
              postalCodeEnabled={false}
              style={styles.cardStyle}
              cardStyle={styles.cardContainer}
            /> */}
          <Text style={styles.cardText}>
            {t('PaymentMethodsForm.infoText', {
              marketplaceName: config?.marketplaceName,
            })}
          </Text>
        </View>
        {paymentForm && (
          <View style={styles.billingDetailsForm}>
            <RenderTextInputField
              control={control}
              name={'name'}
              labelKey={'PaymentMethodsForm.billingDetailsNameLabel'}
              placeholderKey={
                'PaymentMethodsForm.billingDetailsNamePlaceholder'
              }
            />
            <RenderTextInputField
              control={control}
              name={'addressLine1'}
              labelKey={'StripePaymentAddress.addressLine1Label'}
              placeholderKey={'StripePaymentAddress.addressLine1Placeholder'}
            />
            <RenderTextInputField
              control={control}
              name={'addressLine2'}
              labelKey={'StripePaymentAddress.addressLine2Label'}
              placeholderKey={'StripePaymentAddress.addressLine2Placeholder'}
            />
            <RenderTextInputField
              type={'number-pad'}
              control={control}
              name={'postal'}
              labelKey={'StripePaymentAddress.postalCodeLabel'}
              placeholderKey={'StripePaymentAddress.postalCodePlaceholder'}
              onChangeText={(postal, onChange) => onChange(Number(postal))}
            />
            <RenderTextInputField
              control={control}
              name={'city'}
              labelKey={'StripePaymentAddress.cityLabel'}
              placeholderKey={'StripePaymentAddress.cityPlaceholder'}
            />
            <RenderTextInputField
              control={control}
              name={'state'}
              labelKey={'StripePaymentAddress.stateLabel'}
              placeholderKey={'StripePaymentAddress.statePlaceholder'}
            />
            <RenderDropdownField
              control={control}
              name={'country'}
              labelField="name"
              valueField="code"
              itemRenderKey="name"
              maxHeight={150}
              containerWidth={false}
              data={countryCodes}
              inverted={false}
              placeholderKey={'StripePaymentAddress.countryPlaceholder'}
              lableKey={'StripePaymentAddress.countryLabel'}
              onDropDownValueChange={(value, cb) => {
                cb(value.code);
              }}
            />

            <Button
              text={t('PaymentMethodsForm.submitPaymentInfo')}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid}
              style={styles.button}
              loading={isLoading}
            />
          </View>
        )}
      </View>
    </ScrollView>
    // </StripeProvider>
  );
};
export default PaymentMethodsForm;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  masterView: {
    flex: 1,
    marginHorizontal: widthScale(24),
  },
  button: {
    marginTop: widthScale(50),
    marginBottom: heightScale(100),
  },
  cardView: { marginTop: widthScale(32) },
  headerTextStyle: {
    fontSize: fontScale(13),
    lineHeight: fontScale(18),
    letterSpacing: fontScale(0.02),
    marginBottom: widthScale(10),
  },
  cardStyle: {
    width: 'auto',
    height: widthScale(52),
    borderRadius: widthScale(12),
    ...commonShadow,
  },
  cardContainer: {
    backgroundColor: colors.white,
    // textColor: colors.grey,
    fontSize: fontScale(14),
    lineHeight: widthScale(21),
    // placeholderColor: colors.grey,
  },
  billingDetailsForm: {
    marginTop: widthScale(20),
    flex: 1,
  },
  cardText: {
    marginBottom: widthScale(10),
    fontWeight: fontWeight.medium,
    fontSize: fontScale(14),
    color: colors.grey,
    marginTop: widthScale(7),
  },
});
