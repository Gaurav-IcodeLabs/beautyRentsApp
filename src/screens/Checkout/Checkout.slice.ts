import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState, SHARETRIBE_SDK_CLIENT_ID } from '../../sharetribeSetup'
import { storableError } from '../../util'
import { denormalisedResponseEntities } from '../../util/data'
import { initiatePrivileged, transitionPrivileged } from '../../util/api'
import sharetribeTokenStore from '../../sharetribeTokenStore'
import { fetchCurrentUser } from '../../slices/user.slice'
import { transitions } from '../../transactions/transactionProcessBooking'

// ================= initial state and slice =========== //

const initialState = {
  listing: null,
  orderData: null,
  speculateTransactionInProgress: false,
  speculateTransactionError: null,
  speculatedTransaction: null,
  transaction: null,
  initiateOrderError: null,
  confirmPaymentError: null,
  stripeCustomerFetched: false,
  initiateInquiryInProgress: false,
  initiateInquiryError: null,
  isClockInSync: false,
}

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setInitialValues: (state, action) => {
      return { ...state, ...action.payload }
    },
  },
  extraReducers: builder =>
    builder
      .addCase(initiateInquiryWithoutPayment.pending, state => {
        state.initiateInquiryInProgress = true
        state.initiateInquiryError = null
      })
      .addCase(initiateInquiryWithoutPayment.fulfilled, state => {
        state.initiateInquiryInProgress = false
      })
      .addCase(initiateInquiryWithoutPayment.rejected, (state, { payload }) => {
        state.initiateInquiryInProgress = false
        state.initiateInquiryError = storableError(payload)
      })
      .addCase(initiateOrder.pending, state => {
        state.initiateOrderError = null
      })
      .addCase(initiateOrder.fulfilled, (state, { payload }) => {
        state.transaction = payload
      })
      .addCase(initiateOrder.rejected, (state, { payload }) => {
        state.initiateOrderError = payload
      })
      .addCase(confirmPayment.pending, state => {
        state.confirmPaymentError = null
      })
      .addCase(confirmPayment.fulfilled, state => {})
      .addCase(confirmPayment.rejected, (state, { payload }) => {
        state.confirmPaymentError = payload
      })
      .addCase(speculateTransaction.pending, state => {
        state.speculateTransactionInProgress = true
        state.speculateTransactionError = null
        state.speculatedTransaction = null
      })
      .addCase(speculateTransaction.fulfilled, (state, { payload }) => {
        // Check that the local devices clock is within a minute from the server
        const lastTransitionedAt = payload?.attributes?.lastTransitionedAt
        const localTime = new Date()
        const minute = 60000
        state.speculateTransactionInProgress = false
        state.speculatedTransaction = payload
        state.isClockInSync =
          Math.abs(lastTransitionedAt?.getTime() - localTime.getTime()) < minute
      })
      .addCase(speculateTransaction.rejected, (state, { payload }) => {
        state.speculateTransactionInProgress = false
        state.speculateTransactionError = payload
      })
      .addCase(stripeCustomer.pending, state => {
        state.stripeCustomerFetched = false
      })
      .addCase(stripeCustomer.fulfilled, state => {
        state.stripeCustomerFetched = true
      })
      .addCase(stripeCustomer.rejected, (state, { payload }) => {
        state.stripeCustomerFetchError = payload
      }),
})

