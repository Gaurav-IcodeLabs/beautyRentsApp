import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import DetailsSideCard from './DetailsSideCard';
import {ensurePaymentMethodCard, ensureTransaction} from '../../../util/data';
import {useAppDispatch, useTypedSelector} from '../../../sharetribeSetup';
import {
  clearCheckoutSlice,
  initiateOrderErrorSelector,
  isClockInSyncSelector,
  speculateTransactionErrorSelector,
  speculatedTransactionSelector,
  stripeCustomerFetchedSelector,
} from '../Checkout.slice';
import {
  DATE_TYPE_DATE,
  DATE_TYPE_DATETIME,
  LINE_ITEM_HOUR,
  heightScale,
  isTransactionInitiateListingNotFoundError,
} from '../../../util';
import {useConfiguration} from '../../../context';
import OrderBreakdown from '../../../components/OrderBreakdown/OrderBreakdown';
import {
  getOrderParams,
  hasDefaultPaymentMethod,
  hasPaymentExpired,
  processCheckoutWithPayment,
} from '../Checkout.helper';
import {getProcess} from '../../../transactions';
import {
  currentUserIdSelector,
  currentUserSelector,
} from '../../../slices/user.slice';
import {CheckoutConstants} from '../../../appTypes/enums/checkout';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../../../components';
import {loadListing} from '../../Listing/Listing.slice';
import PaymentComponent from './PaymentComponent';
import {colors} from '../../../theme';

