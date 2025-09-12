import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {colors, fontWeight} from '../../../theme';
import {cross} from '../../../assets';
import {fontScale, types, widthScale} from '../../../util';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import RadioButton from '../../RadioButton/RadioButton';
import {useTranslation} from 'react-i18next';
import {formatMoney} from '../../../util/currency';
import BookingDatesForm from './BookingDatesForm';
import BookingTimeForm from './BookingTimeForm';
import {useAppDispatch} from '../../../sharetribeSetup';
import {clearLineItems} from '../../../screens/Listing/Listing.slice';

const BookingModal = (props: any) => {
  const dispatch = useAppDispatch();
  const {top} = useSafeAreaInsets();
  const {t} = useTranslation();
  const {
    visible,
    onCloseModal,
    lineItemUnitType,
    onSubmit,
    price,
    price_per_day,
    timeZone,
    listing,
    marketplaceCurrency,
    showBookingDatesForm,
    showBookingTimeForm,
    isInstantBooking,
  } = props;
  const dayPrice =
    price_per_day && new types.Money(price_per_day * 100, marketplaceCurrency);
  const [bookingType, setBookingType] = React.useState('');

  const handleSelectBookingType = (type: string) => {
    dispatch(clearLineItems({listingId: listing.id.uuid}));
    setBookingType(type);
  };

  return (
    <Modal visible={visible} onRequestClose={onCloseModal} animationType="fade">
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.closeContainerStyle, {marginTop: top}]}
          onPress={onCloseModal}>
          <Image
            source={cross}
            style={styles.crossImageStyle}
            tintColor={colors.grey}
          />
        </TouchableOpacity>

        <View style={styles.priceSection}>
          <View style={styles.labelSection}>
            <Text style={styles.priceLabel}>{t('Price per hour')}</Text>
            <Text style={styles.priceValue}>
              {price ? formatMoney(price, 2) : '---'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.labelSection}>
            <Text style={styles.priceLabel}>{t('Price per day')}</Text>
            <Text style={styles.priceValue}>
              {price_per_day ? formatMoney(dayPrice, 2) : '---'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.section}
          disabled={!price || !showBookingTimeForm}
          onPress={() => handleSelectBookingType('entireDay')}>
          <RadioButton
            isActive={bookingType === 'entireDay'}
            onPress={() => handleSelectBookingType('entireDay')}
            size={widthScale(24)}
            disabled={!price}
          />
          <Text style={styles.radioBtnText}>
            {t('OrderPanel.bookingOption.day')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.5}
          style={[styles.section, {marginBottom: widthScale(20)}]}
          disabled={!price_per_day || !showBookingDatesForm}
          onPress={() => handleSelectBookingType('specificSlot')}>
          <RadioButton
            isActive={bookingType === 'specificSlot'}
            onPress={() => handleSelectBookingType('specificSlot')}
            size={widthScale(24)}
            disabled={!price_per_day}
          />
          <Text style={styles.radioBtnText}>
            {t('OrderPanel.bookingOption.hour')}
          </Text>
        </TouchableOpacity>

        {bookingType === 'entireDay' ? (
          <BookingDatesForm
            listingType={listing.attributes.publicData.listingType}
            listingPublicData={listing.attributes.publicData}
            lineItemUnitType={lineItemUnitType}
            onSubmit={onSubmit}
            price={price}
            timeZone={timeZone}
            listingId={listing.id}
            onCloseBookingModal={onCloseModal}
            marketplaceCurrency={marketplaceCurrency}
            isInstantBooking={isInstantBooking}
          />
        ) : bookingType === 'specificSlot' ? (
          <BookingTimeForm
            listingType={listing.attributes.publicData.listingType}
            listingPublicData={listing.attributes.publicData}
            lineItemUnitType={lineItemUnitType}
            onSubmit={onSubmit}
            price={price}
            timeZone={timeZone}
            listingId={listing.id}
            onCloseBookingModal={onCloseModal}
            marketplaceCurrency={marketplaceCurrency}
            isInstantBooking={isInstantBooking}
          />
        ) : null}
      </View>
    </Modal>
  );
};

export default BookingModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    // padding: widthScale(20),
    paddingHorizontal: widthScale(20),
    paddingTop: widthScale(20),
  },
  closeContainerStyle: {
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  crossImageStyle: {
    width: widthScale(25),
    height: widthScale(25),
    tintColor: colors.darkGrey,
  },
  priceSection: {
    marginVertical: widthScale(20),
    gap: widthScale(10),
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: widthScale(12),
    paddingVertical: widthScale(10),
  },
  labelSection: {
    alignItems: 'center',
  },
  divider: {
    width: widthScale(1),
    height: '100%',
    backgroundColor: colors.lightGrey,
  },
  priceLabel: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.medium,
    color: colors.black,
  },
  priceValue: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.medium,
    color: colors.marketplaceColor,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: widthScale(10),
  },
  radioBtnText: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.medium,
    color: colors.black,
    paddingLeft: widthScale(10),
  },
});
