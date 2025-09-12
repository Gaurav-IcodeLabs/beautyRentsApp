import React from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {ListingState} from '../../appTypes';
import {
  INQUIRY_PROCESS_NAME,
  isBookingProcess,
  resolveLatestProcessName,
} from '../../transactions';
import {
  INSTANT_BOOKING_TYPE,
  LINE_ITEM_DAY,
  LINE_ITEM_HOUR,
  LINE_ITEM_NIGHT,
  widthScale,
} from '../../util';
import InquiryWithoutPaymentForm from './orderForms/InquiryWithoutPaymentForm';
import {Button} from '../Button/Button';
import {useTranslation} from 'react-i18next';
import BookingModal from './orderForms/BookingModal';

const OrderPanel = (props: any) => {
  const {t} = useTranslation();
  const [showModal, setShowModal] = React.useState(false);
  const {
    listing,
    lineItemUnitType: lineItemUnitTypeMaybe,
    onSubmit,
    isOwnListing,
    marketplaceCurrency,
  } = props;
  const {publicData, price, state, availabilityPlan} =
    listing?.attributes || {};
  const {
    // listingType,
    unitType,
    transactionProcessAlias = '',
    price_per_day = 0,
    bookingType = '',
  } = publicData || {};
  const isInstantBooking = bookingType === INSTANT_BOOKING_TYPE;

  const timeZone = availabilityPlan?.timezone;
  const isClosed = state === ListingState.LISTING_STATE_CLOSED;
  const processName = resolveLatestProcessName(
    transactionProcessAlias.split('/')[0],
  );
  const isBooking = isBookingProcess(processName);
  const lineItemUnitType = lineItemUnitTypeMaybe || `line-item/${unitType}`;

  const shouldHaveBookingDates =
    isBooking &&
    [LINE_ITEM_DAY, LINE_ITEM_NIGHT, LINE_ITEM_HOUR].includes(lineItemUnitType);
  const showBookingDatesForm = shouldHaveBookingDates && !isClosed && timeZone;
  const showInquiryForm = processName === INQUIRY_PROCESS_NAME;

  const shouldHaveBookingTime =
    isBooking && [LINE_ITEM_HOUR].includes(lineItemUnitType);
  const showBookingTimeForm = shouldHaveBookingTime && !isClosed && timeZone;

  const handleBtnPress = async () => {
    if (isOwnListing) {
      Alert.alert('', t('ListingPage.ownListing'));
    } else {
      setShowModal(true);
    }
  };

  return (
    <View style={styles.container}>
      {showInquiryForm ? (
        <InquiryWithoutPaymentForm onSubmit={onSubmit} />
      ) : (
        <Button
          text="BookingDatesForm.requestToBook"
          onPress={handleBtnPress}
        />
      )}

      {showModal ? (
        <BookingModal
          visible={showModal}
          onCloseModal={() => setShowModal(false)}
          lineItemUnitType={lineItemUnitType}
          onSubmit={onSubmit}
          price={price}
          price_per_day={price_per_day}
          timeZone={timeZone}
          listing={listing}
          marketplaceCurrency={marketplaceCurrency}
          showBookingDatesForm={showBookingDatesForm}
          showBookingTimeForm={showBookingTimeForm}
          isInstantBooking={isInstantBooking}
        />
      ) : null}
    </View>
  );
};

export default OrderPanel;

const styles = StyleSheet.create({
  container: {
    padding: widthScale(20),
  },
});