export const initiateOrder = createAsyncThunk(
  'checkout/initiateOrder',
  async (
    {
      orderParams,
      processAlias,
      transactionId,
      transitionName,
      isPrivilegedTransition,
    },
    { dispatch, extra: sdk },
  ) => {
    try {
      // If we already have a transaction ID, we should transition, not
      // initiate.
      const isTransition = !!transactionId

      const { deliveryMethod, quantity, bookingDates, ...otherOrderParams } =
        orderParams
      const quantityMaybe = quantity
        ? { stockReservationQuantity: quantity }
        : {}
      const bookingParamsMaybe = bookingDates || {}

      // Parameters only for client app's server
      const orderData = deliveryMethod ? { deliveryMethod } : {}

      // Parameters for Marketplace API
      const transitionParams = {
        ...quantityMaybe,
        ...bookingParamsMaybe,
        ...otherOrderParams,
      }

      const bodyParams = isTransition
        ? {
            id: transactionId,
            transition: transitionName,
            params: transitionParams,
          }
        : {
            processAlias,
            transition: transitionName,
            params: transitionParams,
          }
      const queryParams = {
        include: ['booking', 'provider'],
        expand: true,
      }
      const handleSucces = response => {
        const entities = denormalisedResponseEntities(response)
        const order = entities[0]
        return order
      }

      const handleError = e => {
        const transactionIdMaybe = transactionId
          ? { transactionId: transactionId.uuid }
          : {}
        console.log(e, 'initiate-order-failed', {
          ...transactionIdMaybe,
          listingId: orderParams.listingId.uuid,
          ...quantityMaybe,
          ...bookingParamsMaybe,
          ...orderData,
        })
        throw e
        return storableError(e)
      }

      const cookieToken = await sharetribeTokenStore({
        clientId: SHARETRIBE_SDK_CLIENT_ID,
      }).getCookieToken()
      if (isTransition && isPrivilegedTransition) {
        // transition privileged
        return transitionPrivileged(
          {
            isSpeculative: false,
            orderData,
            bodyParams,
            queryParams,
          },
          cookieToken,
        )
          .then(handleSucces)
          .catch(handleError)
      } else if (isTransition) {
        // transition non-privileged
        return sdk.transactions
          .transition(bodyParams, queryParams)
          .then(handleSucces)
          .catch(handleError)
      } else if (isPrivilegedTransition) {
        // initiate privileged
        return initiatePrivileged(
          {
            isSpeculative: false,
            orderData,
            bodyParams,
            queryParams,
          },
          cookieToken,
        )
          .then(handleSucces)
          .catch(handleError)
      } else {
        // initiate non-privileged
        return sdk.transactions
          .initiate(bodyParams, queryParams)
          .then(handleSucces)
          .catch(handleError)
      }
    } catch (e) {}
  },
)

export const confirmPayment = createAsyncThunk(
  'checkout/confirmPayment',
  async (orderParams, { dispatch, extra: sdk }) => {
    const bodyParams = {
      id: orderParams?.transactionId,
      transition: transitions.CONFIRM_PAYMENT,
      params: {},
    }

    const queryParams = {
      include: ['booking', 'provider'],
      expand: true,
    }
    return sdk.transactions
      .transition(bodyParams, queryParams)
      .then(response => {
        const order = response.data.data
        return order
      })
      .catch(e => {
        const transactionIdMaybe = transactionId
          ? { transactionId: transactionId.uuid }
          : {}
        throw e
      })
  },
)

export const sendMessage = createAsyncThunk(
  'checkout/sendMessage',
  async (params = {}, { dispatch, extra: sdk }) => {
    try {
      const message = params.message
      const orderId = params.id

      if (message) {
        await sdk.messages.send({
          transactionId: orderId,
          content: message,
        })
        return { orderId, messageSuccess: true }
      } else {
        return Promise.resolve({ orderId, messageSuccess: true })
      }
    } catch (error) {
      console.log(error, 'initial-message-send-failed', { txId: params.id })
      return { orderId: params.id, messageSuccess: false }
    }
  },
)

/**
 * Initiate transaction against default-inquiry process
 * Note: At this point inquiry transition is made directly against Marketplace API.
 *       So, client app's server is not involved here unlike with transitions including payments.
 *
 * @param {*} inquiryParams contains listingId and protectedData
 * @param {*} processAlias 'default-inquiry/release-1'
 * @param {*} transitionName 'transition/inquire-without-payment'
 * @returns
 */
export const initiateInquiryWithoutPayment = createAsyncThunk(
  'checkout/initiateInquiryWithoutPayment',
  async (
    { inquiryParams, processAlias, transitionName },
    { dispatch, extra: sdk },
  ) => {
    try {
      const bodyParams = {
        transition: transitionName,
        processAlias,
        params: inquiryParams,
      }
      const queryParams = {
        include: ['provider'],
        expand: true,
      }

      const response = await sdk.transactions.initiate(bodyParams, queryParams)

      const transactionId = response.data.data.id
      return transactionId
    } catch (e) {
      console.log('error', e)
      throw e
    }
  },
)

/**
 * Initiate or transition the speculative transaction with the given
 * booking details
 *
 * The API allows us to do speculative transaction initiation and
 * transitions. This way we can create a test transaction and get the
 * actual pricing information as if the transaction had been started,
 * without affecting the actual data.
 *
 * We store this speculative transaction in the page store and use the
 * pricing info for the booking breakdown to get a proper estimate for
 * the price with the chosen information.
 */
