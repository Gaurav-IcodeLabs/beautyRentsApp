import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Thunk } from '../../appTypes'
import { denormalisedResponseEntities } from '../../util/data'
import { setCurrentUser } from '../../slices/user.slice'
import { storableError } from '../../util'
import { RootState } from '../../sharetribeSetup'

const initialState = {
  saveProfileDataInProgress: false,
  saveProfileDataError: null,
  saveProfileDataSuccess: false,
  imageUploadInProgress: false,
  imageUploadError: null,
}

const profileSettings = createSlice({
  name: 'profileSettings',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(saveProfileData.pending, state => {
      state.saveProfileDataInProgress = true
      state.saveProfileDataSuccess = false
      state.saveProfileDataError = null
    })
    builder.addCase(saveProfileData.fulfilled, state => {
      state.saveProfileDataInProgress = false
      state.saveProfileDataSuccess = true
      state.saveProfileDataError = null
    })
    builder.addCase(saveProfileData.rejected, (state, action) => {
      state.saveProfileDataInProgress = false
      state.saveProfileDataSuccess = false
      state.saveProfileDataError = action.error
    })
    builder.addCase(requestImageUpload.pending, state => {
      state.imageUploadInProgress = true
      state.imageUploadError = null
    })
    builder.addCase(requestImageUpload.fulfilled, state => {
      state.imageUploadInProgress = false
    })
    builder.addCase(requestImageUpload.rejected, (state, { error }) => {
      state.imageUploadInProgress = false
      state.imageUploadError = storableError(error)
    })
  },
})

export const saveProfileData = createAsyncThunk<{}, {}, Thunk>(
  'profileSettings/saveProfileData',
  async (data, { extra: sdk, dispatch }) => {
    const queryParams = {
      expand: true,
      include: ['profileImage'],
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
    }
    try {
      const response = await sdk.currentUser.updateProfile(data, queryParams)
      const entities = denormalisedResponseEntities(response)
      if (entities.length !== 1) {
        throw new Error(
          'Expected a resource in the sdk.currentUser.updateProfile response',
        )
      }
      const currentUser = entities[0]
      // Update current user in state.user.currentUser through user.duck.js
      dispatch(setCurrentUser(currentUser))
    } catch (error) {
      console.log('data', data)
      console.log('error', storableError(error))
    }
  },
)

export const requestImageUpload = createAsyncThunk<{}, {}, Thunk>(
  'profileSettings/requestImageUpload',
  async ({ file } = {}, { extra: sdk }) => {
    try {
      const bodyParams = {
        image: file,
      }
      const queryParams = {
        expand: true,
        'fields.image': ['variants.square-small', 'variants.square-small2x'],
      }

      const res = await sdk.images.upload(bodyParams, queryParams)
      return res
    } catch (error) {
      return storableError(error)
    }
  },
)

export default profileSettings.reducer

export const imageUploadInProgressSelector = (state: RootState) =>
  state.profileSettings.imageUploadInProgress

export const imageUploadErrorSelector = (state: RootState) =>
  state.profileSettings.imageUploadError

export const saveProfileDataInProgressSelector = (state: RootState) =>
  state.profileSettings.saveProfileDataInProgress
