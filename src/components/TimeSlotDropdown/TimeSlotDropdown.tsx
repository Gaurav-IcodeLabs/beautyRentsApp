import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import React from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import { fontScale, heightScale, widthScale } from '../../util';
import { colors, fontWeight } from '../../theme';
import { useTranslation } from 'react-i18next';
import { lightenColor } from '../../util/data';

interface TimeSlotDropdownProps {
  data: any[];
  onValueChange: (value: string) => void;
  isModal: boolean;
  lableKey: string;
  containerStyle?: ViewStyle;
  value: string;
}

const DropdownItem = ({ item, selected }) => {
  return (
    <View
      style={[
        styles.item,
        {
          backgroundColor: selected
            ? lightenColor(colors.marketplaceColor, 10)
            : colors.white,
        },
      ]}
    >
      <Text style={styles.itemText}>{item?.label}</Text>
    </View>
  );
};

export const TimeSlotDropdown = (props: TimeSlotDropdownProps) => {
  const {
    data = [],
    onValueChange,
    value,
    isModal = true,
    containerStyle,
    lableKey,
  } = props;
  const { t } = useTranslation();

  const doHandleValueChange = item => {
    onValueChange(item);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {lableKey ? <Text style={styles.label}>{t(lableKey)}</Text> : null}
      <Dropdown
        style={[styles.dropdown]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        containerStyle={styles.containerStyle}
        showsVerticalScrollIndicator={false}
        data={data}
        mode={isModal ? 'modal' : undefined}
        labelField="label"
        valueField="option"
        placeholder={'Select'}
        renderItem={(item, selected) => (
          <DropdownItem item={item} selected={selected} />
        )}
        value={value}
        onChange={item => {
          doHandleValueChange(item);
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginBottom: widthScale(16),
  },
  dropdown: {
    borderWidth: 1,
    height: heightScale(52),
    borderRadius: widthScale(10),
    paddingHorizontal: widthScale(10),
    borderColor: colors.lightGrey,
  },
  placeholderStyle: {
    fontSize: fontScale(14),
    color: colors.grey,
  },
  selectedTextStyle: {
    fontSize: fontScale(14),
    color: colors.black,
  },
  iconStyle: {
    width: widthScale(20),
    height: heightScale(20),
  },

  label: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
    marginBottom: widthScale(10),
    color: colors.grey,
  },
  containerStyle: {
    borderRadius: widthScale(10),
    marginTop: widthScale(5),
    // overflow: 'hidden',
    // borderWidth: 1,
    // borderColor: colors.lightGrey,
  },
  itemText: {
    fontSize: fontScale(14),
    color: colors.black,
  },
  item: {
    padding: widthScale(10),
    borderRadius: widthScale(10),
  },
});
