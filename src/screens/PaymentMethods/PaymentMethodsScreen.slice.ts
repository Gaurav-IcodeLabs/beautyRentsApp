import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Thunk } from '../../appTypes'
import { RootState } from '../../sharetribeSetup'
interface PaymentMethodsScreenState {
  setupIntentInProgress: boolean
  setupIntent: null | any
  setupIntentError: null | object
}

const initialState: PaymentMethodsScreenState = {
  setupIntentInProgress: false,
  setupIntent: null,
  setupIntentError: null || {},
}

export const PaymentMethodsScreen = createSlice({
  name: 'paymentMethodsScreen',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(createStripeSetupIntent.pending, state => {
      state.setupIntentInProgress = true
      state.setupIntentError = null || {}
    })
    builder.addCase(createStripeSetupIntent.fulfilled, (state, { payload }) => {
      state.setupIntentInProgress = false
      state.setupIntent = payload
      state.setupIntentError = null || {}
    })
    builder.addCase(createStripeSetupIntent.rejected, (state, { payload }) => {
      state.setupIntentInProgress = false
      state.setupIntentError = payload || {}
    })
  },
})

export const createStripeSetupIntent = createAsyncThunk<{}, {}, Thunk>(
  'paymentMethodsScreen/createStripeSetupIntent',
  async (_, { dispatch, getState, extra: sdk }) => {
    const response = await sdk.stripeSetupIntents.create()
    const setupIntent = response?.data?.data
    return setupIntent
  },
)

export default PaymentMethodsScreen.reducer
// ================ Selectors ================ //

export const setupIntent = (state: RootState) =>
  state.paymentMethodsScreen.setupIntent
export const setupIntentErrorSelector = (state: RootState) =>
  state.paymentMethodsScreen.setupIntentError
export const setupIntentInProgressSelector = (state: RootState) =>
  state.paymentMethodsScreen.setupIntentInProgress
