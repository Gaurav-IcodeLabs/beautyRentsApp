import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { ScreenHeader } from '../../components';
import { heightScale } from '../../util';
import CreateNewAccount from './components/CreateNewAccount';
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup';
import {
  currentUserIdSelector,
  currentUserStripeAccountSelector,
} from '../../slices/user.slice';
import {
  fetchStripeAccount,
  fetchStripeAccountInProgress,
  stripeAccountSelector,
} from '../../slices/StripeConnectAccount.slice';
import ShowExistingStripeAccount from './components/ShowExistingStripeAccount';
// import { StripeProvider } from '@stripe/stripe-react-native'
import { useConfiguration } from '../../context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

export const PayoutSetup = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { stripe = {} } = useConfiguration();
  const currentUserStripe = useTypedSelector(currentUserStripeAccountSelector);
  const currentUserID = useTypedSelector(currentUserIdSelector);
  const stripeAccountData = useTypedSelector(stripeAccountSelector);
  const isFetchStripeLoading = useSelector(fetchStripeAccountInProgress);

  useEffect(() => {
    if (currentUserID && currentUserStripe?.id) {
      dispatch(fetchStripeAccount());
    }
  }, []);

  return (
    // <StripeProvider publishableKey={stripe?.publishableKey}>
    <View style={[styles.mainContainer]}>
      <ScreenHeader title="Payout Details" />

      <View style={styles.allPading}>
        {isFetchStripeLoading ? (
          <View style={styles.loaderView}>
            <ActivityIndicator size={'small'} color={'black'} />
            <Text>{t('StripeBootLoading')}</Text>
          </View>
        ) : stripeAccountData ? (
          <ShowExistingStripeAccount />
        ) : (
          <CreateNewAccount />
        )}
      </View>
    </View>
    // </StripeProvider>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  allPading: {},
  loaderView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: heightScale(50),
  },
});
