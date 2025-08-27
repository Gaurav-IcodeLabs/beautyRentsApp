import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup'
import {
  fetchSalesErrorSelector,
  fetchSalesInProgressSelector,
  loadSalesTransactions,
  salesLoadingMoreSelector,
  salesPaginationSelector,
  transactionSaleRefsSelector,
} from '../Inbox.slice'
import {
  entitiesSelector,
  getMarketplaceEntities,
} from '../../../slices/marketplaceData.slice'
import OrderOrSaleTransactions from './OrderOrSaleTransactions'

const SalesComponent = () => {
  const dispatch = useAppDispatch()
  const transactionSalesRefs = useTypedSelector(transactionSaleRefsSelector)
  const fetchSalesInProgress = useTypedSelector(fetchSalesInProgressSelector)
  const fetchSalesError = useTypedSelector(fetchSalesErrorSelector)
  const loadingMore = useTypedSelector(salesLoadingMoreSelector)
  const pagination = useTypedSelector(salesPaginationSelector)
  const entities = useTypedSelector(entitiesSelector)
  const transactions = getMarketplaceEntities(entities, transactionSalesRefs)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      await dispatch(loadSalesTransactions({ page: 1 }))
    } finally {
      setRefreshing(false)
    }
  }

  const loadMoreData = async () => {
    if (!loadingMore && !fetchSalesInProgress) {
      if (pagination?.page === pagination?.totalPages) return
      await dispatch(loadSalesTransactions({ page: pagination?.page + 1 }))
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  return (
    <View style={styles.container}>
      <OrderOrSaleTransactions
        transactions={transactions}
        fetchInProgress={fetchSalesInProgress}
        fetchOrdersOrSalesError={fetchSalesError}
        isOrders={false}
        loadData={() => loadData()}
        loadMoreData={() => loadMoreData()}
        loadingMore={loadingMore}
        refreshing={refreshing}
        setRefreshing={setRefreshing}
        // providerNotificationCount
        //pagination
      />
    </View>
  )
}

export default SalesComponent

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
