import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Thunk } from '../../appTypes'
import { RootState, store } from '../../sharetribeSetup'
import {
  createImageVariantConfig,
  isTransactionsTransitionInvalidTransition,
  storableError,
} from '../../util'
import {
  denormalisedEntities,
  denormalisedResponseEntities,
  updatedEntities,
} from '../../util/data'
import { getProcess, resolveLatestProcessName } from '../../transactions'
import { addMarketplaceEntities } from '../../slices/marketplaceData.slice'
import { transitions } from '../../transactions/transactionProcessPurchase'

// ============== Helpers =============== //
const queryParams = {
  include: [
    'customer',
    'customer.profileImage',
    'provider',
    'provider.profileImage',
    'listing',
    'listing.currentStock',
    'booking',
    'reviews',
    'reviews.author',
    'reviews.subject',
  ],
}

const getImageVariants = listingImageConfig => {
  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = listingImageConfig
  const aspectRatio = aspectHeight / aspectWidth
  return {
    'fields.image': [
      // Profile images
      'variants.square-small',
      'variants.square-small2x',

      // Listing images:
      `variants.${variantPrefix}`,
      `variants.${variantPrefix}-2x`,
    ],
    ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
    ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
  }
}

const listingRelationship = txResponse => {
  return txResponse?.data?.data.relationships.listing.data
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const REVIEW_TX_INCLUDES = ['reviews', 'reviews.author', 'reviews.subject']
const MESSAGES_PAGE_SIZE = 10

// Merge entity arrays using ids, so that conflicting items in newer array (b) overwrite old values (a).
// const a = [{ id: { uuid: 1 } }, { id: { uuid: 3 } }];
// const b = [{ id: : { uuid: 2 } }, { id: : { uuid: 1 } }];
// mergeEntityArrays(a, b)
// => [{ id: { uuid: 3 } }, { id: : { uuid: 2 } }, { id: : { uuid: 1 } }]
const mergeEntityArrays = (a, b) => {
  return a
    .filter(aEntity => !b.find(bEntity => aEntity.id.uuid === bEntity.id.uuid))
    .concat(b)
}
// ================= initial state and slice =========== //

const initialState = {
  fetchTransactionInProgress: false,
  fetchTransactionError: null,
  transactionRef: null,
  fetchTransitionsInProgress: false,
  fetchTransitionsError: null,
  processTransitions: null,
  transitionInProgress: null,
  transitionError: null,
  sendReviewInProgress: false,
  sendReviewError: null,

  fetchMessagesInProgress: false,
  fetchMessagesError: null,
  totalMessages: 0,
  totalMessagePages: 0,
  oldestMessagePageFetched: 0,
  messages: [],
  initialMessageFailedToTransaction: null,
  loadMoreMessageInProgress: false,

  sendMessageInProgress: false,
  sendMessageError: null,
}

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearTransactionSlice: () => {
      return initialState
    },
  },
  extraReducers: builder =>
    builder
      .addCase(fetchTransaction.pending, state => {
        state.fetchTransactionInProgress = true
      })
      .addCase(fetchTransaction.fulfilled, (state, { payload }) => {
        const transactionRef = { id: payload.data.data.id, type: 'transaction' }

        state.transactionRef = transactionRef
        state.fetchTransactionInProgress = false
      })
      .addCase(fetchTransaction.rejected, (state, { payload }) => {
        state.fetchTransactionInProgress = false
        state.fetchTransactionError = payload
      })
      .addCase(fetchNextTransitions.pending, state => {
        state.fetchTransitionsInProgress = true
      })
      .addCase(fetchNextTransitions.fulfilled, (state, { payload }) => {
        state.processTransitions = payload
        state.fetchTransitionsInProgress = false
      })
      .addCase(fetchNextTransitions.rejected, (state, { payload }) => {
        state.fetchTransitionsInProgress = false
        state.fetchTransitionsError = payload
      })
      .addCase(makeTransition.pending, (state, { meta }) => {
        state.transitionInProgress = meta?.arg?.transitionName
        state.transitionError = null
      })
      .addCase(makeTransition.fulfilled, state => {
        state.transitionInProgress = null
      })
      .addCase(makeTransition.rejected, (state, { payload }) => {
        state.transitionInProgress = null
        state.transitionError = payload
      })
      .addCase(sendReview.pending, state => {
        state.sendReviewInProgress = true
        state.sendReviewError = null
      })
      .addCase(sendReview.fulfilled, state => {
        state.sendReviewInProgress = false
      })
      .addCase(sendReview.rejected, (state, { payload }) => {
        console.log('payload', payload)
        state.sendReviewError = storableError(payload)
      })
      .addCase(fetchMessages.pending, (state, { meta }) => {
        if (meta?.arg.page === 1) {
          state.fetchMessagesInProgress = true
          state.fetchMessagesError = null
        } else {
          state.loadMoreMessageInProgress = true
        }
      })
      .addCase(fetchMessages.fulfilled, (state, { payload }) => {
        const oldestMessagePageFetched =
          state.oldestMessagePageFetched > payload?.pagination.page
            ? state.oldestMessagePageFetched
            : payload?.pagination.page
        return {
          ...state,
          fetchMessagesInProgress: false,
          messages: mergeEntityArrays(state.messages, payload.messages),
          totalMessages: payload?.pagination.totalItems,
          totalMessagePages: payload?.pagination.totalPages,
          oldestMessagePageFetched,
          loadMoreMessageInProgress: false,
        }
      })
      .addCase(fetchMessages.rejected, (state, { payload }) => {
        state.fetchMessagesInProgress = false
        state.fetchMessagesError = storableError(payload)
        state.loadMoreMessageInProgress = false
      })
      .addCase(sendMessage.pending, state => {
        state.sendMessageInProgress = true
        state.sendMessageError = null
        state.initialMessageFailedToTransaction = null
      })
      .addCase(sendMessage.fulfilled, state => {
        state.sendMessageInProgress = false
      })
      .addCase(sendMessage.rejected, (state, { payload }) => {
        state.sendMessageInProgress = false
        state.sendMessageError = storableError(payload)
      }),
})

