import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Thunk } from '../appTypes'
import { IStripeCustomer } from '../appTypes/interfaces/entities'
import { RootState, store } from '../sharetribeSetup'
import { fetchCurrentUser } from './user.slice'

interface PaymentMethodState {
  addPaymentMethodInProgress: boolean
  addPaymentMethodError: string | null | undefined | {}
  deletePaymentMethodError: string | null | undefined | {}
  stripeCustomer: IStripeCustomer | null | undefined | {}
  deletePaymentMethodInProgress: boolean
  createStripeCustomerError: string | null | undefined | {}
  createStripeCustomerInProgress: boolean
}

const initialState: PaymentMethodState = {
  addPaymentMethodInProgress: false,
  addPaymentMethodError: null,
  deletePaymentMethodInProgress: false,
  deletePaymentMethodError: null,
  createStripeCustomerInProgress: false,
  createStripeCustomerError: null,
  stripeCustomer: null,
}

const paymentMethods = createSlice({
  name: 'paymentMethods',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      deletePaymentMethod.pending,
      (state: PaymentMethodState, action) => {
        state.deletePaymentMethodError = null
        state.deletePaymentMethodInProgress = true
      },
    )
    builder.addCase(
      deletePaymentMethod.fulfilled,
      (state: PaymentMethodState, action) => {
        state.deletePaymentMethodInProgress = false
      },
    )
    builder.addCase(
      deletePaymentMethod.rejected,
      (state: PaymentMethodState, action) => {
        state.deletePaymentMethodError = action.error
        state.deletePaymentMethodInProgress = false
      },
    )
    builder.addCase(
      addPaymentMethod.pending,
      (state: PaymentMethodState, action) => {
        state.addPaymentMethodError = null
        state.addPaymentMethodInProgress = true
      },
    )
    builder.addCase(
      addPaymentMethod.fulfilled,
      (state: PaymentMethodState, action) => {
        state.addPaymentMethodInProgress = false
        state.stripeCustomer = action.payload
      },
    )
    builder.addCase(
      addPaymentMethod.rejected,
      (state: PaymentMethodState, action) => {
        state.addPaymentMethodError = action.error
        state.addPaymentMethodInProgress = false
      },
    )

    builder.addCase(
      createStripeCustomer.pending,
      (state: PaymentMethodState, action) => {
        state.createStripeCustomerError = null
        state.createStripeCustomerInProgress = true
      },
    )
    builder.addCase(
      createStripeCustomer.fulfilled,
      (state: PaymentMethodState, action) => {
        state.createStripeCustomerInProgress = false
        state.stripeCustomer = action.payload
      },
    )
    builder.addCase(
      createStripeCustomer.rejected,
      (state: PaymentMethodState, action) => {
        state.createStripeCustomerError = action.error
        state.createStripeCustomerInProgress = false
      },
    )
  },
})

export const createStripeCustomer = createAsyncThunk<{}, {}, Thunk>(
  'paymentMethods/createStripeCustomer',
  async (stripePaymentMethodId, { dispatch, extra: sdk }) => {
    const response = await sdk.stripeCustomer.create(
      { stripePaymentMethodId },
      { expand: true },
    )
    if (response) {
      const stripeCustomer = response?.data?.data
      dispatch(
        fetchCurrentUser({
          include: ['stripeCustomer.defaultPaymentMethod'],
        }),
      )
      return stripeCustomer
    }
  },
)

export const addPaymentMethod = createAsyncThunk<{}, {}, Thunk>(
  'paymentMethods/addPaymentMethod',
  async (stripePaymentMethodId, { dispatch, extra: sdk }) => {
    const response = await sdk.stripeCustomer.addPaymentMethod(
      { stripePaymentMethodId },
      { expand: true },
    )
    if (response) {
      const stripeCustomer = response?.data?.data
      dispatch(
        fetchCurrentUser({
          include: ['stripeCustomer.defaultPaymentMethod'],
        }),
      )
      return stripeCustomer
    }
  },
)

export const deletePaymentMethod = createAsyncThunk<{}, {}, Thunk>(
  'paymentMethods/deletePaymentMethod',
  async (_, { dispatch, extra: sdk }) => {
    const response = await sdk.stripeCustomer.deletePaymentMethod(
      {},
      {
        expand: true,
      },
    )
    if (response) {
      const stripeCustomer = response?.data?.data
      dispatch(
        fetchCurrentUser({
          include: ['stripeCustomer.defaultPaymentMethod'],
        }),
      )
      return stripeCustomer
    }
  },
)

export const updatePaymentMethod = (stripePaymentMethodId) => {
try {
  const response = store.dispatch(deletePaymentMethod())
  if(response){
    store.dispatch(addPaymentMethod(stripePaymentMethodId))
  }
  return response
} catch (error) {
  console.log('error', error)
}
}

export const savePaymentMethod = (stripeCustomer, stripePaymentMethodId) => {
  try {
    const hasAlreadyDefaultPaymentMethod =
      stripeCustomer &&
      stripeCustomer.defaultPaymentMethod &&
      stripeCustomer.defaultPaymentMethod.id

    if (!stripeCustomer || !stripeCustomer.id) {
      store.dispatch(createStripeCustomer(stripePaymentMethodId))
    } else if (hasAlreadyDefaultPaymentMethod) {
      console.log('inupdate')
      updatePaymentMethod(stripePaymentMethodId)
    } else {
      store.dispatch(addPaymentMethod(stripePaymentMethodId))
    }
  } catch (error) {
    console.log('error', error)
  }
}

export default paymentMethods.reducer

// ================ Selectors ================ //

export const addPaymentMethodInProgressSelector = (state: RootState) =>
  state.paymentMethods.addPaymentMethodInProgress
export const createStripeCustomerInProgressSelector = (state: RootState) =>
  state.paymentMethods.createStripeCustomerInProgress
export const deletePMInProgressSelector = (state: RootState) =>
  state.paymentMethods.deletePaymentMethodInProgress
export const addPMErrorSelector = (state: RootState) =>
  state.paymentMethods.addPaymentMethodError
export const deletePMErrorSelector = (state: RootState) =>
  state.paymentMethods.deletePaymentMethodError
