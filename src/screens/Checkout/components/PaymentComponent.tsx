import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useTypedSelector } from '../../../sharetribeSetup'
import { stripeCustomerSelector } from '../../../slices/user.slice'
import {
  ensurePaymentMethodCard,
  ensureStripeCustomer,
  lightenColor,
} from '../../../util/data'
import SavedCardDetails from '../../../components/SavedCardDetails/SavedCardDetails'
import { useNavigation } from '@react-navigation/native'
import { heightScale, widthScale } from '../../../util'
import { useTranslation } from 'react-i18next'
import { useColors } from '../../../context'

const PaymentComponent = () => {
  const { t } = useTranslation()
  const color = useColors();
  const navigation = useNavigation()
  const stripeCustomer = useTypedSelector(stripeCustomerSelector)

  const stripeCustomerDefaultPaymentMethodId = ensurePaymentMethodCard(
    stripeCustomer?.defaultPaymentMethod,
  ).id
  const stripeCustomerDefaultPaymentMethodCard = ensurePaymentMethodCard(
    stripeCustomer?.defaultPaymentMethod,
  ).attributes.card

  const hasDefaultPaymentMethod =
    ensureStripeCustomer(stripeCustomer).attributes.stripeCustomerId &&
    stripeCustomerDefaultPaymentMethodId

  const card = hasDefaultPaymentMethod
    ? stripeCustomerDefaultPaymentMethodCard
    : null

  return (
    <View>
      {hasDefaultPaymentMethod ? (
        <SavedCardDetails card={card} />
      ) : (
        <TouchableOpacity
          // style={styles.addCardContainer}
          style={[styles.addCardContainer,{backgroundColor:lightenColor(color.marketplaceColor,0.5)}]}
          onPress={() => navigation.navigate('PaymentMethods')}>
          <Text>{t('Checkout.addCard')}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default PaymentComponent

const styles = StyleSheet.create({
  addCardContainer: {
    padding: widthScale(20),
    marginTop:heightScale(10),
    borderRadius:widthScale(10),
    alignItems: 'center',
  },
})