export const fetchTransaction = createAsyncThunk(
  'transaction/fetchTransaction',
  async (params = {}, { dispatch, extra: sdk }) => {
    try {
      let txResponse = null
      const { id, txRole, config } = params
      const apiQueryParams = {
        id,
        ...queryParams,
        ...getImageVariants(config.layout.listingImage),
      }
      const response = await sdk.transactions.show(apiQueryParams, {
        expand: true,
      })
      txResponse = response
      const listingId = listingRelationship(response).id
      const entities = updatedEntities({}, response.data)
      const listingRef = { id: listingId, type: 'listing' }
      const transactionRef = { id, type: 'transaction' }
      const denormalised = denormalisedEntities(entities, [
        listingRef,
        transactionRef,
      ])
      const listing = denormalised[0]
      const transaction = denormalised[1]
      const processName = resolveLatestProcessName(
        transaction.attributes.processName,
      )

      const process = getProcess(processName)
      const isInquiry = process.getState(transaction) === process.states.INQUIRY

      // TODO : medium level priorty below part
      //    // Fetch time slots for transactions that are in inquired state
      //    const canFetchTimeslots =
      //    txRole === 'customer' && isBookingProcess(processName) && isInquiry;

      //  if (canFetchTimeslots) {
      //    fetchMonthlyTimeSlots(dispatch, listing);
      //  }

      const canFetchListing =
        listing && listing.attributes && !listing.attributes.deleted

      if (canFetchListing) {
        const listingResponse = await sdk.listings.show({
          id: listingId,
          include: ['author', 'author.profileImage', 'images'],
          ...getImageVariants(config.layout.listingImage),
        })

        const listingFields = config?.listing?.listingFields
        const sanitizeConfig = { listingFields }

        dispatch(
          addMarketplaceEntities({
            sdkResponse: listingResponse,
            sanitizeConfig,
          }),
        )
        dispatch(
          addMarketplaceEntities({ sdkResponse: response, sanitizeConfig }),
        )
        return response
      } else {
        dispatch(addMarketplaceEntities({ sdkResponse: response }))
        return response
      }
    } catch (error) {
      console.error('Error in fetchTransaction', error)
      return storableError(error)
    }
  },
)

export const fetchNextTransitions = createAsyncThunk(
  'transaction/fetchNextTransitions',
  async (params = {}, { dispatch, extra: sdk }) => {
    try {
      const { id } = params
      const response = await sdk.processTransitions.query({ transactionId: id })
      return response.data.data
    } catch (error) {
      console.log('error', error)
    }
  },
)

const refreshTx = (sdk, txId) =>
  sdk.transactions.show({ id: txId }, { expand: true })

