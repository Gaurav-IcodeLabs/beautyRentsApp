import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import {
  LISTING_UNIT_TYPES,
  STOCK_MULTIPLE_ITEMS,
  fontScale,
  getItemLastUpdatedTime,
  heightScale,
  screenWidth,
  widthScale,
} from '../../../util'
import { TX_TRANSITION_ACTOR_CUSTOMER } from '../../../transactions'
import { colors } from '../../../theme'
import { Avatar, UserDisplayName } from '../../../components'
import { useTranslation } from 'react-i18next'
import { lightenColor } from '../../../util/data'
import BookingTimeInfoMaybe from './BookingTimeInfoMaybe'
import { useNavigation } from '@react-navigation/native'

// Check if the transaction line-items use booking-related units
const getUnitLineItem = lineItems => {
  const unitLineItem = lineItems?.find(
    item => LISTING_UNIT_TYPES.includes(item.code) && !item.reversal,
  )
  return unitLineItem
}

const InboxItem = props => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const {
    transactionRole,
    tx,
    stateData,
    stockType = STOCK_MULTIPLE_ITEMS,
    isBooking,
  } = props

  const { customer, provider, listing, attributes } = tx
  const { lastTransitionedAt } = attributes ?? {}
  const {title, description} = listing?.attributes || {}
  const lastUpdatedAt = getItemLastUpdatedTime(lastTransitionedAt)

  const {
    processName,
    processState,
    actionNeeded,
    isSaleNotification,
    isFinal,
  } = stateData
  const isCustomer = transactionRole === TX_TRANSITION_ACTOR_CUSTOMER

  const lineItems = tx.attributes?.lineItems
  const hasPricingData = lineItems.length > 0
  const unitLineItem = getUnitLineItem(lineItems)
  const quantity =
    hasPricingData && !isBooking ? unitLineItem.quantity.value : null
  const showStock =
    stockType === STOCK_MULTIPLE_ITEMS ||
    (quantity && unitLineItem.quantity > 1)


  const otherUser = isCustomer ? provider : customer
  const otherUserDisplayName = <UserDisplayName user={otherUser} />
  const isOtherUserBanned = otherUser.attributes.banned

  const rowNotificationDot = !isSaleNotification ? (
    <View style={styles.notificationDot} />
  ) : null

  const stateClasses = isFinal
    ? styles.isFinalStyle
    : actionNeeded
      ? styles.actionNeededStyle
      : styles.actionNotNeededStyle

  const handleItemPress = () => {
    navigation.navigate('Transaction', {
      transactionRole: transactionRole,
      transactionId: tx.id,
    })
  }
  return (
    <TouchableOpacity style={styles.container} onPress={handleItemPress}>
      <Avatar user={otherUser} size={widthScale(60)} />

      {/* will use below comment code as per requirement */}
      {rowNotificationDot}
      {/* {otherUserDisplayName} */}
      <View style={styles.contentContainer}>
        <View style={styles.titleAndTime}>
          <View style={styles.titleSection}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.titleStyle}>
              {title}
            </Text>
          </View>
          <Text style={styles.timeStyle}>{lastUpdatedAt}</Text>
        </View>
        {isBooking ? (
          <BookingTimeInfoMaybe transaction={tx} />
        ) : hasPricingData && showStock ? (
          <Text style={styles.quantity}>{t('InboxPage.quantity', { quantity })}</Text>
        ) : null}
        <View style={styles.descriptionAndStatus}>
          <Text
            style={styles.description}
            numberOfLines={2}
            ellipsizeMode="tail">
            {description}
          </Text>

          <Text style={[styles.status, stateClasses]}>
            {t(`InboxPage.${processName}.${processState}.status`, {
              transactionRole,
            })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default InboxItem

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: widthScale(20),
    paddingVertical: widthScale(5),
    marginTop: heightScale(10),
  },
  notificationDot: {
    position: 'absolute',
    left: widthScale(68),
    top:heightScale(10),
    width: widthScale(12),
    height: widthScale(12),
    borderRadius: widthScale(20),
    backgroundColor: colors.success,
  },
  contentContainer: {
    width:'85%',
  },
  titleAndTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: widthScale(5),
  },
  titleSection: {
    flexShrink: 1,
    marginRight: widthScale(20),
  },
  descriptionAndStatus: {
    marginTop: widthScale(5),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    width: '65%',
    paddingHorizontal: widthScale(10),
  },
  quantity: {
    marginTop: widthScale(5),
    marginHorizontal: widthScale(10),
  },
  status: {
    width: '35%',
    backgroundColor: colors.lightGrey,
    borderColor: colors.lightGrey,
    textAlign: 'center',
    borderWidth: widthScale(1),
    fontWeight: 'bold',
    paddingVertical:heightScale(2),
    overflow:'hidden',
    borderRadius:widthScale(8),
    fontSize: fontScale(12),
  },
  titleStyle: {
    fontWeight: 'bold',
    paddingHorizontal: widthScale(10),
    fontSize: fontScale(16),
  },
  timeStyle: {
    color: colors.grey,
    fontSize: fontScale(12),
  },
  isFinalStyle: {
    backgroundColor: lightenColor(colors.success, 10),
    borderColor: lightenColor(colors.success, 10),
    color: colors.success,
  },
  actionNeededStyle: {
    backgroundColor: lightenColor(colors.orange, 10),
    borderColor: lightenColor(colors.orange, 10),
    color: colors.orange,
  },
  actionNotNeededStyle: {
    backgroundColor: lightenColor(colors.red, 10),
    borderColor: lightenColor(colors.red, 10),
    color: colors.error,
    
  },
})
