import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { fontScale, LINE_ITEM_SHIPPING_FEE, widthScale } from '../../../util';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '../../../util/currency';
import { colors, fontWeight } from '../../../theme';

const LineItemShippingFeeMaybe = props => {
  const { t } = useTranslation();

  const { lineItems } = props;

  const shippingFeeLineItem = lineItems.find(
    item => item.code === LINE_ITEM_SHIPPING_FEE && !item.reversal,
  );

  return shippingFeeLineItem ? (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{t('OrderBreakdown.shippingFee')}</Text>
        <Text style={styles.value}>
          {formatMoney(shippingFeeLineItem?.lineTotal, 2)}
        </Text>
      </View>
      <View style={styles.itemSeperatorStyle} />
    </>
  ) : null;
};

export default LineItemShippingFeeMaybe;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    flexDirection: 'row',
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
