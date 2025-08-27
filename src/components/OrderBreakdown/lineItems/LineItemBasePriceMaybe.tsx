import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {
  LINE_ITEM_DAY,
  LINE_ITEM_HOUR,
  LINE_ITEM_NIGHT,
  widthScale,
} from '../../../util'
import { formatMoney } from '../../../util/currency'
import { useTranslation } from 'react-i18next'
import { colors } from '../../../theme'

const LineItemBasePriceMaybe = props => {
  const { t } = useTranslation()
  const { lineItems, code } = props
  const isNightly = code === LINE_ITEM_NIGHT
  const isDaily = code === LINE_ITEM_DAY
  const isHourly = code === LINE_ITEM_HOUR
  const translationKey = isNightly
    ? 'OrderBreakdown.baseUnitNight'
    : isDaily
      ? 'OrderBreakdown.baseUnitDay'
      : isHourly
        ? 'OrderBreakdown.baseUnitHour'
        : 'OrderBreakdown.baseUnitQuantity'

  // Find correct line-item for given code prop.
  // It should be one of the following: 'line-item/night, 'line-item/day', 'line-item/hour', or 'line-item/item'
  // These are defined in '../../util/types';
  const unitPurchase = lineItems.find(
    item => item.code === code && !item.reversal,
  )

  const quantity = unitPurchase ? unitPurchase.quantity.toString() : null
  const unitPrice = unitPurchase ? formatMoney(unitPurchase.unitPrice) : null
  const total = unitPurchase ? formatMoney(unitPurchase.lineTotal) : null
  return quantity && total ? (
    <>
      <View style={styles.container}>
        <Text style={styles.item}>{t(translationKey, { unitPrice, quantity })}</Text>
        <Text>{total}</Text>
      </View>
      <View style={styles.itemSeperatorStyle} />
    </>
  ) : null
}

export default LineItemBasePriceMaybe

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
  item:{maxWidth:'80%'}
})
