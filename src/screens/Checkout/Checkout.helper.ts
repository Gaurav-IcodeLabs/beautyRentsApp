import { getProcess } from '../../transactions'
import { minutesBetween } from '../../util'
import { formatMoney } from '../../util/currency'
import { ensureTransaction } from '../../util/data'
import {
  confirmPayment,
  initiateOrder,
  sendMessage,
  speculateTransaction,
  stripeCustomer,
} from './Checkout.slice'

/**
 * Extract relevant transaction type data from listing type
 * Note: this is saved to protectedData of the transaction entity
 *       therefore, we don't need the process name (nor alias)
 *
 * @param {Object} listingType
 * @param {String} unitTypeInPublicData
 * @param {Object} config
 * @returns object containing unitType etc. - or an empty object.
 */
export const getTransactionTypeData = (
  listingType,
  unitTypeInPublicData,
  config,
) => {
  const listingTypeConfig = config.listing.listingTypes.find(
    lt => lt.listingType === listingType,
  )
  const { process, alias, unitType, ...rest } =
    listingTypeConfig?.transactionType || {}
  // Note: we want to rely on unitType written in public data of the listing entity.
  //       The listingType configuration might have changed on the fly.
  return unitTypeInPublicData ? { unitType: unitTypeInPublicData, ...rest } : {}
}

/**
 * Check if the transaction has passed PENDING_PAYMENT state (assumes that process has that state)
 * @param {Object} tx
 * @param {Object} process
 * @returns true if the transaction has passed that state
 */
export const hasTransactionPassedPendingPayment = (tx, process) => {
  return process.hasPassedState(process.states.PENDING_PAYMENT, tx)
}

const fetchSpeculatedTransactionIfNeeded = (
  orderParams,
  pageData,
  dispatch,
) => {
  const tx = pageData ? pageData.transaction : null
  const pageDataListing = pageData.listing
  const processName =
    tx?.attributes?.processName ||
    pageDataListing?.attributes?.publicData?.transactionProcessAlias?.split(
      '/',
    )[0]
  const process = processName ? getProcess(processName) : null

  // If transaction has passed payment-pending state, speculated tx is not needed.
  const shouldFetchSpeculatedTransaction =
    !!pageData?.listing?.id &&
    !!pageData.orderData &&
    !!process &&
    !hasTransactionPassedPendingPayment(tx, process)

  if (shouldFetchSpeculatedTransaction) {
    const processAlias =
      pageData.listing.attributes.publicData?.transactionProcessAlias
    const transactionId = tx ? tx.id : null
    const isInquiryInPaymentProcess =
      tx?.attributes?.lastTransition === process.transitions.INQUIRE

    const requestTransition = isInquiryInPaymentProcess
      ? process.transitions.REQUEST_PAYMENT_AFTER_INQUIRY
      : process.transitions.REQUEST_PAYMENT
    const isPrivileged = process.isPrivileged(requestTransition)

    dispatch(
      speculateTransaction({
        orderParams,
        processAlias,
        transactionId,
        transitionName: requestTransition,
        isPrivilegedTransition: isPrivileged,
      }),
    )
  }
}

/**
 * This just makes it easier to transfrom bookingDates object if needed
 * (or manibulate bookingStart and bookingEnd)
 *
 * @param {Object} bookingDates
 * @returns object containing bookingDates or an empty object.
 */
export const bookingDatesMaybe = bookingDates => {
  return bookingDates ? { bookingDates } : {}
}

/**
 * Construct orderParams object using pageData from session storage, shipping details, and optional payment params.
 * Note: This is used for both speculate transition and real transition
 *       - Speculate transition is called, when the the component is mounted. It's used to test if the data can go through the API validation
 *       - Real transition is made, when the user submits the StripePaymentForm.
 *
 * @param {Object} pageData data that's saved to session storage.
 * @param {Object} shippingDetails shipping address if applicable.
 * @param {Object} optionalPaymentParams (E.g. paymentMethod or setupPaymentMethodForSaving)
 * @param {Object} config app-wide configs. This contains hosted configs too.
 * @returns orderParams.
 */
