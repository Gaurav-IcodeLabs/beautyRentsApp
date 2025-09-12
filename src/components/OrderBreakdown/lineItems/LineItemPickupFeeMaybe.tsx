import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {fontScale, LINE_ITEM_PICKUP_FEE, widthScale} from '../../../util';
import {useTranslation} from 'react-i18next';
import {formatMoney} from '../../../util/currency';
import {colors, fontWeight} from '../../../theme';

const LineItemPickupFeeMaybe = (props: any) => {
  const {t} = useTranslation();
  const {lineItems} = props;

  const pickupFeeLineItem = lineItems.find(
    (item: any) => item.code === LINE_ITEM_PICKUP_FEE && !item.reversal,
  );
  const amount =
    pickupFeeLineItem && pickupFeeLineItem?.lineTotal
      ? formatMoney(pickupFeeLineItem?.lineTotal, 2)
      : null;
  return pickupFeeLineItem ? (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{t('OrderBreakdown.pickupFee')}</Text>
        <Text style={styles.value}>{amount}</Text>
      </View>
      <View style={styles.itemSeperatorStyle} />
    </>
  ) : null;
};

export default LineItemPickupFeeMaybe;

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
