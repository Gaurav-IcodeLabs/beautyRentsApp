import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthState, LoginThunkParams, SignupParams, Thunk } from '../appTypes';
import { clearCurrentUser, fetchCurrentUser } from './user.slice';
import { storableError } from '../util';
import { RootState } from '../sharetribeSetup';

interface AuthInfo {
  isAnonymous: boolean;
  isLoggedInAs: boolean;
}

const authenticated = (authInfo: AuthInfo) => authInfo?.isAnonymous === false;
const loggedInAs = (authInfo: AuthInfo) => authInfo?.isLoggedInAs === true;

const initialState: AuthState = {
  isAuthenticated: false,

  // is marketplace operator logged in as a marketplace user
  isLoggedInAs: false,

  // scopes associated with current token
  authScopes: [],

  // auth info
  authInfoLoaded: false,

  // login
  loginError: null,
  loginInProgress: false,

  // logout
  logoutError: null,
  logoutInProgress: false,

  // signup
  signupError: null,
  signupInProgress: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState: () => {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder.addCase(authInfo.pending, (state, { payload }) => {});
    builder.addCase(authInfo.fulfilled, (state, { payload }) => {
      state.authInfoLoaded = true;
      state.isAuthenticated = authenticated(payload);
      state.isLoggedInAs = authenticated(payload);
      state.authScopes = payload.scopes;
    });
    builder.addCase(authInfo.rejected, (state, action) => {
      state.logoutInProgress = false;
      state.logoutError = storableError(action.error);
    });

    builder.addCase(signup.pending, (state, action) => {
      state.signupInProgress = true;
      state.signupError = null;
    });
    builder.addCase(signup.fulfilled, (state, action) => {
      state.signupInProgress = false;
      state.isAuthenticated = true;
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.signupError = storableError(action.error);
      state.signupInProgress = false;
    });

    builder.addCase(login.pending, state => {
      state.loginInProgress = true;
      state.loginError = null;
    });
    builder.addCase(login.fulfilled, state => {
      state.loginInProgress = false;
      state.isAuthenticated = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loginInProgress = false;
      state.loginError = storableError(action.error);
    });

    builder.addCase(logout.pending, state => {
      state.logoutInProgress = true;
      state.isAuthenticated = false;
      state.isLoggedInAs = false;
      state.authScopes = [];
    });
    builder.addCase(logout.fulfilled, (state, action) => {
      state.logoutInProgress = false;
      state.isAuthenticated = false;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.logoutInProgress = false;
      state.logoutError = storableError(action.error);
    });
  },
});

export const authInfo = createAsyncThunk<{}, {}, Thunk>(
  'auth/authInfo',
  async (_, { extra: sdk }) => {
    const info = await sdk.authInfo();
    return info;
  },
);

export const signup = createAsyncThunk<{}, SignupParams, Thunk>(
  'auth/signup',
  async (params, { dispatch, extra: sdk }) => {
    await sdk.currentUser.create(params);
    const res = await dispatch(
      login({ username: params.email, password: params.password }),
    ).unwrap();
    return res;
  },
);

export const login = createAsyncThunk<{}, LoginThunkParams, Thunk>(
  'auth/loginStatus',
  async (params, { dispatch, extra: sdk }) => {
    await sdk.login(params);
    const currentUser = await dispatch(fetchCurrentUser({})).unwrap();
    return currentUser;
  },
);

export const logout = createAsyncThunk<{}, {}, Thunk>(
  'auth/logout',
  async (_, { dispatch, extra: sdk }) => {
    await sdk.logout();
    await dispatch(clearCurrentUser());
    return true;
  },
);

export const { resetAuthState } = authSlice.actions;
export const loginInProgressSelector = (state: RootState) =>
  state.auth.loginInProgress;
export const loginErrorSelector = (state: RootState) => state.auth.loginError;
export const signUpInProgressSelector = (state: RootState) =>
  state.auth.signupInProgress;
export const signUpErrorSelector = (state: RootState) => state.auth.signupError;
export const logoutInProgressSelector = (state: RootState) =>
  state.auth.logoutInProgress;

export default authSlice.reducer;