const refreshTransactionEntity = async (sdk, txId, dispatch) => {
  try {
    await delay(3000)
    let response = await refreshTx(sdk, txId)
    dispatch(addMarketplaceEntities({ sdkResponse: response }))

    const lastTransition = response?.data?.data?.attributes?.lastTransition
    // We'll make another attempt if mark-received-from-purchased from default-purchase process is still the latest.
    if (lastTransition === transitions.MARK_RECEIVED_FROM_PURCHASED) {
      await delay(8000)
      response = await refreshTx(sdk, txId)
      dispatch(addMarketplaceEntities({ sdkResponse: response }))
    }
  } catch (error) {
    console.error('error refreshing transaction:', error)
  }
}

export const makeTransition = createAsyncThunk(
  'transaction/makeTransition',
  async ({ transitionName, txId, params = {} }, { dispatch, extra: sdk }) => {
    try {
      const response = await sdk.transactions.transition(
        { id: txId, transition: transitionName, params },
        { expand: true },
      )

      dispatch(addMarketplaceEntities({ sdkResponse: response }))
      //TO DO : low level
      //dispatch(fetchCurrentUserNotifications());
      // There could be automatic transitions after this transition
      // For example mark-received-from-purchased > auto-complete.
      // Here, we make 1-2 delayed updates for the tx entity.
      // This way "leave a review" link should show up for the customer.
      refreshTransactionEntity(sdk, txId, dispatch)
      return response
    } catch (error) {}
  },
)

// If other party has already sent a review, we need to make transition to
// transitions.REVIEW_2_BY_<CUSTOMER/PROVIDER>
const sendReviewAsSecond = async (
  txId,
  transition,
  params,
  dispatch,
  sdk,
  config,
) => {
  const include = REVIEW_TX_INCLUDES
  try {
    const response = await sdk.transactions.transition(
      { id: txId, transition, params },
      {
        expand: true,
        include,
        ...getImageVariants(config.layout.listingImage),
      },
    )
    dispatch(addMarketplaceEntities({ sdkResponse: response }))
    return response
  } catch (e) {
    // Rethrow so the page can track whether the sending failed, and
    // keep the message in the form for a retry.
    throw e
  }
}

// If other party has not yet sent a review, we need to make transition to
// transitions.REVIEW_1_BY_<CUSTOMER/PROVIDER>
// However, the other party might have made the review after previous data synch point.
// So, error is likely to happen and then we must try another state transition
// by calling sendReviewAsSecond().
const sendReviewAsFirst = async (
  txId,
  transition,
  params,
  dispatch,
  sdk,
  config,
) => {
  const include = REVIEW_TX_INCLUDES
  try {
    const response = await sdk.transactions.transition(
      { id: txId, transition, params },
      {
        expand: true,
        include,
        ...getImageVariants(config.layout.listingImage),
      },
    )
    dispatch(addMarketplaceEntities({ sdkResponse: response }))
    return response
  } catch (e) {
    // If transaction transition is invalid, lets try another endpoint.
    if (isTransactionsTransitionInvalidTransition(e)) {
      return sendReviewAsSecond(id, params, role, dispatch, sdk)
    } else {
      // Rethrow so the page can track whether the sending failed, and
      // keep the message in the form for a retry.
      throw e
    }
  }
}

export const sendReview = createAsyncThunk(
  'transaction/sendReview',
  async (
    { tx, transitionOptions, params, config },
    { dispatch, extra: sdk },
  ) => {
    try {
      const { reviewAsFirst, reviewAsSecond, hasOtherPartyReviewedFirst } =
        transitionOptions
      return hasOtherPartyReviewedFirst
        ? sendReviewAsSecond(
            tx?.id,
            reviewAsSecond,
            params,
            dispatch,
            sdk,
            config,
          )
        : sendReviewAsFirst(
            tx?.id,
            reviewAsFirst,
            params,
            dispatch,
            sdk,
            config,
          )
    } catch (error) {
      console.log('error', error)
    }
  },
)

