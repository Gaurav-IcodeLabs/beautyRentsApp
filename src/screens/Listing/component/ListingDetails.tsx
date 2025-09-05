import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fontWeight } from '../../../theme';
import { fontScale, widthScale } from '../../../util';
import isEqual from 'lodash/isEqual';
import { formatMoney } from '../../../util/currency';
import { locationIcon } from '../../../assets';

interface ListingDetailsProps {
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  location?: {
    address: string;
    building: string;
  };
}

const ListingDetailsComponent = (props: ListingDetailsProps) => {
  const { title, description, price, location } = props;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>{formatMoney(price, 2)}</Text>
      <Text style={styles.desc}>{description}</Text>
      <View style={styles.divider} />
      <View style={styles.locationSection}>
        <Image source={locationIcon} style={styles.locationIcon} />
        <Text style={styles.desc}>{location?.address}</Text>
      </View>
    </View>
  );
};

const ListingDetails = React.memo(
  ListingDetailsComponent,
  (prevProps, nextProps) => isEqual(prevProps, nextProps),
);
export default ListingDetails;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: widthScale(20),
    paddingBottom: widthScale(10),
    borderBottomWidth: 1,
    borderColor: colors.lightGrey,
    gap: widthScale(8),
  },
  title: {
    fontSize: fontScale(18),
    fontWeight: fontWeight.medium,
    color: colors.black,
  },
  desc: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    color: colors.darkGrey,
  },
  price: {
    color: colors.black,
    fontSize: fontScale(18),
    fontWeight: fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGrey,
    marginVertical: widthScale(5),
  },
  locationSection: {
    flexDirection: 'row',
    gap: widthScale(8),
  },
  locationIcon: {
    marginTop: widthScale(3),
    width: widthScale(14),
    height: widthScale(14),
    tintColor: colors.darkGrey,
  },
});
