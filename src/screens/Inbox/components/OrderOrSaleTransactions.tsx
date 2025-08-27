import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from 'react-native'
import React, { useState } from 'react'
import { useConfiguration } from '../../../context'
import { useTranslation } from 'react-i18next'
import {
  TX_TRANSITION_ACTOR_CUSTOMER,
  TX_TRANSITION_ACTOR_PROVIDER,
  isBookingProcess,
  resolveLatestProcessName,
} from '../../../transactions'
import { getStateData } from '../Inbox.stateData'
import InboxItem from './InboxItem'
import { colors } from '../../../theme'
import { fontScale, widthScale } from '../../../util'

const OrderOrSaleTransactions = props => {
  const config = useConfiguration()
  const { t } = useTranslation()
  const {
    transactions,
    fetchInProgress,
    fetchOrdersOrSalesError,
    isOrders,
    loadData,
    loadingMore,
    loadMoreData,
    refreshing,
    setRefreshing,
  } = props

  const hasNoResults =
    !fetchInProgress && transactions.length === 0 && !fetchOrdersOrSalesError

  const pickType = lt => conf => conf.listingType === lt
  const findListingTypeConfig = publicData => {
    const listingTypeConfigs = config.listing?.listingTypes
    const { listingType } = publicData || {}
    const foundConfig = listingTypeConfigs?.find(pickType(listingType))
    return foundConfig
  }

  const toTxItem = tx => {
    const transactionRole = isOrders
      ? TX_TRANSITION_ACTOR_CUSTOMER
      : TX_TRANSITION_ACTOR_PROVIDER
    let stateData = null
    try {
      stateData = getStateData({ transaction: tx, transactionRole })
    } catch (error) {
      // If stateData is missing, omit the transaction from InboxItem list.
    }

    const publicData = tx?.listing?.attributes?.publicData || {}
    const foundListingTypeConfig = findListingTypeConfig(publicData)
    const { transactionType, stockType } = foundListingTypeConfig || {}
    const process =
      tx?.attributes?.processName || transactionType?.transactionType
    const transactionProcess = resolveLatestProcessName(process)
    const isBooking = isBookingProcess(transactionProcess)

    return stateData ? (
      <InboxItem
        transactionRole={transactionRole}
        tx={tx}
        stateData={stateData}
        stockType={stockType}
        isBooking={isBooking}
      />
    ) : null
  }
  return (
    <View style={styles.container}>
      {fetchOrdersOrSalesError ? (
        <Text>{t('InboxPage.fetchFailed')}</Text>
      ) : null}

      {fetchInProgress && !refreshing ? (
        <ActivityIndicator size={'small'} />
      ) : null}

      {transactions.length > 0 ? (
        <FlatList
          data={transactions}
          renderItem={({ item }) => toTxItem(item)}
          keyExtractor={item => item.id.uuid.toString()}
          refreshing={refreshing}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true)
                loadData()
              }}
            />
          }
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="small" /> : null
          }
          ItemSeparatorComponent={() => (
            <View style={styles.itemSeperatorStyle} />
          )}
        />
      ) : null}
      {hasNoResults ? (
        <View style={styles.noTransactionsStyle}>
          <Text style={styles.noItemDescription}>
            {t(isOrders ? 'InboxPage.noOrdersFound' : 'InboxPage.noSalesFound')}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

export default OrderOrSaleTransactions

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemSeperatorStyle: {
    marginStart: widthScale(95),
    marginEnd: widthScale(20),
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.grey,
  },
  noTransactionsStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  noItemTitle: {
    color: colors.black,
    fontSize: fontScale(24),
    paddingVertical: widthScale(5),
  },
  noItemDescription: {
    color: colors.black,
    fontSize: fontScale(14),
  },
})
