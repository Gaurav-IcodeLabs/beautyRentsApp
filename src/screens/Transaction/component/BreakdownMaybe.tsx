import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {fontScale, widthScale} from '../../../util';
import {colors, fontWeight} from '../../../theme';

const BreakdownMaybe = (props: any) => {
  const {t} = useTranslation();
  const {orderBreakdown, processName} = props;
  return orderBreakdown ? (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {t(`TransactionPanel.${processName}.orderBreakdownTitle`)}
      </Text>
      <View style={styles.itemSeperatorStyle} />
      {orderBreakdown}
    </View>
  ) : null;
};

export default BreakdownMaybe;

const styles = StyleSheet.create({
  itemSeperatorStyle: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.grey,
    marginVertical: widthScale(6),
  },
  container: {
    // padding: widthScale(20),
  },
  heading: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.medium,
    color: colors.black,
  },
});
