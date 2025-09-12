import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {
  fontScale,
  LINE_ITEM_CUSTOMER_COMMISSION,
  LINE_ITEM_PROVIDER_COMMISSION,
  LISTING_UNIT_TYPES,
  widthScale,
} from '../../util';
import LineItemBookingPeriod from './lineItems/LineItemBookingPeriod';
import LineItemBasePriceMaybe from './lineItems/LineItemBasePriceMaybe';
import LineItemShippingFeeMaybe from './lineItems/LineItemShippingFeeMaybe';
import LineItemPickupFeeMaybe from './lineItems/LineItemPickupFeeMaybe';
import LineItemUnknownItemsMaybe from './lineItems/LineItemUnknownItemsMaybe';
import LineItemSubTotalMaybe from './lineItems/LineItemSubTotalMaybe';
import LineItemRefundMaybe from './lineItems/LineItemRefundMaybe';
import LineItemCustomerCommissionMaybe from './lineItems/LineItemCustomerCommissionMaybe';
import LineItemCustomerCommissionRefundMaybe from './lineItems/LineItemCustomerCommissionRefundMaybe';
import LineItemProviderCommissionMaybe from './lineItems/LineItemProviderCommissionMaybe';
import LineItemProviderCommissionRefundMaybe from './lineItems/LineItemProviderCommissionRefundMaybe';
import LineItemTotalPrice from './lineItems/LineItemTotalPrice';
import {useTranslation} from 'react-i18next';
import {colors, fontWeight} from '../../theme';

const OrderBreakdown = (props: any) => {
  const {t} = useTranslation();
  const {
    userRole,
    transaction,
    booking,
    dateType,
    timeZone,
    currency,
    marketplaceName,
  } = props;

  const isCustomer = userRole === 'customer';
  const isProvider = userRole === 'provider';
  const allLineItems = transaction?.attributes?.lineItems || [];
  // We'll show only line-items that are specific for the current userRole (customer vs provider)
  const lineItems = allLineItems?.filter((lineItem: any) =>
    lineItem?.includeFor.includes(userRole),
  );
  const unitLineItem = lineItems.find(
    (item: any) => LISTING_UNIT_TYPES.includes(item.code) && !item.reversal,
  );
  // Line-item code that matches with base unit: day, night, hour, item
  const lineItemUnitType = unitLineItem?.code;

  const hasCommissionLineItem = lineItems?.find((item: any) => {
    const hasCustomerCommission =
      isCustomer && item.code === LINE_ITEM_CUSTOMER_COMMISSION;
    const hasProviderCommission =
      isProvider && item.code === LINE_ITEM_PROVIDER_COMMISSION;
    return (hasCustomerCommission || hasProviderCommission) && !item.reversal;
  });
  /**
   * OrderBreakdown contains different line items:
   *
   * LineItemBookingPeriod: prints booking start and booking end types. Prop dateType
   * determines if the date and time or only the date is shown
   *
   * LineItemShippingFeeMaybe: prints the shipping fee (combining additional fee of
   * additional items into it).
   *
   * LineItemShippingFeeRefundMaybe: prints the amount of refunded shipping fee
   *
   * LineItemBasePriceMaybe: prints the base price calculation for the listing, e.g.
   * "$150.00 * 2 nights $300"
   *
   * LineItemUnknownItemsMaybe: prints the line items that are unknown. In ideal case there
   * should not be unknown line items. If you are using custom pricing, you should create
   * new custom line items if you need them.
   *
   * LineItemSubTotalMaybe: prints subtotal of line items before possible
   * commission or refunds
   *
   * LineItemRefundMaybe: prints the amount of refund
   *
   * LineItemCustomerCommissionMaybe: prints the amount of customer commission
   * The default transaction process used by this template doesn't include the customer commission.
   *
   * LineItemCustomerCommissionRefundMaybe: prints the amount of refunded customer commission
   *
   * LineItemProviderCommissionMaybe: prints the amount of provider commission
   *
   * LineItemProviderCommissionRefundMaybe: prints the amount of refunded provider commission
   *
   * LineItemTotalPrice: prints total price of the transaction
   *
   */
  return (
    <View style={styles.container}>
      <LineItemBookingPeriod
        booking={booking}
        code={lineItemUnitType}
        dateType={dateType}
        timeZone={timeZone}
      />

      <LineItemBasePriceMaybe lineItems={lineItems} code={lineItemUnitType} />
      <LineItemShippingFeeMaybe lineItems={lineItems} />
      <LineItemPickupFeeMaybe lineItems={lineItems} />
      <LineItemUnknownItemsMaybe
        lineItems={lineItems}
        isProvider={isProvider}
      />

      <LineItemSubTotalMaybe
        lineItems={lineItems}
        code={lineItemUnitType}
        userRole={userRole}
        marketplaceCurrency={currency}
      />
      <LineItemRefundMaybe
        lineItems={lineItems}
        marketplaceCurrency={currency}
      />

      <LineItemCustomerCommissionMaybe
        lineItems={lineItems}
        isCustomer={isCustomer}
        marketplaceName={marketplaceName}
      />
      <LineItemCustomerCommissionRefundMaybe
        lineItems={lineItems}
        isCustomer={isCustomer}
        marketplaceName={marketplaceName}
      />

      <LineItemProviderCommissionMaybe
        lineItems={lineItems}
        isProvider={isProvider}
        marketplaceName={marketplaceName}
      />
      <LineItemProviderCommissionRefundMaybe
        lineItems={lineItems}
        isProvider={isProvider}
        marketplaceName={marketplaceName}
      />

      <LineItemTotalPrice transaction={transaction} isProvider={isProvider} />

      {hasCommissionLineItem ? (
        <Text style={styles.text}>{t('OrderBreakdown.commissionFeeNote')}</Text>
      ) : null}
    </View>
  );
};

export default OrderBreakdown;

const styles = StyleSheet.create({
  container: {
    marginTop: widthScale(10),
    gap: widthScale(8),
    paddingBottom: widthScale(30),
  },
  text: {
    marginTop: widthScale(5),
    fontSize: fontScale(13),
    fontWeight: fontWeight.medium,
    color: colors.darkGrey,
  },
});
