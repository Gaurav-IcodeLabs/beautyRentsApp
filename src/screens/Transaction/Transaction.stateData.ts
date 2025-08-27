import {
  BOOKING_PROCESS_NAME,
  INQUIRY_PROCESS_NAME,
  PURCHASE_PROCESS_NAME,
  resolveLatestProcessName,
} from '../../transactions'
import { getStateDataForBookingProcess } from './Transaction.stateDataBooking'
import { getStateDataForInquiryProcess } from './Transaction.stateDataInquiry'
import { getStateDataForPurchaseProcess } from './Transaction.stateDataPurchase'

interface ErrorProps {
  type: string
  name: string
  message: string
}

interface ActionButtonProps {
  inProgress?: boolean
  error?: ErrorProps
  onAction: () => void
  buttonText?: string
  errorText?: string
}

export interface StateDataProps {
  processName: string
  processState: string
  primaryButtonProps?: ActionButtonProps
  secondaryButtonProps?: ActionButtonProps
  showActionButtons?: boolean
  showDetailCardHeadings?: boolean
  showDispute?: boolean
  showOrderPanel?: boolean
  showReviewAsFirstLink?: boolean
  showReviewAsSecondLink?: boolean
  showReviews?: boolean
}

// Transitions are following process.edn format: "transition/my-transtion-name"

// This extracts the 'my-transtion-name' string if namespace exists
const getTransitionKey = transitionName => {
  const [nameSpace, transitionKey] = transitionName.split('/')
  return transitionKey || transitionName
}

// Action button prop for the TransactionPanel
const getActionButtonPropsMaybe = (params, onlyForRole = 'both') => {
  const {
    processName,
    transitionName,
    inProgress,
    transitionError,
    onAction,
    transactionRole,
    actionButtonTranslationId,
    actionButtonTranslationErrorId,
    t,
  } = params
  const transitionKey = getTransitionKey(transitionName)
  const actionButtonTrId =
    actionButtonTranslationId ||
    `TransactionPage.${processName}.${transactionRole}.transition-${transitionKey}.actionButton`
  const actionButtonTrErrorId =
    actionButtonTranslationErrorId ||
    `TransactionPage.${processName}.${transactionRole}.transition-${transitionKey}.actionError`

  return onlyForRole === 'both' || onlyForRole === transactionRole
    ? {
        inProgress,
        error: transitionError,
        onAction,
        buttonText: t(actionButtonTrId),
        errorText: t(actionButtonTrErrorId),
      }
    : {}
}

export const getStateData = (params, process) => {
  const {
    transaction,
    transactionRole,
    transitionInProgress,
    transitionError,
    onTransition,
    sendReviewInProgress,
    sendReviewError,
    onOpenReviewModal,
    t,
  } = params
  const isCustomer = transactionRole === 'customer'
  const processName = resolveLatestProcessName(
    transaction?.attributes?.processName,
  )

  const getActionButtonProps = (transitionName, forRole, extra = {}) =>
    getActionButtonPropsMaybe(
      {
        processName,
        transitionName,
        transactionRole,
        inProgress: transitionInProgress === transitionName,
        transitionError,
        onAction: () => onTransition(transaction?.id, transitionName, {}),
        ...extra,
        t,
      },
      forRole,
    )

  const getLeaveReviewProps = getActionButtonPropsMaybe({
    processName,
    transitionName: 'leaveReview',
    transactionRole,
    inProgress: sendReviewInProgress,
    transitionError: sendReviewError,
    onAction: onOpenReviewModal,
    actionButtonTranslationId: 'TransactionPage.leaveReview.actionButton',
    actionButtonTranslationErrorId: 'TransactionPage.leaveReview.actionError',
    t,
  })

  const processInfo = () => {
    const { getState, states, transitions } = process
    const processState = getState(transaction)
    return {
      processName,
      processState,
      states,
      transitions,
      isCustomer,
      actionButtonProps: getActionButtonProps,
      leaveReviewProps: getLeaveReviewProps,
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
