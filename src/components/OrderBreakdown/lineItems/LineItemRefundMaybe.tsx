import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { formatMoney } from '../../../util/currency';
import {
  fontScale,
  LINE_ITEM_CUSTOMER_COMMISSION,
  LINE_ITEM_PROVIDER_COMMISSION,
  types as sdkTypes,
  widthScale,
} from '../../../util';
import Decimal from 'decimal.js';
import { useTranslation } from 'react-i18next';
import { colors, fontWeight } from '../../../theme';

const { Money } = sdkTypes;
/**
 * Calculates the total price in sub units for multiple line items.
 */
const lineItemsTotal = (lineItems, marketplaceCurrency) => {
  const amount = lineItems.reduce((total, item) => {
    return total.plus(item.lineTotal.amount);
  }, new Decimal(0));
  const currency = lineItems[0]
    ? lineItems[0].lineTotal.currency
    : marketplaceCurrency;
  return new Money(amount, currency);
};

/**
 * Checks if line item represents commission
 */
const isCommission = lineItem => {
  return (
    lineItem.code === LINE_ITEM_PROVIDER_COMMISSION ||
    lineItem.code === LINE_ITEM_CUSTOMER_COMMISSION
  );
};

/**
 * Returns non-commission, reversal line items
 */
const nonCommissionReversalLineItems = lineItems => {
  return lineItems.filter(item => !isCommission(item) && item.reversal);
};

const LineItemRefundMaybe = props => {
  const { t } = useTranslation();
  const { lineItems, marketplaceCurrency } = props;

  // all non-commission, reversal line items
  const refundLineItems = nonCommissionReversalLineItems(lineItems);

  const refund = lineItemsTotal(refundLineItems, marketplaceCurrency);

  const formattedRefund =
    refundLineItems.length > 0 ? formatMoney(refund, 2) : null;
  return formattedRefund ? (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{t('OrderBreakdown.refund')}</Text>
        <Text style={styles.value}>{formattedRefund}</Text>
      </View>
      <View style={styles.itemSeperatorStyle} />
    </>
  ) : null;
};

export default LineItemRefundMaybe;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemSeperatorStyle: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.grey,
    marginVertical: widthScale(6),
  },
  label: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    color: colors.black,
  },
  value: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    color: colors.black,
  },
});
