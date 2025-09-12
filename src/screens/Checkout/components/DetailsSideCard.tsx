import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {colors, fontWeight} from '../../../theme';
import {fontScale} from '../../../util';
// import { useTypedSelector } from '../../../sharetribeSetup'
// import { speculateTransactionErrorSelector } from '../Checkout.slice'

const DetailsSideCard = (props: any) => {
  const {t} = useTranslation();
  const {processName, breakdown} = props;
  // const speculateTransactionError = useTypedSelector(
  //   speculateTransactionErrorSelector,
  // )

  return (
    <View style={{}}>
      {/* <Text>{speculateTransactionError}</Text> */}
      {breakdown ? (
        <Text style={styles.text}>
          {t(`CheckoutPage.${processName}.orderBreakdown`)}
        </Text>
      ) : null}
      {breakdown}
    </View>
  );
};

export default DetailsSideCard;

const styles = StyleSheet.create({
  text: {
    color: colors.black,
    fontSize: fontScale(16),
    fontWeight: fontWeight.medium,
  },
});