const CheckoutPageWithPayment = (props: any) => {
  const config = useConfiguration() as any;
  const navigation = useNavigation();
  const [submitting, setSubmitting] = useState(false);
  const stripePublishableKey = config.stripe.publishableKey;
  const dispatch = useAppDispatch();
  const {processName, pageData} = props;
  const {listing, transaction, orderData} = pageData;
  const speculatedTransactionMaybe = useTypedSelector(
    speculatedTransactionSelector,
  );
  const isClockInSync = useTypedSelector(isClockInSyncSelector);
  const currentUser = useTypedSelector(currentUserSelector);
  const currentUserId = useTypedSelector(currentUserIdSelector);
  const speculateTransactionError = useTypedSelector(
    speculateTransactionErrorSelector,
  );
  const initiateOrderError = useTypedSelector(initiateOrderErrorSelector);
  const stripeCustomerFetched = useTypedSelector(stripeCustomerFetchedSelector);
  const existingTransaction = ensureTransaction(transaction);
  const speculatedTransaction = ensureTransaction(
    speculatedTransactionMaybe,
    {},
    null,
  );
  const defaultPaymentMethod = hasDefaultPaymentMethod(
    stripeCustomerFetched,
    currentUser,
  )
    ? currentUser?.stripeCustomer?.defaultPaymentMethod
    : null;

  const ensuredDefaultPaymentMethod =
    ensurePaymentMethodCard(defaultPaymentMethod);
  // Since the listing data is already given from the ListingPage
  // and stored to handle refreshes, it might not have the possible
  // deleted or closed information in it. If the transaction
  // initiate or the speculative initiate fail due to the listing
  // being deleted or closed, we should dig the information from the
  // errors and not the listing data.
  const listingNotFound =
    isTransactionInitiateListingNotFoundError(speculateTransactionError) ||
    isTransactionInitiateListingNotFoundError(initiateOrderError);

  // If existing transaction has line-items, it has gone through one of the request-payment transitions.
  // Otherwise, we try to rely on speculatedTransaction for order breakdown data.
  const tx =
    existingTransaction?.attributes?.lineItems?.length > 0
      ? existingTransaction
      : speculatedTransaction;
  const timeZone = listing?.attributes?.availabilityPlan?.timezone;
  // const transactionProcessAlias =
  //   listing?.attributes?.publicData?.transactionProcessAlias;
  const unitType = listing?.attributes?.publicData?.unitType;
  const lineItemUnitType = `line-item/${unitType}`;
  const dateType =
    lineItemUnitType === LINE_ITEM_HOUR ? DATE_TYPE_DATETIME : DATE_TYPE_DATE;
  const txBookingMaybe = tx?.booking?.id
    ? {booking: tx.booking, dateType, timeZone}
    : {};

  // Show breakdown only when (speculated?) transaction is loaded
  // (i.e. it has an id and lineItems)
  const breakdown =
    tx.id && tx.attributes.lineItems?.length > 0 ? (
      <OrderBreakdown
        userRole="customer"
        transaction={tx}
        {...txBookingMaybe}
        currency={config.currency}
        marketplaceName={config.marketplaceName}
      />
    ) : null;

  // const totalPrice =
  //   tx?.attributes?.lineItems?.length > 0 ? getFormattedTotalPrice(tx) : null;
  const process = processName ? getProcess(processName) : null;
  // const transitions = process.transitions;
  const isPaymentExpired = hasPaymentExpired(
    existingTransaction,
    process,
    isClockInSync,
  );

  // Allow showing page when currentUser is still being downloaded,
  // but show payment form only when user info is loaded.
  const showPaymentForm = !!(
    currentUserId &&
    !listingNotFound &&
    !initiateOrderError &&
    !speculateTransactionError &&
    //  !retrievePaymentIntentError &&  for stripe
    !isPaymentExpired
  );

  // const txTransitions = existingTransaction?.attributes?.transitions || [];
  // const hasInquireTransition = txTransitions.find(
  //   tr => tr.transition === transitions.INQUIRE,
  // );
  // const showInitialMessageInput = !hasInquireTransition;

  const hasDefaultPaymentMethodSaved = hasDefaultPaymentMethod(
    stripeCustomerFetched,
    currentUser,
  );

  const handleSubmit = () => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    const stripePaymentMethodId = hasDefaultPaymentMethodSaved
      ? currentUser?.stripeCustomer?.defaultPaymentMethod?.attributes
          ?.stripePaymentMethodId
      : null;

    const requestPaymentParams = {
      pageData: pageData,
      speculatedTransaction,
      stripe: stripePublishableKey,
      card: ensuredDefaultPaymentMethod?.attributes?.card,
      message: null,
      paymentIntent: null,
      stripePaymentMethodId,
      selectedPaymentMethod: 'defaultCard',
      process,
    };

    // const shippingDetails = getShippingDetailsMaybe(formValues);
    // Note: optionalPaymentParams contains Stripe paymentMethod,
    // but that can also be passed on Step 2
    // stripe.confirmCardPayment(stripe, { payment_method: stripePaymentMethodId })
    const optionalPaymentParams = {paymentMethod: stripePaymentMethodId};

    // These are the order parameters for the first payment-related transition
    // which is either initiate-transition or initiate-transition-after-enquiry
    const orderParams = getOrderParams(
      pageData,
      {},
      optionalPaymentParams,
      config,
    );

    // There are multiple XHR calls that needs to be made against Stripe API and Sharetribe Marketplace API on checkout with payments
    processCheckoutWithPayment(orderParams, requestPaymentParams, dispatch)
      .then((response: any) => {
        const {orderId, messageSuccess, paymentMethodSaved} = response;
        setSubmitting(false);
        //fetch listing to show updated available dates
        dispatch(loadListing({id: listing.id.uuid, config}));
        dispatch(clearCheckoutSlice());
        navigation.replace('Transaction', {
          transactionRole: CheckoutConstants.CUSTOMER,
          transactionId: orderId,
        });
      })
      .catch((err: any) => {
        console.log('err', err);
        setSubmitting(false);
      });
  };

  return (
    <View style={styles.container}>
      <DetailsSideCard
        isInquiryProcess={false}
        processName={processName}
        breakdown={breakdown}
      />

      <PaymentComponent />

      {showPaymentForm ? (
        <Button
          text="Confirm payment"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.button}
          disabled={!hasDefaultPaymentMethodSaved || submitting}
        />
      ) : null}
    </View>
  );
};

export default CheckoutPageWithPayment;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  button: {
    marginTop: heightScale(30),
    marginBottom: heightScale(50),
  },
});
