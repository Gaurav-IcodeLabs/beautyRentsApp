import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import {
  fetchOrderInProgressSelector,
  fetchOrdersErrorSelector,
  loadOrderTransactions,
  ordersLoadingMoreSelector,
  ordersPaginationSelector,
  transactionOrderRefsSelector,
} from '../Inbox.slice'
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup'
import OrderOrSaleTransactions from './OrderOrSaleTransactions'
import {
  entitiesSelector,
  getMarketplaceEntities,
} from '../../../slices/marketplaceData.slice'
import { useSelector } from 'react-redux'

const OrdersComponent = () => {
  const dispatch = useAppDispatch()
  const transactionOrderRefs = useTypedSelector(transactionOrderRefsSelector)
  const fetchOrderInProgress = useTypedSelector(fetchOrderInProgressSelector)
  const fetchOrdersError = useTypedSelector(fetchOrdersErrorSelector)
  const loadingMore = useTypedSelector(ordersLoadingMoreSelector)
  const pagination = useTypedSelector(ordersPaginationSelector)
  const entities = useTypedSelector(entitiesSelector)
  const transactions = getMarketplaceEntities(entities, transactionOrderRefs)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      await dispatch(loadOrderTransactions({ page: 1 }))
    } finally {
      setRefreshing(false)
    }
  }

  const loadMoreData = async () => {
    if (!loadingMore && !fetchOrderInProgress) {
      if (pagination?.page === pagination?.totalPages) return

      await dispatch(loadOrderTransactions({ page: pagination?.page + 1 }))
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <View style={styles.container}>
      <OrderOrSaleTransactions
        transactions={transactions}
        fetchInProgress={fetchOrderInProgress}
        fetchOrdersOrSalesError={fetchOrdersError}
        isOrders={true}
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

export default OrdersComponent

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
