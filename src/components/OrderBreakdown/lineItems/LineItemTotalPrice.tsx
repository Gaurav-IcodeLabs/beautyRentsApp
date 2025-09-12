import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {getProcess, resolveLatestProcessName} from '../../../transactions';
import {useTranslation} from 'react-i18next';
import {formatMoney} from '../../../util/currency';
import {colors, fontWeight} from '../../../theme';
import {fontScale, widthScale} from '../../../util';

const LineItemTotalPrice = (props: any) => {
  const {t} = useTranslation();
  const {transaction, isProvider} = props;
  const processName = resolveLatestProcessName(
    transaction?.attributes?.processName,
  );
  if (!processName) {
    return null;
  }
  const process = getProcess(processName);
  const isCompleted = process.isCompleted(
    transaction?.attributes?.lastTransition,
  );
  const isRefunded = process.isRefunded(
    transaction?.attributes?.lastTransition,
  );

  let providerTotalMessageId = 'OrderBreakdown.providerTotalDefault';
  if (isCompleted) {
    providerTotalMessageId = 'OrderBreakdown.providerTotalReceived';
  } else if (isRefunded) {
    providerTotalMessageId = 'OrderBreakdown.providerTotalRefunded';
  }

  const totalLabel = isProvider
    ? t(providerTotalMessageId)
    : t('OrderBreakdown.total');

  const totalPrice = isProvider
    ? transaction.attributes.payoutTotal
    : transaction.attributes.payinTotal;
  const formattedTotalPrice = totalPrice ? formatMoney(totalPrice, 2) : null;
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{totalLabel}</Text>
        <Text style={styles.value}>{formattedTotalPrice}</Text>
      </View>
      <View style={styles.itemSeperatorStyle} />
    </>
  );
};

export default LineItemTotalPrice;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: fontScale(14),
    color: colors.black,
    fontWeight: fontWeight.normal,
  },
  value: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    color: colors.black,
  },
  itemSeperatorStyle: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.grey,
    marginVertical: widthScale(6),
  },
});
