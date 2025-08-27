import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {
  TX_TRANSITION_ACTOR_OPERATOR,
  TX_TRANSITION_ACTOR_PROVIDER,
  TX_TRANSITION_ACTOR_SYSTEM,
  getProcess,
  getUserTxRole,
} from '../../../transactions'
import { reviewByAuthorId } from '../models/Chat.helper'
import { useTypedSelector } from '../../../sharetribeSetup'
import { currentUserIdSelector } from '../../../slices/user.slice'
import { useTranslation } from 'react-i18next'
import { UserDisplayName } from '../../../components'
import { useColors } from '../../../context'
import { colors, fontWeight } from '../../../theme'
import {
  REVIEW_RATINGS,
  fontScale,
  formatDateWithProximity,
  heightScale,
  widthScale,
} from '../../../util'
import { TransactionTypes } from '../../../appTypes'

/**
 * Helper components for transitions list item
 */
const Transition = props => {
  const { transitionMessageComponent, formattedDate, reviewComponent } = props
  return (
    <View style={styles.transitionItemContainer}>
      <Text style={styles.dotStyle}>• </Text>
      <View>
        <Text style={styles.transitionMessageStyle}>
          {transitionMessageComponent}
        </Text>
        <Text style={styles.dateStyle}>{formattedDate}</Text>
        {reviewComponent}
      </View>
    </View>
  )
}

const TransitionMessage = props => {
  const { t } = useTranslation()
  const {
    transition,
    nextState,
    stateData,
    deliveryMethod,
    listingTitle,
    ownRole,
    otherUsersName,
  } = props
  const {
    processName,
    processState,
    showReviewAsFirstLink,
    showReviewAsSecondLink,
  } = stateData
  const stateStatus =
    nextState === processState
      ? TransactionTypes.CURRENT
      : TransactionTypes.PAST

  // actor: 'you', 'system', 'operator', or display name of the other party
  const actor =
    transition.by === ownRole
      ? TransactionTypes.YOU
      : [TX_TRANSITION_ACTOR_SYSTEM, TX_TRANSITION_ACTOR_OPERATOR].includes(
            transition.by,
          )
        ? transition.by
        : otherUsersName

  const reviewLink = showReviewAsFirstLink ? (
    <Text>
      {t('TransactionPage.ActivityFeed.reviewLink', { otherUsersName })}
    </Text>
  ) : showReviewAsSecondLink ? (
    <Text>
      {t('TransactionPage.ActivityFeed.reviewAsSecondLink', { otherUsersName })}
    </Text>
  ) : null

  // ActivityFeed messages are tied to transaction process and transitions.
  // However, in practice, transitions leading to same state have had the same message.
  const message = (
    <Text>
      {t(`TransactionPage.ActivityFeed.${processName}.${nextState}`, {
        actor,
        otherUsersName,
        listingTitle,
        reviewLink,
        deliveryMethod,
        stateStatus,
      })}
    </Text>
  )
  return message
}

const ReviewComponentMaybe = props => {
  const { t } = useTranslation()
  const { showReviews, isRelevantTransition, reviewEntity } = props
  if (showReviews && isRelevantTransition) {
    const deletedReviewContent = t(
      'TransactionPage.ActivityFeed.deletedReviewContent',
    )
    const content = reviewEntity?.attributes?.deleted
      ? deletedReviewContent
      : reviewEntity?.attributes?.content
    const rating = reviewEntity?.attributes?.rating
    const ratingMaybe = rating ? { rating } : {}
    return <Review content={content} {...ratingMaybe} />
  }
  return null
}

const Review = props => {
  const { content, rating } = props
  const colorsData = useColors()
  const stars = REVIEW_RATINGS

  const renderNumber = number => {
    const isSelected = number <= rating
    const color = isSelected ? colorsData.marketplaceColor : colors.grey

    return (
      <View key={number}>
        <Text style={[styles.number, { color }]} key={`number-${number}`}>
          {number}
        </Text>
      </View>
    )
  }

  return rating ? (
    <View>
      <Text style={styles.reviewContentStyle}>{content}</Text>
      <View style={styles.rating}>{stars.map(renderNumber)}</View>
    </View>
  ) : null
}

const TransitionComponent = props => {
  const { t } = useTranslation()
  const currentUserId = useTypedSelector(currentUserIdSelector)
  const { transaction, stateData } = props
  const todayString = t('TransactionPage.ActivityFeed.today')

  const processName = stateData.processName

  // If stateData doesn't have processName, full tx data has not been fetched.
  if (!processName) {
    return null
  }
  const process = getProcess(processName)
  const transitions = transaction?.attributes?.transitions || []
  const relevantTransitions = transitions.filter(t =>
    process.isRelevantPastTransition(t.transition),
  )

  const transtionComponent = ({ transition }) => {
    const formattedDate = formatDateWithProximity(
      transition?.createdAt,
      todayString,
    )
    const { customer, provider, listing } = transaction || {}

    // Initially transition component is empty;
    let transitionComponent = <Transition />
    if (currentUserId && customer?.id && provider?.id && listing?.id) {
      const transitionName = transition.transition
      const nextState = process.getStateAfterTransition(transition.transition)
      const isCustomerReview = process.isCustomerReview(transitionName)
      const isProviderRieview = process.isProviderReview(transitionName)
      const reviewEntity = isCustomerReview
        ? reviewByAuthorId(transaction, customer.id)
        : isProviderRieview
          ? reviewByAuthorId(transaction, provider.id)
          : null

      const listingTitle = listing.attributes.deleted
        ? t('TransactionPage.ActivityFeed.deletedListing')
        : listing.attributes.title
      const ownRole = getUserTxRole(currentUserId, transaction)
      const otherUser =
        ownRole === TX_TRANSITION_ACTOR_PROVIDER ? customer : provider

      transitionComponent = (
        <Transition
          formattedDate={formattedDate}
          transitionMessageComponent={
            <TransitionMessage
              transition={transition}
              nextState={nextState}
              stateData={stateData}
              deliveryMethod={
                transaction.attributes?.protectedData?.deliveryMethod || 'none'
              }
              listingTitle={listingTitle}
              ownRole={ownRole}
              otherUsersName={<UserDisplayName user={otherUser} />}
            />
          }
          reviewComponent={
            <ReviewComponentMaybe
              showReviews={stateData.showReviews}
              isRelevantTransition={isCustomerReview || isProviderRieview}
              reviewEntity={reviewEntity}
            />
          }
        />
      )
    }

    return <>{transitionComponent}</>
  }

  const TransitionListItem = transition => {
    return transtionComponent(transition)
  }

  return (
    <View>
      {relevantTransitions.length != 0 ? (
        <>
          {relevantTransitions.map((item, index) => {
            return <TransitionListItem key={index} transition={item} />
          })}
        </>
      ) : (
        <Text>{t('TransitionComponent.noItems')}</Text>
      )}
    </View>
  )
}

export default TransitionComponent

const styles = StyleSheet.create({
  number: {
    fontSize: 20,
    textAlign: 'center',
  },
  rating: {
    flexDirection: 'row',
    gap: 10,
  },
  dotStyle: {
    fontWeight: fontWeight.boldest,
  },
  transitionItemContainer: {
    flexDirection: 'row',
    padding: widthScale(10),
  },
  transitionMessageStyle: {
    fontSize: fontScale(18),
    fontWeight: fontWeight.semiBold,
  },
  dateStyle: {
    fontSize: fontScale(12),
    fontWeight: fontWeight.light,
    color: colors.grey,
  },
  reviewContentStyle: {
    fontSize: fontScale(16),
    paddingVertical: heightScale(5),
  },
})
