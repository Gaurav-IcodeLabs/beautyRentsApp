import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { storableError } from '../util/errors'
import { fetchCurrentUser } from './user.slice'
import { RootState } from '../sharetribeSetup'

const initialState = {
  // The state for creating a stripe account
  createStripeAccountInProgress: false,
  createStripeAccountError: null,

  // The state for updating a stripe account
  updateStripeAccountInProgress: false,
  updateStripeAccountError: null,

  // The state for fetching a stripe account
  fetchStripeAccountInProgress: false,
  fetchStripeAccountError: null,

  // The state for getting an account link
  getAccountLinkInProgress: false,
  getAccountLinkError: null,

  // The current stripe account
  stripeAccount: null,

  // Indicates whether the stripe account has been fetched
  stripeAccountFetched: false,
}

const StripeConnectAccount = createSlice({
  name: 'StripeConnectAccount',
  initialState,
  reducers: {
    /**
     * Clears the error in the stripe account.
     *
     * @param {object} state - The current state of the stripe account.
     * @param {object} action - The action object that triggered the function.
     */
    stripeAccountClearError: (state, action) => {
      state = initialState
    },
    clearStripeInfo: (state, action) => {
      console.log('Stripe Info Cleared')
      return initialState
    },
  },
  extraReducers: builder => {
    builder.addCase(createStripeAccount.pending, (state, action) => {
      state.createStripeAccountError = null
      state.createStripeAccountInProgress = true
    })
    builder.addCase(createStripeAccount.fulfilled, (state, action) => {
      state.createStripeAccountInProgress = false
      state.stripeAccount = action.payload
      state.stripeAccountFetched = true
    })
    builder.addCase(createStripeAccount.rejected, (state, action) => {
      state.createStripeAccountError = action.error
      state.createStripeAccountInProgress = false
    })

    builder.addCase(updateStripeAccount.pending, (state, action) => {
      state.updateStripeAccountError = null
      state.updateStripeAccountInProgress = true
    })
    builder.addCase(updateStripeAccount.fulfilled, (state, action) => {
      state.updateStripeAccountInProgress = false
      state.stripeAccount = action.payload
      state.stripeAccountFetched = true
    })
    builder.addCase(updateStripeAccount.rejected, (state, action) => {
      state.updateStripeAccountError = action.error
      state.createStripeAccountInProgress = false
    })
    builder.addCase(fetchStripeAccount.pending, (state, action) => {
      state.fetchStripeAccountError = null
      state.fetchStripeAccountInProgress = true
    })
    builder.addCase(fetchStripeAccount.fulfilled, (state, action) => {
      state.stripeAccount = action.payload
      state.fetchStripeAccountInProgress = false
      state.stripeAccountFetched = true
    })
    builder.addCase(fetchStripeAccount.rejected, (state, action) => {
      state.fetchStripeAccountError = action.error
      state.fetchStripeAccountInProgress = false
    })
  },
})

