import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {
  fontScale,
  LINE_ITEM_PROVIDER_COMMISSION,
  widthScale,
} from '../../../util';
import {formatMoney} from '../../../util/currency';
import {useTranslation} from 'react-i18next';
import {colors, fontWeight} from '../../../theme';

const LineItemProviderCommissionRefundMaybe = (props: any) => {
  const {t} = useTranslation();
  const {lineItems, isProvider, marketplaceName} = props;

  const refund = lineItems.find(
    (item: any) => item.code === LINE_ITEM_PROVIDER_COMMISSION && item.reversal,
  );
  const refundAmount =
    refund && refund?.lineTotal ? formatMoney(refund.lineTotal, 2) : null;

  return isProvider && refund ? (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>
          {t('OrderBreakdown.refundProviderFee', {marketplaceName})}
        </Text>
        <Text style={styles.value}>{refundAmount}</Text>
      </View>
      <View style={styles.itemSeperatorStyle} />
    </>
  ) : null;
};

export default LineItemProviderCommissionRefundMaybe;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
