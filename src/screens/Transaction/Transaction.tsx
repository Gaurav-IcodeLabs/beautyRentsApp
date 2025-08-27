import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useConfiguration } from '../../context'
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup'
import {
  clearTransactionSlice,
  fetchMessages,
  fetchNextTransitions,
  fetchTransaction,
  fetchTransactionErrorSelector,
  fetchTransactionInProgressSelector,
  makeTransition,
  processTransitionsSelector,
  sendReview,
  sendReviewErrorSelector,
  sendReviewInProgressSelector,
  transactionRefSelector,
  transitionErrorSelector,
  transitionInProgressSelector,
} from './Transaction.slice'
import {
  entitiesSelector,
  getMarketplaceEntities,
} from '../../slices/marketplaceData.slice'
import {
  INQUIRY_PROCESS_NAME,
  TX_TRANSITION_ACTOR_CUSTOMER as CUSTOMER,
  TX_TRANSITION_ACTOR_PROVIDER as PROVIDER,
  resolveLatestProcessName,
  getProcess,
  isBookingProcess,
} from '../../transactions'
import { useTranslation } from 'react-i18next'
import { currentUserIdSelector } from '../../slices/user.slice'
import {
  RenderDropdownField,
  ScreenHeader,
  UserDisplayName,
} from '../../components'
import { getStateData } from './Transaction.stateData'
import {
  DATE_TYPE_DATE,
  DATE_TYPE_DATETIME,
  LINE_ITEM_HOUR,
  LISTING_UNIT_TYPES,
  widthScale,
} from '../../util'
import OrderBreakdown from '../../components/OrderBreakdown/OrderBreakdown'
import BreakdownMaybe from './component/BreakdownMaybe'
import ActionButtonsMaybe from './component/ActionButtonsMaybe'
import TransactionListing from './component/TransactionListing'
import { colors } from '../../theme'
import DisputeButtonMaybe from './component/DisputeButtonMaybe'
import DisputeModal from './models/DisputeModal'
import ReviewModal from './models/ReviewModal'
import { chat } from '../../assets'
import ChatModal from './models/ChatModal'
import { useForm } from 'react-hook-form'
import { TransactionDropDown, TransactionTypes } from '../../appTypes'
import TransitionComponent from './component/TransitionComponent'
import InquiryMessageMaybe from './component/InquiryMessageMaybe'

// Submit dispute
const onDisputeOrder =
  (currentTransactionId, transitionName, onTransition, setDisputeSubmitted) =>
  values => {
    const { disputeReason } = values
    const params = disputeReason ? { protectedData: { disputeReason } } : {}
    onTransition(currentTransactionId, transitionName, params)
      .then(r => {
        return setDisputeSubmitted(true)
      })
      .catch(e => {
        // Do nothing.
      })
  }

const switchData = [
  {
    value: TransactionDropDown.TRANSACTION_VALUE,
    label: TransactionDropDown.TRANSACTION_LABEL,
  },
  {
    value: TransactionDropDown.TRANSITION_VALUE,
    label: TransactionDropDown.TRANSITION_LABEL,
  },
]

