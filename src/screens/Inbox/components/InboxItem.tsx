import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import {
  LISTING_UNIT_TYPES,
  STOCK_MULTIPLE_ITEMS,
  fontScale,
  getItemLastUpdatedTime,
  heightScale,
  widthScale,
} from '../../../util';
import { TX_TRANSITION_ACTOR_CUSTOMER } from '../../../transactions';
import { colors, fontWeight } from '../../../theme';
import { Avatar, UserDisplayName } from '../../../components';
import { useTranslation } from 'react-i18next';
import { lightenColor } from '../../../util/data';
import BookingTimeInfoMaybe from './BookingTimeInfoMaybe';
import { useNavigation } from '@react-navigation/native';

// Check if the transaction line-items use booking-related units
const getUnitLineItem = lineItems => {
  const unitLineItem = lineItems?.find(
    item => LISTING_UNIT_TYPES.includes(item.code) && !item.reversal,
  );
  return unitLineItem;
};

const InboxItem = props => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const {
    transactionRole,
    tx,
    stateData,
    stockType = STOCK_MULTIPLE_ITEMS,
    isBooking,
  } = props;

  const { customer, provider, listing, attributes } = tx;
  const { lastTransitionedAt } = attributes ?? {};
  const { title } = listing?.attributes || {};
  const lastUpdatedAt = getItemLastUpdatedTime(lastTransitionedAt);

  const {
    processName,
    processState,
    actionNeeded,
    isSaleNotification,
    isFinal,
  } = stateData;
  const isCustomer = transactionRole === TX_TRANSITION_ACTOR_CUSTOMER;

  const lineItems = tx.attributes?.lineItems;
  const hasPricingData = lineItems.length > 0;
  const unitLineItem = getUnitLineItem(lineItems);
  const quantity =
    hasPricingData && !isBooking ? unitLineItem.quantity.value : null;
  const showStock =
    stockType === STOCK_MULTIPLE_ITEMS ||
    (quantity && unitLineItem.quantity > 1);

  const otherUser = isCustomer ? provider : customer;
  const otherUserDisplayName = <UserDisplayName user={otherUser} />;
  // const isOtherUserBanned = otherUser.attributes.banned;

  const rowNotificationDot = !isSaleNotification ? (
    <View style={styles.notificationDot} />
  ) : null;

  const stateClasses = isFinal
    ? styles.isFinalStyle
    : actionNeeded
    ? styles.actionNeededStyle
    : styles.actionNotNeededStyle;
  const stateClassesText = isFinal
    ? styles.isFinalStyleText
    : actionNeeded
    ? styles.actionNeededStyleText
    : styles.actionNotNeededStyleText;

  const handleItemPress = () => {
    navigation.navigate('Transaction', {
      transactionRole: transactionRole,
      transactionId: tx.id,
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={styles.container}
      onPress={handleItemPress}
    >
      <Avatar user={otherUser} size={widthScale(50)} />
      {rowNotificationDot}
      <View style={styles.contentContainer}>
        <View style={styles.titleAndTime}>
          <View style={styles.titleSection}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.titleStyle}
            >
              {otherUserDisplayName}
            </Text>
          </View>
          <Text style={styles.timeStyle}>{lastUpdatedAt}</Text>
        </View>
        {/* {isBooking ? (
          <BookingTimeInfoMaybe transaction={tx} />
        ) : hasPricingData && showStock ? (
          <Text style={styles.quantity}>
            {t('InboxPage.quantity', { quantity })}
          </Text>
        ) : null} */}
        <View style={styles.descriptionAndStatus}>
          <View style={styles.titleSection}>
            <Text
              style={styles.description}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          </View>

          <View style={[styles.status, stateClasses]}>
            <Text style={[styles.statusText, stateClassesText]}>
              {t(`InboxPage.${processName}.${processState}.status`, {
                transactionRole,
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default InboxItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: widthScale(8),
    marginTop: heightScale(10),
  },
  notificationDot: {
    position: 'absolute',
    left: 0,
    top: 10,
    width: widthScale(10),
    height: widthScale(10),
    borderRadius: widthScale(20),
    backgroundColor: colors.success,
  },
  contentContainer: {
    flex: 1,
    paddingLeft: widthScale(8),
  },
  titleAndTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: widthScale(5),
  },
  titleSection: {
    flexShrink: 1,
    marginRight: widthScale(10),
  },
  descriptionAndStatus: {
    marginTop: widthScale(5),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  description: {
    fontSize: fontScale(12),
    color: colors.darkGrey,
    fontWeight: fontWeight.medium,
  },
  // quantity: {
  // marginTop: widthScale(5),
  // marginHorizontal: widthScale(10),
  // },
  status: {
    backgroundColor: colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: widthScale(5),
    paddingHorizontal: widthScale(10),
    borderRadius: widthScale(20),
  },
  statusText: {
    fontSize: widthScale(12),
    fontWeight: fontWeight.medium,
  },
  titleStyle: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontScale(16),
    color: colors.black,
  },
  timeStyle: {
    color: colors.grey,
    fontSize: fontScale(12),
    fontWeight: fontWeight.normal,
  },
  isFinalStyle: {
    backgroundColor: lightenColor(colors.success, 10),
    borderColor: colors.success,
  },
  actionNeededStyle: {
    backgroundColor: lightenColor(colors.orange, 10),
    borderColor: colors.orange,
  },
  actionNotNeededStyle: {
    backgroundColor: lightenColor(colors.error, 10),
    borderColor: colors.error,
  },
  isFinalStyleText: {
    color: colors.success,
  },
  actionNeededStyleText: {
    color: colors.orange,
  },
  actionNotNeededStyleText: {
    color: colors.error,
  },
});
