import React, {FC} from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {card as cardIcon} from '../../assets';
import {
  deletePMInProgressSelector,
  deletePaymentMethod,
} from '../../slices/paymentMethods.slice';
import {colors, fontWeight} from '../../theme';
import {fontScale, hitSlope, widthScale} from '../../util';
import {useTranslation} from 'react-i18next';
import {AppDispatch} from '../../sharetribeSetup';

interface CardProps {
  brand: string;
  last4Digits: string;
  expirationYear: number;
  expirationMonth: number;
}

interface SaveCardDetailsProp {
  card: CardProps;
}
const SavedCardDetails: FC<SaveCardDetailsProp> = props => {
  const {card} = props;
  const dispatch = useDispatch<AppDispatch>();
  const {t} = useTranslation();
  const deletePMInProgress = useSelector(deletePMInProgressSelector);

  const handleRemovePaymentMethod = () => {
    dispatch(deletePaymentMethod({}));
  };

  const conditionalStyle = deletePMInProgress ? 'center' : 'flex-end';
  // const alertText =

  return (
    <View style={styles.card}>
      <View style={styles.cardView}>
        <Image source={cardIcon} style={styles.cardIcon} />
        <View style={styles.flexDir}>
          <Text style={styles.dotted}>{'••••••••••••••••'}</Text>
          <Text style={styles.last4digit}>{card?.last4Digits}</Text>
          <Text style={styles.expiry}>
            {`${card?.expirationMonth}/ ${card?.expirationYear}`}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        hitSlop={hitSlope(15)}
        style={[styles.removeCardView, {alignSelf: conditionalStyle}]}
        onPress={() =>
          Alert.alert(
            t('SavedCardDetails.removeCardModalTitle'),
            t('SavedCardDetails.removeCardModalContent', {
              last4Digits: card?.last4Digits,
            }),
            [
              {
                text: `${t('SavedCardDetails.cancel')}`,
              },
              {
                text: `${t('SavedCardDetails.removeCard')}`,
                onPress: handleRemovePaymentMethod,
                style: 'destructive',
              },
            ],
          )
        }>
        {deletePMInProgress ? (
          <View style={styles.loader}>
            <ActivityIndicator size={'small'} color={colors.grey} />
          </View>
        ) : (
          <Text style={styles.removeTextStyle}>
            {t('SavedCardDetails.deletePaymentMethod')}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default SavedCardDetails;

const styles = StyleSheet.create({
  card: {
    // flex: 1,
    // marginHorizontal: widthScale(24),
    marginTop: widthScale(30),
  },
  cardView: {
    height: widthScale(52),
    backgroundColor: colors.savedCardBackground,
    borderRadius: widthScale(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: widthScale(20),
    height: widthScale(15),
    marginLeft: widthScale(16),
  },
  flexDir: {flexDirection: 'row', flex: 1},
  dotted: {
    fontSize: fontScale(13),
    lineHeight: fontScale(18),
    fontWeight: fontWeight.medium,
    color: colors.frostedGrey,
    marginLeft: widthScale(8),
  },
  last4digit: {
    fontSize: fontScale(13),
    lineHeight: fontScale(18),
    fontWeight: fontWeight.medium,
    marginLeft: widthScale(5),
    flex: 1,
  },
  expiry: {
    fontSize: fontScale(13),
    lineHeight: fontScale(18),
    fontWeight: fontWeight.medium,
    marginLeft: widthScale(30),
    flex: 1,
  },
  removeTextStyle: {
    marginTop: widthScale(10),
    fontSize: fontScale(14),
    lineHeight: fontScale(18),
    fontWeight: fontWeight.normal,
    color: colors.darkGrey,
  },
  removeCardView: {
    marginTop: widthScale(7),
    marginLeft: widthScale(2),
  },
  loader: {
    // backgroundColor: 'gold',
    marginTop: widthScale(10),
  },
});