export const Transaction = () => {
  const { t } = useTranslation()
  const route = useRoute()
  const config = useConfiguration()
  const dispatch = useAppDispatch()
  const navigation = useNavigation()
  const [isDisputeModalOpen, setDisputeModalOpen] = useState(false)
  const [disputeSubmitted, setDisputeSubmitted] = useState(false)
  const [isReviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [isChatModalOpen, setChatModalOpen] = useState(false)
  const currentUserID = useTypedSelector(currentUserIdSelector)
  const { transactionId, transactionRole } = route?.params
  const transactionRef = useTypedSelector(transactionRefSelector)
  const fetchTransactionError = useTypedSelector(fetchTransactionErrorSelector)
  const fetchTransactionInProgress = useTypedSelector(
    fetchTransactionInProgressSelector,
  )
  const nextTransitions = useTypedSelector(processTransitionsSelector)
  const transitionInProgress = useTypedSelector(transitionInProgressSelector)
  const transitionError = useTypedSelector(transitionErrorSelector)
  const sendReviewInProgress = useTypedSelector(sendReviewInProgressSelector)
  const sendReviewError = useTypedSelector(sendReviewErrorSelector)
  const entities = useTypedSelector(entitiesSelector)
  const transaction =
    getMarketplaceEntities(
      entities,
      transactionRef ? [transactionRef] : [],
    )[0] || {}

  const { protectedData } = transaction?.attributes || {}

  const loadData = () => {
    dispatch(
      fetchTransaction({
        id: transactionId,
        txRole: transactionRole,
        config: config,
      }),
    )
    dispatch(fetchNextTransitions({ id: transactionId }))
    dispatch(fetchMessages({ txId: transactionId, page: 1, config }))
  }

  const { control, setValue, watch } = useForm({
    defaultValues: {
      switchType: '',
    },
    mode: 'onChange',
  })
  useEffect(() => {
    loadData()
    // assinging default value
    setValue('switchType', TransactionDropDown.TRANSACTION_VALUE)
  }, [route?.params])

  const { listing, provider, customer, booking } = transaction || {}
  const txTransitions = transaction?.attributes?.transitions || []
  const isProviderRole = transactionRole === PROVIDER
  const isCustomerRole = transactionRole === CUSTOMER

  const processName = resolveLatestProcessName(
    transaction?.attributes?.processName,
  )
  let process = null
  try {
    process = processName ? getProcess(processName) : null
  } catch (error) {
    // Process was not recognized!
  }

  const isInquiryProcess = processName === INQUIRY_PROCESS_NAME

  const isTxOnPaymentPending = tx => {
    return process
      ? process.getState(tx) === process.states.PENDING_PAYMENT
      : null
  }

  //to do redirectToCheckoutPageWithInitialValues()
  //to do handleSubmitOrderRequest()

  const deletedListingTitle = t('TransactionPage.deletedListing')
  const listingDeleted = listing?.attributes?.deleted
  const listingTitle = listingDeleted
    ? deletedListingTitle
    : listing?.attributes?.title

  // Redirect users with someone else's direct link to their own inbox/sales or inbox/orders page.
  const isDataAvailable =
    process &&
    currentUserID &&
    transaction?.id &&
    transaction?.id?.uuid === transactionId.uuid &&
    transaction?.attributes?.lineItems &&
    transaction.customer &&
    transaction.provider &&
    !fetchTransactionError

  const isOwnSale =
    isDataAvailable &&
    isProviderRole &&
    currentUserID.uuid === provider?.id?.uuid
  const isOwnOrder =
    isDataAvailable &&
    isCustomerRole &&
    currentUserID.uuid === customer?.id?.uuid
  const fetchErrorMessage = isCustomerRole
    ? 'TransactionPage.fetchOrderFailed'
    : 'TransactionPage.fetchSaleFailed'
  const loadingMessage = isCustomerRole
    ? 'TransactionPage.loadingOrderData'
    : 'TransactionPage.loadingSaleData'

  const loadingOrFailedFetching = fetchTransactionError ? (
    <Text>{t(fetchErrorMessage)}</Text>
  ) : transaction && !process ? (
    <Text>{t('TransactionPage.unknownTransactionProcess')}</Text>
  ) : (
    <Text>{t(loadingMessage)}</Text>
  )

  const otherUserDisplayName = (
    <UserDisplayName user={isOwnOrder ? provider : customer} />
  )

  const onTransition = async (txId, transitionName, params) => {
    await dispatch(makeTransition({ transitionName, txId, params }))
  }

  //this is called from action buttons
  const onOpenReviewModal = () => {
    setReviewModalOpen(true)
  }

  const onSubmitReview = async values => {
    const { reviewRating, reviewContent } = values
    const rating = Number.parseInt(reviewRating, 10)
    const { states, transitions } = process
    const transitionOptions =
      transactionRole === CUSTOMER
        ? {
            reviewAsFirst: transitions.REVIEW_1_BY_CUSTOMER,
            reviewAsSecond: transitions.REVIEW_2_BY_CUSTOMER,
            hasOtherPartyReviewedFirst: process
              .getTransitionsToStates([states.REVIEWED_BY_PROVIDER])
              .includes(transaction.attributes.lastTransition),
          }
        : {
            reviewAsFirst: transitions.REVIEW_1_BY_PROVIDER,
            reviewAsSecond: transitions.REVIEW_2_BY_PROVIDER,
            hasOtherPartyReviewedFirst: process
              .getTransitionsToStates([states.REVIEWED_BY_CUSTOMER])
              .includes(transaction.attributes.lastTransition),
          }

    const params = { reviewRating: rating, reviewContent }
    const response = await dispatch(
      sendReview({ tx: transaction, transitionOptions, params, config }),
    ).unwrap()
    if (response.status === 200) {
      setReviewModalOpen(false)
    }
  }

  const stateData = isDataAvailable
    ? getStateData(
        {
          transaction,
          transactionRole,
          nextTransitions,
          transitionInProgress,
          transitionError,
          sendReviewInProgress,
          sendReviewError,
          onTransition,
          t,
          onOpenReviewModal,
        },
        process,
      )
    : {}

  const hasLineItems = transaction?.attributes?.lineItems?.length > 0
  const unitLineItem = hasLineItems
    ? transaction.attributes?.lineItems?.find(
        item => LISTING_UNIT_TYPES.includes(item.code) && !item.reversal,
      )
    : null

  const formatLineItemUnitType = (transaction, listing) => {
    // unitType should always be saved to transaction's protected data
    const unitTypeInProtectedData =
      transaction?.attributes?.protectedData?.unitType
    // If unitType is not found (old or mutated data), we check listing's publicData
    // Note: this might have changed over time
    const unitTypeInListingPublicData =
      listing?.attributes?.publicData?.unitType
    return `line-item/${unitTypeInProtectedData || unitTypeInListingPublicData}`
  }

  const lineItemUnitType = unitLineItem
    ? unitLineItem.code
    : isDataAvailable
      ? formatLineItemUnitType(transaction, listing)
      : null

  const timeZone = listing?.attributes?.availabilityPlan?.timezone
  const dateType =
    lineItemUnitType === LINE_ITEM_HOUR ? DATE_TYPE_DATETIME : DATE_TYPE_DATE

  const txBookingMaybe = booking?.id ? { booking, dateType, timeZone } : {}

  const orderBreakdownMaybe = hasLineItems ? (
    <OrderBreakdown
      userRole={transactionRole}
      transaction={transaction}
      {...txBookingMaybe}
      currency={config.currency}
      marketplaceName={config.marketplaceName}
    />
  ) : null

  const actionButtons = (
    <ActionButtonsMaybe
      showButtons={stateData.showActionButtons}
      primaryButtonProps={stateData?.primaryButtonProps}
      secondaryButtonProps={stateData?.secondaryButtonProps}
      isListingDeleted={listingDeleted}
      isProvider={isProviderRole}
    />
  )

  const disputeButton = (
    <DisputeButtonMaybe setDisputeModalOpen={() => setDisputeModalOpen(true)} />
  )

  const openChatModal = () => {
    setChatModalOpen(true)
  }

  const handleBackPress = () => {
    dispatch(clearTransactionSlice())
    navigation.pop()
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        onLeftIconPress={() => handleBackPress()}
        title={listing?.attributes?.title}
        rightIcon={chat}
        rightIconContainerStyle={styles.rightIconContainerStyle}
        onRightIconPress={openChatModal}
      />
      {fetchTransactionInProgress ? (
        <ActivityIndicator
          size={'small'}
          color={colors.marketplaceColor}
          style={styles.loadingStyle}
        />
      ) : null}

      {isDataAvailable ? (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <RenderDropdownField
            control={control}
            name={'switchType'}
            labelField="label"
            valueField="value"
            data={switchData}
            onDropDownValueChange={(value, cb) => {
              cb(value?.value)
            }}
          />
          {watch().switchType === TransactionDropDown.TRANSACTION_VALUE ? (
            <>
              <TransactionListing listing={listing} />
              {/* TODO : medium level : order panel is a common for transaction and checkout */}
              {/* {stateData.showOrderPanel ? orderPanel : null} */}
              <InquiryMessageMaybe
                protectedData={protectedData}
                showInquiryMessage={isInquiryProcess}
                isCustomer={isCustomerRole}
              />
              <BreakdownMaybe
                orderBreakdown={orderBreakdownMaybe}
                processName={stateData.processName}
              />
              {stateData.showActionButtons ? actionButtons : null}
              {stateData.showDispute ? disputeButton : null}
            </>
          ) : (
            <TransitionComponent
              transaction={transaction}
              stateData={stateData}
            />
          )}
        </ScrollView>
      ) : !isDataAvailable && !fetchTransactionInProgress ? (
        <Text>{loadingOrFailedFetching}</Text>
      ) : null}
      {process?.transitions?.DISPUTE ? (
        <DisputeModal
          isOpen={isDisputeModalOpen}
          onCloseModal={() => setDisputeModalOpen(false)}
          onDisputeOrder={onDisputeOrder(
            transaction?.id,
            process.transitions.DISPUTE,
            onTransition,
            setDisputeSubmitted,
          )}
          disputeSubmitted={disputeSubmitted}
          disputeInProgress={
            transitionInProgress === process.transitions.DISPUTE
          }
          disputeError={transitionError}
        />
      ) : null}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onCloseModal={() => setReviewModalOpen(false)}
        user={isOwnOrder ? provider : customer}
        onSubmitReview={onSubmitReview}
        sendReviewInProgress={sendReviewInProgress}
        sendReviewError={sendReviewError}
        reviewSent={reviewSubmitted}
      />
      {isChatModalOpen ? (
        <ChatModal
          isOpen={isChatModalOpen}
          onCloseModal={() => setChatModalOpen(false)}
          stateData={stateData}
          transaction={transaction}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: widthScale(50),
  },
  rightIconContainerStyle: {
    alignItems: 'flex-end',
  },
  contentContainer: {
    alignItems: 'center',
    padding: widthScale(20),
  },
})
