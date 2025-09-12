import {Text, View} from 'react-native';
import React from 'react';
import {TX_TRANSITION_ACTOR_CUSTOMER, getProcess} from '../../../transactions';
import {useTranslation} from 'react-i18next';
import {
  DATE_TYPE_DATE,
  DATE_TYPE_DATETIME,
  LINE_ITEM_DAY,
  LINE_ITEM_HOUR,
  LINE_ITEM_NIGHT,
  LISTING_UNIT_TYPES,
  timeOfDayFromLocalToTimeZone,
} from '../../../util';
import {
  convertMoneyToNumber,
  convertUnitToSubUnit,
  unitDivisor,
} from '../../../util/currency';
import Decimal from 'decimal.js';
import {types as sdkTypes} from '../../../util';
import OrderBreakdown from '../../OrderBreakdown/OrderBreakdown';

const {Money, UUID} = sdkTypes;

const estimatedTotalPrice = (lineItems, marketplaceCurrency) => {
  if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
    return new Money(0, marketplaceCurrency);
  }

  const numericTotalPrice = lineItems.reduce((sum, lineItem) => {
    // Add null checks for lineItem and lineTotal
    if (!lineItem || !lineItem.lineTotal) {
      return sum;
    }

    try {
      const numericPrice = convertMoneyToNumber(lineItem.lineTotal);
      return new Decimal(numericPrice).add(sum);
    } catch (error) {
      console.warn('Error converting line item price:', error);
      return sum;
    }
  }, new Decimal(0));

  // All the lineItems should have same currency so we can use the first one to check that
  // In case there are no lineItems we use currency from config.js as default
  const currency =
    lineItems[0] && lineItems[0].unitPrice && lineItems[0].unitPrice.currency
      ? lineItems[0].unitPrice.currency
      : marketplaceCurrency;

  return new Money(
    convertUnitToSubUnit(numericTotalPrice.toNumber(), unitDivisor(currency)),
    currency,
  );
};

const estimatedBooking = (
  bookingStart,
  bookingEnd,
  lineItemUnitType,
  timeZone = 'Etc/UTC',
) => {
  const duration = {start: bookingStart, end: bookingEnd};

  return {
    id: new UUID('estimated-booking'),
    type: 'booking',
    attributes: {
      ...duration,
    },
  };
};

// When we cannot speculatively initiate a transaction (i.e. logged
// out), we must estimate the transaction for booking breakdown. This function creates
// an estimated transaction object for that use case.
//
// We need to use the Template's backend to calculate the correct line items through thransactionLineItems
// endpoint so that they can be passed to this estimated transaction.
const estimatedCustomerTransaction = (
  lineItems,
  bookingStart,
  bookingEnd,
  lineItemUnitType,
  timeZone,
  process,
  processName,
  marketplaceCurrency,
) => {
  // Add validation
  if (!lineItems || !Array.isArray(lineItems)) {
    throw new Error('lineItems must be a valid array');
  }

  if (!process || !process.transitions) {
    throw new Error('process and process.transitions are required');
  }

  if (!marketplaceCurrency) {
    throw new Error('marketplaceCurrency is required');
  }

  const transitions = process.transitions;
  const now = new Date();

  const customerLineItems = lineItems.filter(
    item => item && item.includeFor && item.includeFor.includes('customer'),
  );

  const providerLineItems = lineItems.filter(
    item => item && item.includeFor && item.includeFor.includes('provider'),
  );

  const payinTotal = estimatedTotalPrice(
    customerLineItems,
    marketplaceCurrency,
  );

  const payoutTotal = estimatedTotalPrice(
    providerLineItems,
    marketplaceCurrency,
  );

  const bookingMaybe =
    bookingStart && bookingEnd
      ? {
          booking: estimatedBooking(
            bookingStart,
            bookingEnd,
            lineItemUnitType,
            timeZone,
          ),
        }
      : {};

  return {
    id: new UUID('estimated-transaction'),
    type: 'transaction',
    attributes: {
      createdAt: now,
      processName,
      lastTransitionedAt: now,
      lastTransition: transitions.REQUEST_PAYMENT,
      payinTotal,
      payoutTotal,
      lineItems: customerLineItems,
      transitions: [
        {
          createdAt: now,
          by: TX_TRANSITION_ACTOR_CUSTOMER,
          transition: transitions.REQUEST_PAYMENT,
        },
      ],
    },
    ...bookingMaybe,
  };
};

const EstimatedCustomerBreakdownMaybe = props => {
  const {t} = useTranslation();
  const {
    breakdownData = {},
    lineItems,
    timeZone,
    currency,
    marketplaceName,
    processName,
  } = props || {};
  const {startDate, endDate} = breakdownData || {};
  if (!processName) {
    console.warn('EstimatedCustomerBreakdownMaybe: processName is required');
    return null;
  }

  if (!currency) {
    console.warn('EstimatedCustomerBreakdownMaybe: currency is required');
    return null;
  }

  let process = null;
  try {
    process = getProcess(processName);
  } catch (e) {
    console.error('Error getting process:', e);
    return <Text>{t('OrderPanel.unknownTransactionProcess')}</Text>;
  }

  if (!lineItems || !Array.isArray(lineItems)) {
    console.warn(
      'EstimatedCustomerBreakdownMaybe: lineItems is not a valid array',
    );
    return null;
  }

  const unitLineItem = lineItems.find(
    item => item && LISTING_UNIT_TYPES.includes(item.code) && !item.reversal,
  );

  const lineItemUnitType = unitLineItem?.code;
  const shouldHaveBooking = [LINE_ITEM_DAY, LINE_ITEM_NIGHT].includes(
    lineItemUnitType,
  );
  const hasLineItems = lineItems && lineItems.length > 0;
  const hasRequiredBookingData = !shouldHaveBooking || (startDate && endDate);
  const dateType =
    lineItemUnitType === LINE_ITEM_HOUR ? DATE_TYPE_DATETIME : DATE_TYPE_DATE;

  // Add validation for dates when required
  if (shouldHaveBooking && (!startDate || !endDate)) {
    console.warn(
      'EstimatedCustomerBreakdownMaybe: startDate and endDate are required for this unit type',
    );
    return null;
  }

  const tx =
    hasLineItems && hasRequiredBookingData
      ? estimatedCustomerTransaction(
          lineItems,
          startDate,
          endDate,
          lineItemUnitType,
          timeZone,
          process,
          processName,
          currency,
        )
      : null;

  return tx ? (
    <OrderBreakdown
      userRole="customer"
      transaction={tx}
      booking={tx.booking}
      dateType={dateType}
      timeZone={timeZone}
      currency={currency}
      marketplaceName={marketplaceName}
    />
  ) : null;
};

export default EstimatedCustomerBreakdownMaybe;
