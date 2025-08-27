import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Thunk } from '../appTypes';
import { RootState } from '../sharetribeSetup';
import { storableError } from '../util';

type PasswordState = {
  resetPasswordInProgress: boolean;
  resetPasswordError: any;
  resetPasswordSuccess: boolean;
  setNewPasswordInProgress: boolean;
  setNewPasswordError: any;
  setNewPasswordSuccess: boolean;
  changePasswordInProgress: boolean;
  changePasswordError: any;
  changePasswordSuccess: boolean;
};

const initialState: PasswordState = {
  resetPasswordInProgress: false,
  resetPasswordError: null,
  resetPasswordSuccess: false,
  setNewPasswordInProgress: false,
  setNewPasswordError: null,
  setNewPasswordSuccess: false,
  changePasswordInProgress: false,
  changePasswordError: null,
  changePasswordSuccess: false,
};

const passwordSlice = createSlice({
  name: 'password',
  initialState,
  reducers: {
    resetPasswordState: () => initialState,
  },
  extraReducers: builder => {
    builder.addCase(resetPassword.pending, state => {
      state.resetPasswordInProgress = true;
      state.resetPasswordError = null;
    });
    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.resetPasswordInProgress = false;
      state.resetPasswordSuccess = true;
    });
    builder.addCase(
      resetPassword.rejected,
      (state, action: { payload: any; error: any }) => {
        state.resetPasswordInProgress = false;
        state.resetPasswordError = storableError(action.error);
      },
    );

    builder.addCase(setNewPassword.pending, state => {
      state.setNewPasswordInProgress = true;
      state.setNewPasswordError = null;
    });
    builder.addCase(setNewPassword.fulfilled, (state, action) => {
      state.setNewPasswordInProgress = false;
      state.setNewPasswordSuccess = true;
    });
    builder.addCase(
      setNewPassword.rejected,
      (state, action: { payload: any; error: any }) => {
        state.setNewPasswordInProgress = false;
        state.setNewPasswordError = storableError(action.error);
      },
    );

    builder.addCase(changePassword.pending, state => {
      state.changePasswordInProgress = true;
      state.changePasswordError = null;
    });
    builder.addCase(changePassword.fulfilled, (state, action) => {
      state.changePasswordInProgress = false;
      state.changePasswordSuccess = true;
    });
    builder.addCase(
      changePassword.rejected,
      (state, action: { payload: any; error: any }) => {
        state.changePasswordInProgress = false;
        state.changePasswordError = storableError(action.error);
      },
    );
  },
});

export const resetPassword = createAsyncThunk<
  {},
  { email: string | undefined },
  Thunk
>('password/resetPassword', async ({ email }, { extra: sdk }) => {
  try {
    const response = await sdk.passwordReset.request({ email }, {});
    return response;
  } catch (error) {
    console.error('Error verifying email:', error);
  }
});

export const setNewPassword = createAsyncThunk<
  {},
  { email: string; passwordResetToken: string; newPassword: string },
  Thunk
>(
  'password/setNewPassword',
  async ({ email, passwordResetToken, newPassword }, { extra: sdk }) => {
    try {
      const response = await sdk.passwordReset.reset(
        {
          email,
          passwordResetToken,
          newPassword,
        },
        {},
      );
      return response;
    } catch (error) {
      console.error('Error set new password:', error);
    }
  },
);

export const changePassword = createAsyncThunk<{}, Thunk>(
  'password/changePassword',
  async ({ currentPassword, newPassword }, { dispatch, extra: sdk }) => {
    const response = await sdk.currentUser.changePassword(
      {
        currentPassword,
        newPassword,
      },
      {
        expand: true,
      },
    );

    return response;
  },
);

export const { resetPasswordState } = passwordSlice.actions;

export const resetPasswordInProgressSelector = (state: RootState) =>
  state.password.resetPasswordInProgress;
export const resetPasswordErrorSelector = (state: RootState) =>
  state.password.resetPasswordError;
export const resetPasswordSuccessSelector = (state: RootState) =>
  state.password.resetPasswordSuccess;
export const setNewPasswordInProgressSelector = (state: RootState) =>
  state.password.setNewPasswordInProgress;
export const setNewPasswordErrorSelector = (state: RootState) =>
  state.password.setNewPasswordError;
export const setNewPasswordSuccessSelector = (state: RootState) =>
  state.password.setNewPasswordSuccess;
export const changePasswordInProgressSelector = (state: RootState) =>
  state.password.changePasswordInProgress;
export const changePasswordErrorSelector = (state: RootState) =>
  state.password.changePasswordError;
export const changePasswordSuccessSelector = (state: RootState) =>
  state.password.changePasswordSuccess;

export default passwordSlice.reducer;
