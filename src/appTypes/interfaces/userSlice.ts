import { CurrentUser } from './sdk'

export interface UserState {
  currentUser: null | CurrentUser
  currentUserShowError: StorableError | null
  updateCurrentUserError: null | StorableError
  updateCurrentUserInProgress: boolean
  currentUserProgress: boolean
  // updateUserInProgress: boolean,
  // liked: [],
  // uploadedVideoAssetsIds:string[]
}

export interface StorableError {
  type: string
  name: string
  message: string
  status: number
  statusText: string
  apiErrors: string[]
}
