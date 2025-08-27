import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { CurrentUser, Thunk, UserState } from '../appTypes'
import { RootState } from '../sharetribeSetup'
import { util as sdkUtil } from '../util'
import { denormalisedResponseEntities } from '../util/data'
import { storableError } from '../util/errors'
import { authInfo } from './auth.slice'
import { boolean } from 'zod'
import { fetchStripeAccount } from './StripeConnectAccount.slice'

const currentUserParameters = {
  include: ['profileImage', 'stripeAccount'],
  'fields.image': [
    'variants.square-small',
    'variants.square-small2x',
    'variants.square-xsmall',
    'variants.square-xsmall2x',
  ],
  'imageVariant.square-xsmall': sdkUtil.objectQueryString({
    w: 40,
    h: 40,
    fit: 'crop',
  }),
  'imageVariant.square-xsmall2x': sdkUtil.objectQueryString({
    w: 80,
    h: 80,
    fit: 'crop',
  }),
}

const mergeCurrentUser = (
  oldCurrentUser: CurrentUser,
  newCurrentUser: CurrentUser,
) => {
  const {
    id: oId,
    type: oType,
    attributes: oAttr,
    ...oldRelationships
  } = oldCurrentUser || {}
  const { id, type, attributes, ...relationships } = newCurrentUser || {}

  // Passing null will remove currentUser entity.
  // Only relationships are merged.
  // TODO figure out if sparse fields handling needs a better handling.
  return newCurrentUser === null
    ? null
    : oldCurrentUser === null
      ? newCurrentUser
      : { id, type, attributes, ...oldRelationships, ...relationships }
}

const initialState: UserState = {
  currentUser: null,
  currentUserShowError: null,
  updateCurrentUserError: null,
  updateCurrentUserInProgress: false,
  currentUserProgress: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearCurrentUser: () => {
      return initialState
    },
    setCurrentUser: (state, { payload }) => {
      state.currentUser = mergeCurrentUser(state.currentUser, payload)
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchCurrentUser.pending, (state, action) => {
      state.currentUserShowError = null
      state.currentUserProgress = true
    })
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.currentUser = mergeCurrentUser(
        state.currentUser as CurrentUser,
        action.payload,
      )
      state.currentUserProgress = false
      state.currentUserShowError = null
    })

    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.currentUserProgress = false
      state.currentUserShowError = storableError(action.error)
    })

    builder.addCase(updateCurrentUser.pending, (state, _) => {
      state.updateCurrentUserError = null
      state.updateCurrentUserInProgress = true
    })

    builder.addCase(updateCurrentUser.fulfilled, (state, action) => {
      state.currentUser = mergeCurrentUser(
        state.currentUser as CurrentUser,
        action.payload,
      )
      state.updateCurrentUserError = null
      state.updateCurrentUserInProgress = false
    })
  },
})

export const fetchCurrentUser = createAsyncThunk<CurrentUser, {}, Thunk>(
  'user/fetchCurrentUserStatus',
  async (params = {}, { dispatch, extra: sdk }) => {
    const parameters = { ...currentUserParameters, ...params }

    const response = await sdk.currentUser.show(parameters)
    const entities = denormalisedResponseEntities(response)

    if (entities.length !== 1) {
      throw new Error(
        'Expected a resource in the sdk.currentUser.show response',
      )
    }
    const currentUser: CurrentUser = entities[0]

    // Save stripeAccount to store.stripe.stripeAccount if it exists
    //TODO-H
    //  if (currentUser.stripeAccount) {
    //   dispatch(stripeAccountCreateSuccess(currentUser.stripeAccount));
    // }

    //TODO-H
    // dispatch(fetchCurrentUserHasListings())
    // dispatch(fetchCurrentUserNotifications())
    // if (!currentUser.attributes.emailVerified) {
    //   dispatch(fetchCurrentUserHasOrders())
    // }
    dispatch(fetchStripeAccount())
    // Make sure auth info is up to date
    dispatch(authInfo({}))
    return currentUser
  },
)

export const updateCurrentUser = createAsyncThunk<{}, Thunk>(
  'user/updateCurrentUser',
  async (params, { dispatch, getState, extra: sdk }) => {
    const res = await sdk.currentUser.updateProfile(params, {
      expand: true,
    })
    const entities = denormalisedResponseEntities(res)
    if (entities.length !== 1) {
      throw new Error(
        'Expected a resource in the sdk.currentUser.show response',
      )
    }
    const currentUser = entities[0]
    return currentUser
  },
)

export const { clearCurrentUser, setCurrentUser } = userSlice.actions

export default userSlice.reducer

export const currentUserIdSelector = (state: RootState) =>
  state.user?.currentUser?.id.uuid

export const currentUserSelector = (state: RootState) => state.user.currentUser
export const currentUserProfileSelector = (state: RootState) =>
  state.user?.currentUser?.attributes.profile

export const currentUserTypeSelector = (state: RootState) =>
  state.user?.currentUser?.attributes?.profile?.publicData?.userType
export const currentUserProgressSelector = (state: RootState) =>
  state.user?.currentUserProgress
export const currentUserBioSelector = (state: RootState) =>
  state.user?.currentUser?.attributes.profile?.bio

export const currentUserEmailSelector = (state: RootState) =>
  state.user?.currentUser?.attributes.email

export const currentUserDisplayNameSelector = (state: RootState) =>
  state.user?.currentUser?.attributes.profile?.displayName

export const currentUserProfileImageSelector = (state: RootState) =>
  state.user?.currentUser?.profileImage

export const currentUserStripeAccountSelector = (state: RootState) =>
  state.user?.currentUser?.stripeAccount

export const stripeCustomerSelector = (state: RootState) =>
  state.user.currentUser?.stripeCustomer

export const currentUserIsEmailVerifiedSelector = (state: RootState) =>
  state.user?.currentUser?.attributes?.emailVerified

export const currentUserPublicDataSelector = (state: RootState) =>
  state.user?.currentUser?.attributes.profile?.publicData

export const currentUserMetadataSelector = (state: RootState) =>
  state.user?.currentUser?.attributes?.profile?.metadata

export const updateCurrentUserErrorSelector = (state: RootState) =>
  state.user?.updateCurrentUserError

export const updateCurrentUserInProgressSelector = (state: RootState) =>
  state.user?.updateCurrentUserInProgress
