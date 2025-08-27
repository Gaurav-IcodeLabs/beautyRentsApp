import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Thunk } from '../../appTypes'
import { storableError } from '../../util'
import { RootState } from '../../sharetribeSetup'
import { denormalisedResponseEntities } from '../../util/data'
import { fetchCurrentUser } from '../../slices/user.slice'

const initialState = {
  changeEmailError: null,
  changeEmailInProgress: false,
  changeEmailSuccess: false,
  verifyEmailInProgress: false,
  verifyEmailSuccess: false,
  verifyEmailError: null,
  sendVerificationEmailInProgress: false,
  sendVerificationEmailError: null,
}

const contactDetails = createSlice({
  name: 'contactDetails',
  initialState,
  reducers: {
    resetChangeEmailState: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(changeEmail.pending, (state, action) => {
        state.changeEmailInProgress = true
        state.changeEmailError = null
      })
      .addCase(changeEmail.fulfilled, (state, action) => {
        state.changeEmailInProgress = false
      })
      .addCase(
        changeEmail.rejected,
        (state, action: { payload: any; error: any }) => {
          state.changeEmailError = storableError(action.error)
          state.changeEmailInProgress = false
        },
      )
    builder.addCase(verifyEmail.pending, state => {
      state.verifyEmailInProgress = true
      state.verifyEmailSuccess = false
    })
    builder.addCase(verifyEmail.fulfilled, state => {
      state.verifyEmailInProgress = false
      state.verifyEmailSuccess = true
    })
    builder.addCase(
      verifyEmail.rejected,
      (state, action: { payload: any; error: any }) => {
        state.changeEmailError = storableError(action.error)
        state.changeEmailInProgress = false
      },
    )
    builder.addCase(sendVerificationEmail.pending, state => {
      state.sendVerificationEmailInProgress = true
      state.sendVerificationEmailError = null
    })
    builder.addCase(sendVerificationEmail.fulfilled, state => {
      state.sendVerificationEmailInProgress = false
    })
    builder.addCase(sendVerificationEmail.rejected, (state, { payload }) => {
      state.sendVerificationEmailInProgress = false
      state.sendVerificationEmailError = payload
    })
  },
})

export const changeEmail = createAsyncThunk<{}, Thunk>(
  'user/changeEmailStatus',
  async ({ email, password }, { dispatch, extra: sdk }) => {
    const response = await sdk.currentUser.changeEmail(
      {
        currentPassword: password,
        email: email,
      },
      {
        expand: true,
      },
    )
    const entities = denormalisedResponseEntities(response)
    if (entities.length !== 1) {
      throw new Error(
        'Expected a resource in the sdk.currentUser.changeEmail response',
      )
    }

    const currentUser = entities[0]
    return currentUser
  },
)
export const verifyEmail = createAsyncThunk<{}, any>(
  'contactDetail/verifyEmail', // Action type
  async (verificationToken, { dispatch, extra: sdk }) => {
    try {
      const response = await sdk.currentUser.verifyEmail({
        verificationToken,
      })
      if (response.status == 200) {
        dispatch(fetchCurrentUser())
      }
      return response
    } catch (error) {
      console.error('Error verifying email:', error)
    }
  },
)
export const sendVerificationEmail = createAsyncThunk(
  'contactDetail/sendVerificationEmail',
  async (_, { dispatch, extra: sdk }) => {
    try {
      const res = await sdk.currentUser.sendVerificationEmail()
      return res
    } catch (e) {
      console.log('error', e)
      return storableError(e)
    }
  },
)

export const changeEmailErrorSelector = (state: RootState) =>
  state.contactDetails.changeEmailError
export const changeEmailInProgressSelector = (state: RootState) =>
  state.contactDetails.changeEmailInProgress
export const changeEmailSuccessSelector = (state: RootState) =>
  state.contactDetails.changeEmailSuccess

export const verifyEmailErrorSelector = (state: RootState) =>
  state.contactDetails.verifyEmailError
export const verifyEmailInProgressSelector = (state: RootState) =>
  state.contactDetails.verifyEmailInProgress
export const verifyEmailSuccessSelector = (state: RootState) =>
  state.contactDetails.verifyEmailSuccess
export const sendVerificationEmailInProgressSelector = (state: RootState) =>
  state.contactDetails.sendVerificationEmailInProgress
export const sendVerificationEmailErrorSelector = (state: RootState) =>
  state.contactDetails.sendVerificationEmailError

export const { resetChangeEmailState } = contactDetails.actions
export default contactDetails.reducer
