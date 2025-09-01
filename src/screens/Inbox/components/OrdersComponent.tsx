import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import {
  fetchOrderInProgressSelector,
  fetchOrdersErrorSelector,
  loadOrderTransactions,
  ordersLoadingMoreSelector,
  ordersPaginationSelector,
  transactionOrderRefsSelector,
} from '../Inbox.slice';
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup';
import OrderOrSaleTransactions from './OrderOrSaleTransactions';
import {
  entitiesSelector,
  getMarketplaceEntities,
} from '../../../slices/marketplaceData.slice';

const OrdersComponent = () => {
  const dispatch = useAppDispatch();
  const transactionOrderRefs = useTypedSelector(transactionOrderRefsSelector);
  const fetchOrderInProgress = useTypedSelector(fetchOrderInProgressSelector);
  const fetchOrdersError = useTypedSelector(fetchOrdersErrorSelector);
  const loadingMore = useTypedSelector(ordersLoadingMoreSelector);
  const pagination = useTypedSelector(ordersPaginationSelector);
  const entities = useTypedSelector(entitiesSelector);
  const transactions = getMarketplaceEntities(entities, transactionOrderRefs);

  const loadData = React.useCallback(async () => {
    try {
      await dispatch(loadOrderTransactions({ page: 1 }));
    } finally {
    }
  }, [dispatch]);

  const loadMoreData = React.useCallback(async () => {
    if (!loadingMore && !fetchOrderInProgress) {
      if (!transactions.length) return;
      if (pagination?.page === pagination?.totalPages) return;
      await dispatch(loadOrderTransactions({ page: pagination?.page + 1 }));
    }
  }, [
    dispatch,
    loadingMore,
    fetchOrderInProgress,
    pagination,
    transactions.length,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      />
    </View>
  );
};

export default OrdersComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