export const speculateTransaction = createAsyncThunk(
  'checkout/speculateTransaction',
  async (
    {
      orderParams,
      processAlias,
      transactionId,
      transitionName,
      isPrivilegedTransition,
    },
    { dispatch, extra: sdk },
  ) => {
    try {
      // If we already have a transaction ID, we should transition, not
      // initiate.
      const isTransition = !!transactionId

      const { deliveryMethod, quantity, bookingDates, ...otherOrderParams } =
        orderParams
      const quantityMaybe = quantity
        ? { stockReservationQuantity: quantity }
        : {}
      const bookingParamsMaybe = bookingDates || {}

      // Parameters only for client app's server
      const orderData = deliveryMethod ? { deliveryMethod } : {}

      // Parameters for Marketplace API
      const transitionParams = {
        ...quantityMaybe,
        ...bookingParamsMaybe,
        ...otherOrderParams,
        cardToken: 'CheckoutPage_speculative_card_token',
      }

      const bodyParams = isTransition
        ? {
            id: transactionId,
            transition: transitionName,
            params: transitionParams,
          }
        : {
            processAlias,
            transition: transitionName,
            params: transitionParams,
          }

      const queryParams = {
        include: ['booking', 'provider'],
        expand: true,
      }

      const cookieToken = await sharetribeTokenStore({
        clientId: SHARETRIBE_SDK_CLIENT_ID,
      }).getCookieToken()

      const handleSuccess = response => {
        const entities = denormalisedResponseEntities(response)
        if (entities.length !== 1) {
          throw new Error('Expected a resource in the speculate response')
        }
        const tx = entities[0]
        return tx
      }

      const handleError = e => {
        console.log(e, 'speculate-transaction-failed', {
          listingId: transitionParams.listingId.uuid,
          ...quantityMaybe,
          ...bookingParamsMaybe,
          ...orderData,
        })
        return storableError(e)
      }

      if (isTransition && isPrivilegedTransition) {
        // transition privileged
        return transitionPrivileged(
          {
            isSpeculative: true,
            orderData,
            bodyParams,
            queryParams,
          },
          cookieToken,
        )
          .then(handleSuccess)
          .catch(handleError)
      } else if (isTransition) {
        // transition non-privileged
        return sdk.transactions
          .transitionSpeculative(bodyParams, queryParams)
          .then(handleSuccess)
          .catch(handleError)
      } else if (isPrivilegedTransition) {
        // initiate privileged
        return initiatePrivileged(
          {
            isSpeculative: true,
            orderData,
            bodyParams,
            queryParams,
          },
          cookieToken,
        )
          .then(handleSuccess)
          .catch(handleError)
      } else {
        // initiate non-privileged
        return sdk.transactions
          .initiateSpeculative(bodyParams, queryParams)
          .then(handleSuccess)
          .catch(handleError)
      }
    } catch (e) {
      console.log('e', e)
    }
  },
)

export const stripeCustomer = createAsyncThunk(
  'checkout/stripeCustomer',
  async (_, { dispatch, extra: sdk }) => {
    try {
      await dispatch(
        fetchCurrentUser({ include: ['stripeCustomer.defaultPaymentMethod'] }),
      )
    } catch (e) {
      return storableError(e)
    }
  },
)

// ============ Reducer ============ //
export default checkoutSlice.reducer

// ============ Action ============ //
export const { setInitialValues } = checkoutSlice.actions

// ============ Selectors ============ //
export const listingSelector = (state: RootState) => state.checkout.listing
export const orderDataSelector = (state: RootState) => state.checkout.orderData
export const transactionSelector = (state: RootState) =>
  state.checkout.transaction
export const initiateInquiryInProgressSelector = (state: RootState) =>
  state.checkout.initiateInquiryInProgress
export const initiateInquiryErrorSelector = (state: RootState) =>
  state.checkout.initiateInquiryError
export const speculateTransactionInProgressSelector = (state: RootState) =>
  state.checkout.speculateTransactionInProgress
export const speculateTransactionErrorSelector = (state: RootState) =>
  state.checkout.speculateTransactionError
export const speculatedTransactionSelector = (state: RootState) =>
  state.checkout.speculatedTransaction
export const initiateOrderErrorSelector = (state: RootState) =>
  state.checkout.initiateOrderError
export const isClockInSyncSelector = (state: RootState) =>
  state.checkout.isClockInSync
export const initiateOrderError = (state: RootState) =>
  state.checkout.initiateOrderError
export const stripeCustomerFetchedSelector = (state: RootState) =>
  state.checkout.stripeCustomerFetched
