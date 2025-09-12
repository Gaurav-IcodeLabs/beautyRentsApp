import React, {FC, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {ScreenHeader} from '../../components';
import SavedCardDetails from '../../components/SavedCardDetails/SavedCardDetails';
// import {useNavigation} from '@react-navigation/native';
import {
  currentUserProgressSelector,
  fetchCurrentUser,
  stripeCustomerSelector,
} from '../../slices/user.slice';
import {colors} from '../../theme';
import {widthScale} from '../../util';
import {ensurePaymentMethodCard, ensureStripeCustomer} from '../../util/data';
import PaymentMethodsForm from './components/PaymentMethodsForm';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {AppDispatch} from '../../sharetribeSetup';

interface PaymentMethodProps {}

export const PaymentMethods: FC<PaymentMethodProps> = () => {
  // const navigation = useNavigation();
  const stripeCustomer = useSelector(stripeCustomerSelector);
  const currentUserProgress = useSelector(currentUserProgressSelector);
  const {t} = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(
      fetchCurrentUser({include: ['stripeCustomer.defaultPaymentMethod']}),
    );
  }, [dispatch]);

  const stripeCustomerDefaultPaymentMethodId = ensurePaymentMethodCard(
    stripeCustomer?.defaultPaymentMethod,
  ).id;
  const stripeCustomerDefaultPaymentMethodCard = ensurePaymentMethodCard(
    stripeCustomer?.defaultPaymentMethod,
  ).attributes.card;
  const hasDefaultPaymentMethod =
    ensureStripeCustomer(stripeCustomer).attributes.stripeCustomerId &&
    stripeCustomerDefaultPaymentMethodId;
  const card = hasDefaultPaymentMethod
    ? stripeCustomerDefaultPaymentMethodCard
    : null;

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('PaymentMethodsPage.heading')} />
      {currentUserProgress ? (
        <View style={styles.screenLoaderStyle}>
          <ActivityIndicator size={'large'} color={colors.grey} />
        </View>
      ) : (
        <>
          {hasDefaultPaymentMethod ? (
            <View
              style={{
                paddingHorizontal: widthScale(20),
              }}>
              <SavedCardDetails card={card} />
            </View>
          ) : (
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              extraKeyboardSpace={50}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps={'handled'}>
              <View style={styles.cardContainer}>
                <PaymentMethodsForm />
              </View>
            </KeyboardAwareScrollView>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  cardContainer: {
    flex: 1,
  },
  contentContainer: {flexGrow: 1, marginBottom: widthScale(40)},
  screenLoaderStyle: {justifyContent: 'center', flex: 1},
});
