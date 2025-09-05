import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { fontScale, LINE_ITEMS, widthScale } from '../../../util';
import { formatMoney } from '../../../util/currency';
import { humanizeLineItemCode } from '../../../util/data';
import { colors, fontWeight } from '../../../theme';

const LineItemUnknownItemsMaybe = props => {
  const { lineItems, isProvider } = props;

  // resolve unknown non-reversal line items
  const allItems = lineItems.filter(
    item => LINE_ITEMS.indexOf(item.code) === -1 && !item.reversal,
  );

  const items = isProvider
    ? allItems.filter(item => item.includeFor.includes('provider'))
    : allItems.filter(item => item.includeFor.includes('customer'));
  return items.length > 0 ? (
    <>
      <View>
        {items?.map((item, i) => {
          const quantity = item.quantity;

          const label =
            quantity && quantity > 1
              ? `${humanizeLineItemCode(item.code)} x ${quantity}`
              : humanizeLineItemCode(item.code);

          const formattedTotal = formatMoney(item.lineTotal, 2);
          return (
            <View key={i} style={styles.invoiceTexts}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{formattedTotal}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.itemSeperatorStyle} />
    </>
  ) : null;
};

export default LineItemUnknownItemsMaybe;

const styles = StyleSheet.create({
  invoiceTexts: {
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