export const getOrderParams = (
  pageData,
  shippingDetails,
  optionalPaymentParams,
  config,
) => {
  const quantity = pageData.orderData?.quantity
  const quantityMaybe = quantity ? { quantity } : {}
  const deliveryMethod = pageData.orderData?.deliveryMethod
  const deliveryMethodMaybe = deliveryMethod ? { deliveryMethod } : {}

  const { listingType, unitType } =
    pageData?.listing?.attributes?.publicData || {}
  const protectedDataMaybe = {
    protectedData: {
      ...getTransactionTypeData(listingType, unitType, config),
      ...deliveryMethodMaybe,
      ...shippingDetails,
    },
  }

  // These are the order parameters for the first payment-related transition
  // which is either initiate-transition or initiate-transition-after-enquiry
  const orderParams = {
    listingId: pageData?.listing?.id,
    ...deliveryMethodMaybe,
    ...quantityMaybe,
    ...bookingDatesMaybe(pageData.orderData?.bookingDates),
    ...protectedDataMaybe,
    ...optionalPaymentParams,
  }
  return orderParams
}

export const loadInitialDataForStripePayments = ({
  pageData,
  dispatch,
  config,
}) => {
  // Fetch currentUser with stripeCustomer entity
  // Note: since there's need for data loading in "componentWillMount" function,
  //       this is added here instead of loadData static function.
  //TODO HIGH PRIORTY after stripe code merge
  dispatch(stripeCustomer())
  // Fetch speculated transaction for showing price in order breakdown
  // NOTE: if unit type is line-item/item, quantity needs to be added.
  // The way to pass it to checkout page is through pageData.orderData
  const shippingDetails = {}
  const optionalPaymentParams = {}
  const orderParams = getOrderParams(
    pageData,
    shippingDetails,
    optionalPaymentParams,
    config,
  )

  fetchSpeculatedTransactionIfNeeded(orderParams, pageData, dispatch)
}

/**
 * Create call sequence for checkout with Stripe PaymentIntents.
 *
 * @param {Object} orderParams contains params for the initial order itself
 * @param {Object} extraPaymentParams contains extra params needed by one of the following calls in the checkout sequence
 * @returns Promise that goes through each step in the checkout sequence.
 */

const USE_SAVED_CARD = 'USE_SAVED_CARD'
const STRIPE_PI_USER_ACTIONS_DONE_STATUSES = [
  'processing',
  'requires_capture',
  'succeeded',
]
const PAY_AND_SAVE_FOR_LATER_USE = 'PAY_AND_SAVE_FOR_LATER_USE'

