import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from 'react-native';
import React from 'react';
import { useConfiguration } from '../../../context';
import { useTranslation } from 'react-i18next';
import {
  TX_TRANSITION_ACTOR_CUSTOMER,
  TX_TRANSITION_ACTOR_PROVIDER,
  isBookingProcess,
  resolveLatestProcessName,
} from '../../../transactions';
import { getStateData } from '../Inbox.stateData';
import InboxItem from './InboxItem';
import { colors } from '../../../theme';
import { fontScale, widthScale } from '../../../util';

const OrderOrSaleTransactions = props => {
  const config = useConfiguration();
  const { t } = useTranslation();
  const {
    transactions,
    fetchInProgress,
    fetchOrdersOrSalesError,
    isOrders,
    loadData,
    loadingMore,
    loadMoreData,
  } = props;

  const hasNoResults =
    !fetchInProgress && transactions.length === 0 && !fetchOrdersOrSalesError;
  const pickType = lt => conf => conf.listingType === lt;
  const findListingTypeConfig = publicData => {
    const listingTypeConfigs = config.listing?.listingTypes;
    const { listingType } = publicData || {};
    const foundConfig = listingTypeConfigs?.find(pickType(listingType));
    return foundConfig;
  };

  const toTxItem = tx => {
    const transactionRole = isOrders
      ? TX_TRANSITION_ACTOR_CUSTOMER
      : TX_TRANSITION_ACTOR_PROVIDER;
    let stateData = null;
    try {
      stateData = getStateData({ transaction: tx, transactionRole });
    } catch (error) {
      // If stateData is missing, omit the transaction from InboxItem list.
    }

    const publicData = tx?.listing?.attributes?.publicData || {};
    const foundListingTypeConfig = findListingTypeConfig(publicData);
    const { transactionType, stockType } = foundListingTypeConfig || {};
    const process =
      tx?.attributes?.processName || transactionType?.transactionType;
    const transactionProcess = resolveLatestProcessName(process);
    const isBooking = isBookingProcess(transactionProcess);

    return stateData ? (
      <InboxItem
        transactionRole={transactionRole}
        tx={tx}
        stateData={stateData}
        stockType={stockType}
        isBooking={isBooking}
      />
    ) : null;
  };

  const seperator = () => <View style={styles.itemSeperatorStyle} />;

  const listEmptyComponent = () =>
    hasNoResults ? (
      <View style={styles.noTransactionsStyle}>
        <Text style={styles.noItemDescription}>
          {t(isOrders ? 'InboxPage.noOrdersFound' : 'InboxPage.noSalesFound')}
        </Text>
      </View>
    ) : fetchInProgress ? (
      <ActivityIndicator size={'large'} />
    ) : null;

  return (
    <View style={styles.container}>
      {fetchOrdersOrSalesError ? (
        <Text>{t('InboxPage.fetchFailed')}</Text>
      ) : null}

      <FlatList
        data={transactions}
        renderItem={({ item }) => toTxItem(item)}
        keyExtractor={item => item.id.uuid.toString()}
        showsVerticalScrollIndicator={false}
        refreshing={fetchInProgress}
        refreshControl={
          <RefreshControl
            refreshing={fetchInProgress}
            onRefresh={() => {
              if (!fetchInProgress) loadData();
            }}
          />
        }
        ListEmptyComponent={listEmptyComponent}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          !fetchInProgress && loadingMore ? (
            <ActivityIndicator size="large" />
          ) : null
        }
        ItemSeparatorComponent={seperator}
        contentContainerStyle={{ paddingBottom: widthScale(100) }}
      />
    </View>
  );
};

export default OrderOrSaleTransactions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.frostedGrey,
  },
  itemSeperatorStyle: {
    // marginStart: widthScale(95),
    // marginEnd: widthScale(20),
    // height: StyleSheet.hairlineWidth,
    height: 1,
    backgroundColor: colors.lightGrey,
    marginVertical: widthScale(10),
  },
  noTransactionsStyle: {
    flex: 1,
    paddingTop: widthScale(120),
    // justifyContent: 'center',
    alignItems: 'center',
  },
  noItemDescription: {
    color: colors.black,
    fontSize: fontScale(14),
  },
});