export const createStripeAccount = createAsyncThunk(
  'StripeConnectAccount/createStripeAccount',
  async (params: any, { dispatch, extra: sdk }: any) => {
    const {
      country,
      accountType,
      bankAccountToken,
      businessProfileMCC,
      businessProfileURL,
      accountToken,
    } = params

    // Capabilities are a collection of settings that can be requested for each provider.
    // What Capabilities are required determines what information Stripe requires to be
    // collected from the providers.
    // You can read more from here: https://stripe.com/docs/connect/capabilities-overview
    // In Flex both 'card_payments' and 'transfers' are required.
    const requestedCapabilities = ['card_payments', 'transfers']

    console.log('params for uploading-->>', {
      country,
      accountToken,
      bankAccountToken,
      requestedCapabilities,
      businessProfileMCC,
      businessProfileURL,
    })
    return sdk.stripeAccount
      .create(
        {
          country,
          accountToken,
          bankAccountToken,
          requestedCapabilities,
          businessProfileMCC,
          businessProfileURL,
        },

        { expand: true },
      )
      .then((response: any) => {
        const res = dispatch(fetchCurrentUser({}))
        const stripeAccount = response.data.data
        return stripeAccount
      })
      .catch((err: any) => {
        console.log('sdk.stripeAccounterr', JSON.stringify(err))
        const e = storableError(err)
        const stripeMessage =
          e.apiErrors && e.apiErrors.length > 0 && e.apiErrors[0].meta
            ? e.apiErrors[0].meta.stripeMessage
            : null
        throw e
      })
  },
)
// This function is used for updating the bank account token
// but could be expanded to other information as well.
//
// If the Stripe account has been created with account token,
// you need to use account token also to update the account.
// By default the account token will not be used.
// See API reference for more information:
// https://www.sharetribe.com/api-reference/?javascript#update-stripe-account
export const updateStripeAccount = createAsyncThunk(
  'StripeConnectAccount/updateStripeAccount',
  (params: any, { dispatch, getState, extra: sdk }: any) => {
    const bankAccountToken = params.bankAccountToken

    return sdk.stripeAccount
      .update(
        {
          bankAccountToken,
          requestedCapabilities: ['card_payments', 'transfers'],
        },
        { expand: true },
      )
      .then((response: any) => {
        const stripeAccount = response.data.data
        return stripeAccount
      })
      .catch((err: any) => {
        const e = storableError(err)
        const stripeMessage =
          e.apiErrors && e.apiErrors.length > 0 && e.apiErrors[0].meta
            ? e.apiErrors[0].meta.stripeMessage
            : null
        // console.error(err, 'update-stripe-account-failed', { stripeMessage })
        throw e
      })
  },
)

export const fetchStripeAccount = createAsyncThunk(
  'StripeConnectAccount/fetchStripeAccount',
  async (_, { dispatch, getState, extra: sdk }: any) => {
    try {
      const res = await sdk.stripeAccount.fetch()
      const stripeAccount = res.data.data
      return stripeAccount
    } catch (error: any) {
      const e = storableError(error)
      const stripeMessage =
        e.apiErrors && e.apiErrors.length > 0 && e.apiErrors[0].meta
          ? e.apiErrors[0].meta.stripeMessage
          : null
      throw new Error(stripeMessage)
    }
  },
)

export const getStripeConnectAccountLink = createAsyncThunk(
  'StripeConnectAccount/getStripeConnectAccountLink',
  (params: any, { dispatch, getState, extra: sdk }: any) => {
    const { failureURL, successURL, type } = params
    return sdk.stripeAccountLinks
      .create({
        failureURL,
        successURL,
        type,
        collect: 'currently_due',
      })
      .then((response: any) => {
        // Return the account link
        return response.data.data.attributes.url
      })
      .catch((err: any) => {
        const e = storableError(err)

        const stripeMessage =
          e.apiErrors && e.apiErrors.length > 0 && e.apiErrors[0].meta
            ? e.apiErrors[0].meta.stripeMessage
            : null
        // console.error(err, 'get-stripe-account-link-failed', { stripeMessage })
        throw e
      })
  },
)

//// action creators /////
export const { stripeAccountClearError, clearStripeInfo } =
  StripeConnectAccount.actions

//missing
export const getAccountLinkErrorSelector = state =>
    state.StripeConnectAccount.getAccountLinkError,
  //seems ok
  createStripeAccountErrorSelector = state =>
    state.StripeConnectAccount.createStripeAccountError,
  //seems ok
  updateStripeAccountErrorSelector = state =>
    state.StripeConnectAccount.updateStripeAccountError,
  //seems ok
  fetchStripeAccountErrorSelector = state =>
    state.StripeConnectAccount.fetchStripeAccountError,
  //missing
  getAccountLinkInProgressSelector = state =>
    state.StripeConnectAccount.getAccountLinkInProgress,
  //seems ok
  stripeAccountSelector = (state: RootState) =>
    state.StripeConnectAccount.stripeAccount,
  //seems ok
  stripeAccountFetchedSelector = state =>
    state.StripeConnectAccount.stripeAccountFetched,
  fetchStripeAccountInProgress = state =>
    state.StripeConnectAccount.fetchStripeAccountInProgress

export default StripeConnectAccount.reducer
