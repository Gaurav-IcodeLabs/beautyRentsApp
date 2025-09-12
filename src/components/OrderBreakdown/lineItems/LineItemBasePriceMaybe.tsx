import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {
  fontScale,
  LINE_ITEM_DAY,
  LINE_ITEM_HOUR,
  LINE_ITEM_NIGHT,
  widthScale,
} from '../../../util';
import {formatMoney} from '../../../util/currency';
import {colors, fontWeight} from '../../../theme';

const LineItemBasePriceMaybe = (props: any) => {
  const {lineItems, code} = props;
  const unitPurchase = lineItems.find(
    (item: any) => item.code === code && !item.reversal,
  );
  const quantity = unitPurchase
    ? typeof unitPurchase.quantity === 'object' && unitPurchase.quantity.value
      ? unitPurchase.quantity.value.toString()
      : unitPurchase.quantity.toString()
    : null;
  const unitPrice = unitPurchase
    ? formatMoney(unitPurchase.unitPrice, 2)
    : null;
  const total = unitPurchase ? formatMoney(unitPurchase.lineTotal, 2) : null;
  let unitLabel = '';
  if (code === LINE_ITEM_HOUR) {
    unitLabel = quantity === '1' ? 'hour' : 'hours';
  } else if (code === LINE_ITEM_DAY) {
    unitLabel = quantity === '1' ? 'day' : 'days';
  } else if (code === LINE_ITEM_NIGHT) {
    unitLabel = quantity === '1' ? 'night' : 'nights';
  }

  return quantity && total ? (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>
          {`${unitPrice} x ${quantity} ${unitLabel}`}
        </Text>
        <Text style={styles.value}>{total}</Text>
      </View>
      <View style={styles.itemSeperatorStyle} />
    </>
  ) : null;
};

export default LineItemBasePriceMaybe;

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