export const processCheckoutWithPayment = (
  orderParams,
  extraPaymentParams,
  dispatch,
) => {
  const {
    pageData,
    speculatedTransaction,
    stripe,
    card,
    message,
    paymentIntent,
    stripePaymentMethodId,
    selectedPaymentMethod,
    isPaymentFlowUseSavedCard,
    isPaymentFlowPayAndSaveCard,
    process,
  } = extraPaymentParams

  const storedTx = ensureTransaction(pageData.transaction)
  const ensuredStripeCustomer = {} //ensureStripeCustomer(stripeCustomer);

  const processAlias =
    pageData?.listing?.attributes?.publicData?.transactionProcessAlias

  let createdPaymentIntent = null
  ////////////////////////////////////////////////
  // Step 1: initiate order                     //
  // by requesting payment from Marketplace API //
  ////////////////////////////////////////////////
  const fnRequestPayment = fnParams => {
    // fnParams should be { listingId, deliveryMethod?, quantity?, bookingDates?, paymentMethod?.setupPaymentMethodForSaving?, protectedData }
    const hasPaymentIntents =
      storedTx?.attributes?.protectedData?.stripePaymentIntents

    const requestTransition =
      storedTx?.attributes?.lastTransition === process.transitions.INQUIRE
        ? process.transitions.REQUEST_PAYMENT_AFTER_INQUIRY
        : process.transitions.REQUEST_PAYMENT
    const isPrivileged = process.isPrivileged(requestTransition)
    // If paymentIntent exists, order has been initiated previously.

    return hasPaymentIntents
      ? Promise.resolve(storedTx)
      : dispatch(
          initiateOrder({
            orderParams: fnParams,
            processAlias,
            transactionId: storedTx.id,
            transitionName: requestTransition,
            isPrivilegedTransition: isPrivileged,
          }),
        ).then(res => {
          return res.payload
        })
  }

  //////////////////////////////////
  // Step 2: pay using Stripe SDK //
  //////////////////////////////////
  const fnConfirmCardPayment = fnParams => {
    // fnParams should be returned transaction entity
    const order = fnParams

    const hasPaymentIntents =
      order?.attributes?.protectedData?.stripePaymentIntents
    if (!hasPaymentIntents) {
      throw new Error(
        `Missing StripePaymentIntents key in transaction's protectedData. Check that your transaction process is configured to use payment intents.`,
      )
    }

    const { stripePaymentIntentClientSecret } = hasPaymentIntents
      ? order.attributes.protectedData.stripePaymentIntents.default
      : null

    const { stripe, card, billingDetails, paymentIntent } = extraPaymentParams
    const stripeElementMaybe = !isPaymentFlowUseSavedCard ? { card } : {}

    // Note: For basic USE_SAVED_CARD scenario, we have set it already on API side, when PaymentIntent was created.
    // However, the payment_method is save here for USE_SAVED_CARD flow if customer first attempted onetime payment
    const paymentParams = !isPaymentFlowUseSavedCard //check
      ? {
          payment_method: {
            billing_details: billingDetails,
            card: card,
          },
        }
      : { payment_method: stripePaymentMethodId }

    const params = {
      stripePaymentIntentClientSecret,
      orderId: order?.id,
      stripe,
      ...stripeElementMaybe,
      paymentParams,
    }
    const hasPaymentIntentUserActionsDone =
      paymentIntent &&
      STRIPE_PI_USER_ACTIONS_DONE_STATUSES.includes(paymentIntent.status)
    return Promise.resolve({ transactionId: order?.id, paymentIntent })
    // removed  onConfirmCardPayment(params);
  }

  ///////////////////////////////////////////////////
  // Step 3: complete order                        //
  // by confirming payment against Marketplace API //
  ///////////////////////////////////////////////////
  const fnConfirmPayment = fnParams => {
    createdPaymentIntent = fnParams?.paymentIntent
    const transactionId = fnParams.transactionId
    const transitionName = process.transitions.CONFIRM_PAYMENT
    const isTransitionedAlready =
      storedTx?.attributes?.lastTransition === transitionName

    return isTransitionedAlready
      ? Promise.resolve(storedTx)
      : dispatch(confirmPayment(fnParams)).then(res => {
          return res.payload
        })
  }

  //////////////////////////////////
  // Step 4: send initial message //
  //////////////////////////////////
  const fnSendMessage = fnParams => {
    const orderId = fnParams?.id
    return dispatch(sendMessage({ id: orderId, message })).then(
      res => res.payload,
    )
  }

  //////////////////////////////////////////////////////////
  // Step 5: optionally save card as defaultPaymentMethod //
  //////////////////////////////////////////////////////////
  const fnSavePaymentMethod = fnParams => {
    const pi = createdPaymentIntent || paymentIntent

    return Promise.resolve({ ...fnParams, paymentMethodSaved: true })
  }

  // Here we create promise calls in sequence
  // This is pretty much the same as:
  // fnRequestPayment({...initialParams})
  //   .then(result => fnConfirmCardPayment({...result}))
  //   .then(result => fnConfirmPayment({...result}))
  const applyAsync = (acc, val) => acc.then(val)
  const composeAsync =
    (...funcs) =>
    x =>
      funcs.reduce(applyAsync, Promise.resolve(x))
  const handlePaymentIntentCreation = composeAsync(
    fnRequestPayment,
    fnConfirmCardPayment,
    fnConfirmPayment,
    fnSendMessage,
    fnSavePaymentMethod,
  )

  return handlePaymentIntentCreation(orderParams)
}

/**
 * Get formatted total price (payinTotal)
 *
 * @param {Object} transaction
 * @param {Object} intl
 * @returns formatted money as a string.
 */
export const getFormattedTotalPrice = transaction => {
  const totalPrice = transaction.attributes.payinTotal
  return formatMoney(totalPrice)
}

/**
 * Check if payment is expired (PAYMENT_EXPIRED state) or if payment has passed 15 minute treshold from PENDING_PAYMENT
 *
 * @param {Object} existingTransaction
 * @param {Object} process
 * @returns true if payment has expired.
 */
export const hasPaymentExpired = (
  existingTransaction,
  process,
  isClockInSync,
) => {
  const state = process.getState(existingTransaction)
  return state === process.states.PAYMENT_EXPIRED
    ? true
    : state === process.states.PENDING_PAYMENT && isClockInSync
      ? minutesBetween(
          existingTransaction.attributes.lastTransitionedAt,
          new Date(),
        ) >= 15
      : false
}

/**
 * Check if the default payment method exists for the currentUser
 * @param {Boolean} stripeCustomerFetched
 * @param {Object} currentUser
 * @returns true if default payment method has been set
 */
export const hasDefaultPaymentMethod = (stripeCustomerFetched, currentUser) =>
  !!(
    stripeCustomerFetched &&
    currentUser?.stripeCustomer?.attributes?.stripeCustomerId &&
    currentUser?.stripeCustomer?.defaultPaymentMethod?.id
  )
