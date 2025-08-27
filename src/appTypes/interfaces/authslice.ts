import { StorableError } from './userSlice'

export interface AuthState {
  isAuthenticated: boolean
  signupError: null | StorableError
  signupInProgress: boolean
  isLoggedInAs: boolean
  authScopes: string[]
  authInfoLoaded: boolean
  loginError: null | StorableError
  loginInProgress: boolean
  logoutError: null | StorableError
  logoutInProgress: boolean
  signupIdpInProgress: boolean
  loginIdpInProgress: boolean
}

export interface SignupParams {
  firstName: string
  lastName: string
  email: string
  displayName?: string
  password: string
}

export interface SignupWithIdpParam extends Omit<SignupParams, 'password'> {
  idpToken: string
  identityProvider: string
}
export interface LoginThunkParams {
  username: string
  password: string
}

export interface CreateUserParams
  extends Pick<
    SignupParams,
    'email' | 'firstName' | 'lastName' | 'displayName'
  > {
  idpToken?: string
  idpId?: string
}