export const fetchMessages = createAsyncThunk(
  'transaction/fetchMessages',
  async ({ txId, page, config }, { dispatch, extra: sdk }) => {
    try {
      const paging = { page, perPage: MESSAGES_PAGE_SIZE }
      const response = await sdk.messages.query({
        transaction_id: txId,
        include: ['sender', 'sender.profileImage'],
        ...getImageVariants(config.layout.listingImage),
        ...paging,
      })
      const messages = denormalisedResponseEntities(response)
      const { totalItems, totalPages, page: fetchedPage } = response.data.meta
      const pagination = { totalItems, totalPages, page: fetchedPage }
      const state = store.getState()
      const totalMessages = state.transaction.totalMessages

      // Check if totalItems has changed between fetched pagination pages
      // if totalItems has changed, fetch first page again to include new incoming messages.
      // TODO if there're more than 100 incoming messages,
      // this should loop through most recent pages instead of fetching just the first one.
      if (totalItems > totalMessages && page > 1) {
        dispatch(fetchMessages({ txId, page: 1, config }))
      }
      return { messages, pagination }
    } catch (e) {
      console.log('e', e)
    }
  },
)

export const fetchMoreMessages = createAsyncThunk(
  'transaction/fetchMoreMessages',
  async ({ txId, config }, { dispatch, extra: sdk }) => {
    try {
      const state = store.getState()
      const { oldestMessagePageFetched, totalMessagePages } = state.transaction
      const hasMoreOldMessages = totalMessagePages > oldestMessagePageFetched
      // In case there're no more old pages left we default to fetching the current cursor position
      const nextPage = hasMoreOldMessages
        ? oldestMessagePageFetched + 1
        : oldestMessagePageFetched
      return dispatch(fetchMessages({ txId, page: nextPage, config }))
    } catch (e) {
      console.log('more message fail', e)
    }
  },
)

export const sendMessage = createAsyncThunk(
  'transaction/sendMessage',
  async ({ txId, message, config }, { dispatch, extra: sdk }) => {
    try {
      const response = await sdk.messages.send({
        transactionId: txId,
        content: message,
      })
      const messageId = response.data.data.id
      // We fetch the first page again to add sent message to the page data
      // and update possible incoming messages too.
      // TODO if there're more than 100 incoming messages,
      // this should loop through most recent pages instead of fetching just the first one.
      await dispatch(fetchMessages({ txId, page: 1, config }))
      return messageId
    } catch (e) {
      console.log('sendMessage e', e)
    }
  },
)

// ============ Reducer ============ //
export default transactionSlice.reducer

// ============ Action ============ //
export const { clearTransactionSlice } = transactionSlice.actions

// ============ Selectors =========== //

export const fetchTransactionInProgressSelector = (state: RootState) =>
  state.transaction.fetchTransactionInProgress
export const fetchTransactionErrorSelector = (state: RootState) =>
  state.transaction.fetchTransactionError
export const transactionRefSelector = (state: RootState) =>
  state.transaction.transactionRef
export const fetchTransitionsInProgressSelector = (state: RootState) =>
  state.transaction.fetchTransitionsInProgress
export const fetchTransitionsErrorSelector = (state: RootState) =>
  state.transaction.fetchTransitionsError
export const processTransitionsSelector = (state: RootState) =>
  state.transaction.processTransitions
export const transitionInProgressSelector = (state: RootState) =>
  state.transaction.transitionInProgress
export const transitionErrorSelector = (state: RootState) =>
  state.transaction.transitionError
export const sendReviewInProgressSelector = (state: RootState) =>
  state.transaction.sendReviewInProgress
export const sendReviewErrorSelector = (state: RootState) =>
  state.transaction.sendReviewError
export const fetchMessagesInProgressSelector = (state: RootState) =>
  state.transaction.fetchMessagesInProgress
export const fetchMessagesErrorSelector = (state: RootState) =>
  state.transaction.fetchMessagesError
export const totalMessagesSelector = (state: RootState) =>
  state.transaction.totalMessages
export const totalMessagePagesSelector = (state: RootState) =>
  state.transaction.totalMessagePages
export const oldestMessagePageFetchedSelector = (state: RootState) =>
  state.transaction.oldestMessagePageFetched
export const messagesSelector = (state: RootState) => state.transaction.messages
export const initialMessageFailedToTransactionSelector = (state: RootState) =>
  state.transaction.initialMessageFailedToTransaction
export const sendMessageInProgressSelector = (state: RootState) =>
  state.transaction.sendMessageInProgress
export const sendMessageErrorSelector = (state: RootState) =>
  state.transaction.sendMessageError
export const loadMoreMessageInProgressSelector = (state: RootState) =>
  state.transaction.loadMoreMessageInProgress
