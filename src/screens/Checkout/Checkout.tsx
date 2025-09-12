import {StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {
  clearCheckoutSlice,
  listingSelector,
  orderDataSelector,
  speculateTransactionInProgressSelector,
  transactionSelector,
} from './Checkout.slice';
import {
  INQUIRY_PROCESS_NAME,
  resolveLatestProcessName,
} from '../../transactions';
import {ScreenHeader} from '../../components';
import {useTranslation} from 'react-i18next';
import CheckoutWithInquiryProcess from './components/CheckoutWithInquiryProcess';
import {userDisplayNameAsString} from '../../util/data';
import TransactionListing from '../Transaction/component/TransactionListing';
import CheckoutPageWithPayment from './components/CheckoutPageWithPayment';
import {useConfiguration} from '../../context';
import {loadInitialDataForStripePayments} from './Checkout.helper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {widthScale} from '../../util';
import {colors} from '../../theme';

const getProcessName = pageData => {
  const {transaction, listing} = pageData || {};
  const processName = transaction?.id
    ? transaction?.attributes?.processName
    : listing?.id
    ? listing?.attributes?.publicData?.transactionProcessAlias?.split('/')[0]
    : null;
  return resolveLatestProcessName(processName);
};

export const Checkout = (props: any) => {
  const {t} = useTranslation();
  const config = useConfiguration();
  const marketplaceCurrency = config?.currency;
  const dispatch = useAppDispatch();
  const listing = useTypedSelector(listingSelector);
  const orderData = useTypedSelector(orderDataSelector);
  const transaction = useTypedSelector(transactionSelector);
  const speculateTransactionInProgress = useTypedSelector(
    speculateTransactionInProgressSelector,
  );
  const [pageData, setPageData] = useState({});

  const processName = getProcessName(pageData);
  const isInquiryProcess = processName === INQUIRY_PROCESS_NAME;

  useEffect(() => {
    const initialData = {orderData, listing, transaction};
    setPageData(initialData);
    if (getProcessName(initialData) !== INQUIRY_PROCESS_NAME) {
      loadInitialDataForStripePayments({
        pageData: initialData || {},
        dispatch,
        config,
      });
    }
  }, []);

  const listingTitle = listing?.attributes?.title;
  const authorDisplayName = userDisplayNameAsString(listing?.author, '');
  const title = processName
    ? t(`CheckoutPage.${processName}.title`, {
        listingTitle,
        authorDisplayName,
      })
    : '';

  return (
    <React.Fragment>
      <ScreenHeader
        title={t('Checkout.title')}
        onLeftIconPress={() => {
          props.navigation.pop();
          dispatch(clearCheckoutSlice());
        }}
      />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.container}
        extraKeyboardSpace={60}>
        <TransactionListing
          listing={listing}
          marketplaceCurrency={marketplaceCurrency}
        />
        {processName && isInquiryProcess ? (
          <CheckoutWithInquiryProcess
            processName={processName}
            pageData={pageData}
            listingTitle={listingTitle}
            title={title}
          />
        ) : processName &&
          !isInquiryProcess &&
          !speculateTransactionInProgress ? (
          <CheckoutPageWithPayment
            pageData={pageData}
            processName={processName}
          />
        ) : null}
      </KeyboardAwareScrollView>
    </React.Fragment>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: widthScale(20),
    backgroundColor: colors.white,
  },
});
