import {
  BOOKING_PROCESS_NAME,
  INQUIRY_PROCESS_NAME,
  PURCHASE_PROCESS_NAME,
  resolveLatestProcessName,
  getProcess,
} from '../../transactions/transaction'

import { getStateDataForPurchaseProcess } from './Inbox.stateDataPurchase'
import { getStateDataForBookingProcess } from './Inbox.stateDataBooking'
import { getStateDataForInquiryProcess } from './Inbox.stateDataInquiry'
export interface StateDataShape {
  processName: string
  processState: string
  actionNeeded?: boolean
  isFinal?: boolean
  isSaleNotification?: boolean
}
// Translated name of the state of the given transaction
export const getStateData = params => {
  const { transaction } = params
  const processName = resolveLatestProcessName(
    transaction?.attributes?.processName,
  )
  const process = getProcess(processName)

  const processInfo = () => {
    const { getState, states } = process
    const processState = getState(transaction)
    return {
      processName,
      processState,
      states,
    }
  }

  if (processName === PURCHASE_PROCESS_NAME) {
    return getStateDataForPurchaseProcess(params, processInfo())
  } else if (processName === BOOKING_PROCESS_NAME) {
    return getStateDataForBookingProcess(params, processInfo())
  } else if (processName === INQUIRY_PROCESS_NAME) {
    return getStateDataForInquiryProcess(params, processInfo())
  } else {
    return {}
  }
}
