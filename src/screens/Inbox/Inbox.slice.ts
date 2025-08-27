import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getAllTransitionsForEveryProcess } from '../../transactions'
import { Thunk } from '../../appTypes'
import { storableError } from '../../util'
import { addMarketplaceEntities } from '../../slices/marketplaceData.slice'
import reverse from 'lodash/reverse'
import sortBy from 'lodash/sortBy'
import { RootState } from '../../sharetribeSetup'

// =================== helper ================= //

const sortedTransactions = txs =>
  reverse(
    sortBy(txs, tx => {
      return tx.attributes ? tx.attributes.lastTransitionedAt : null
    }),
  )

const entityRefs = entities =>
  entities.map(entity => ({
    id: entity.id,
    type: entity.type,
  }))

const INBOX_PAGE_SIZE = 5
const apiQueryParams = {
  // only: onlyFilter,
  lastTransitions: getAllTransitionsForEveryProcess(),
  include: [
    'listing',
    'provider',
    'provider.profileImage',
    'customer',
    'customer.profileImage',
    'booking',
  ],
  'fields.transaction': [
    'processName',
    'lastTransition',
    'lastTransitionedAt',
    'transitions',
    'payinTotal',
    'payoutTotal',
    'lineItems',
  ],
  'fields.listing': [
    'title',
    'description',
    'availabilityPlan',
    'publicData.listingType',
  ],
  'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
  'fields.image': ['variants.square-small', 'variants.square-small2x'],
  page: 1,
  perPage: INBOX_PAGE_SIZE,
}

// ================= initial state and slice =========== //
const initialState = {
  fetchOrderInProgress: false,
  ordersPagination: null,
  fetchOrdersError: null,
  transactionOrderRefs: [],
  ordersLoadingMore: false,

  fetchSalesInProgress: false,
  salesPagination: null,
  fetchSalesError: null,
  transactionSaleRefs: [],
  salesLoadingMore: false,
}

const inboxSlice = createSlice({
  name: 'inbox',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(
        loadOrderTransactions.pending,
        (state, { payload, meta: { arg } }) => {
          if (arg?.page === 1) {
            state.fetchOrderInProgress = true
            state.fetchOrdersError = null
          } else {
            state.ordersLoadingMore = true
          }
        },
      )
      .addCase(
        loadOrderTransactions.fulfilled,
        (state, { payload, meta: { arg } }) => {
          const transactions = sortedTransactions(payload?.data?.data)
          const newRefs = entityRefs(transactions)
          return {
            ...state,
            fetchOrderInProgress: false,
            ordersLoadingMore: false,
            transactionOrderRefs:
              arg?.page === 1
                ? newRefs
                : [...state.transactionOrderRefs, ...newRefs],
            ordersPagination: payload?.data?.meta,
          }
        },
      )
      .addCase(loadOrderTransactions.rejected, (state, { payload }) => {
        state.fetchOrderInProgress = false
        state.ordersLoadingMore = false
        state.fetchOrdersError = payload
      })
      .addCase(
        loadSalesTransactions.pending,
        (state, { payload, meta: { arg } }) => {
          if (arg?.page === 1) {
            state.fetchSalesInProgress = true
            state.fetchSalesError = null
          } else {
            state.salesLoadingMore = true
          }
        },
      )
      .addCase(
        loadSalesTransactions.fulfilled,
        (state, { payload, meta: { arg } }) => {
          const transactions = sortedTransactions(payload?.data?.data)
          const newRefs = entityRefs(transactions)
          return {
            ...state,
            fetchSalesInProgress: false,
            salesLoadingMore: false,
            transactionSaleRefs:
              arg?.page === 1
                ? newRefs
                : [...state.transactionSaleRefs, ...newRefs],
            salesPagination: payload?.data?.meta,
          }
        },
      )
      .addCase(loadSalesTransactions.rejected, (state, { payload }) => {
        state.fetchSalesInProgress = false
        state.salesLoadingMore = false
        state.fetchSalesError = payload
      })
  },
})

export const loadOrderTransactions = createAsyncThunk<{}, {}, Thunk>(
  'inbox/loadOrderTransactions',
  async (params = {}, { dispatch, extra: sdk }) => {
    try {
      const { page = 1 } = params
      const queryParams = {
        ...apiQueryParams,
        only: 'order',
        page,
      }

      const response = await sdk.transactions.query(queryParams)
      dispatch(addMarketplaceEntities({ sdkResponse: response }))
      return response
    } catch (error) {
      console.error('Error in loadOrderTransactions', error)
      return storableError(error)
    }
  },
)

export const loadSalesTransactions = createAsyncThunk<{}, {}, Thunk>(
  'inbox/loadSalesTransactions',
  async (params = {}, { dispatch, extra: sdk }) => {
    try {
      const { page = 1 } = params
      const queryParams = {
        ...apiQueryParams,
        only: 'sale',
        page,
      }

      const response = await sdk.transactions.query(queryParams)
      dispatch(addMarketplaceEntities({ sdkResponse: response }))
      return response
    } catch (error) {
      console.error('Error in loadOrderTransactions', error)
      return storableError(error)
    }
  },
)

// ============ Reducer ============ //
export default inboxSlice.reducer

// ============ Selectors =========== //
// currentPage: 1,
// loadingMore: false,
export const transactionOrderRefsSelector = (state: RootState) =>
  state.inbox.transactionOrderRefs
export const fetchOrderInProgressSelector = (state: RootState) =>
  state.inbox.fetchOrderInProgress
export const fetchOrdersErrorSelector = (state: RootState) =>
  state.inbox.fetchOrdersError
export const ordersPaginationSelector = (state: RootState) =>
  state?.inbox?.ordersPagination
export const ordersLoadingMoreSelector = (state: RootState) =>
  state.inbox.ordersLoadingMore
export const transactionSaleRefsSelector = (state: RootState) =>
  state.inbox.transactionSaleRefs
export const fetchSalesInProgressSelector = (state: RootState) =>
  state.inbox.fetchSalesInProgress
export const fetchSalesErrorSelector = (state: RootState) =>
  state.inbox.fetchSalesError
export const salesLoadingMoreSelector = (state: RootState) =>
  state.inbox.salesLoadingMore
export const salesPaginationSelector = (state: RootState) =>
  state.inbox.salesPagination
