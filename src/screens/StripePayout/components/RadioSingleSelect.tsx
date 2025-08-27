import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { FC } from 'react';
import { Controller } from 'react-hook-form';
import { fontScale, heightScale, widthScale } from '../../../util';
import { colors } from '../../../theme';

type BookingTypeOption = {
  id: string;
  type: string; //'radio'; // since you’re only using radio
  label: string;
  key: string;
};

type RadioSingleSelectProps = {
  control: any;
  name: string;
  options: BookingTypeOption[];
  radioBorderColor?: string;
  radioFillColor?: string;
  disabled?: boolean;
};
const RadioSingleSelect: FC<RadioSingleSelectProps> = props => {
  const { control, name, options = [], disabled } = props;
  // const color: AppColors = useColors()

  return (
    <View style={styles.GAP}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          return options?.map(item => (
            <TouchableOpacity
              disabled={disabled}
              style={styles.rowCont}
              key={item.id}
              onPress={() => onChange(item.key)}
            >
              {value === item.key ? (
                <View style={[styles.Incircle]}>
                  <View style={[styles.fillCircle]} />
                </View>
              ) : (
                <View style={styles.offCircle} />
              )}
              <Text style={styles.textRadio}>{item.label}</Text>
            </TouchableOpacity>
          ));
        }}
      />
    </View>
  );
};

export default RadioSingleSelect;

const styles = StyleSheet.create({
  rowCont: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: heightScale(5),
  },
  GAP: {
    marginBottom: heightScale(15),
  },
  offCircle: {
    width: widthScale(20),
    height: widthScale(20),
    borderRadius: widthScale(10),
    borderWidth: 2,
    borderColor: colors.marketplaceColor,
  },
  Incircle: {
    width: widthScale(20),
    height: widthScale(20),
    borderRadius: fontScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.marketplaceColor,
  },
  fillCircle: {
    width: widthScale(10),
    height: widthScale(10),
    borderRadius: fontScale(20),
    backgroundColor: colors.marketplaceColor,
    alignSelf: 'center',
  },
  textRadio: {
    fontSize: fontScale(15),
    fontWeight: '500',
    marginLeft: widthScale(15),
  },
});
