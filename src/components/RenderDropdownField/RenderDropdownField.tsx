import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { colors, fontWeight } from '../../theme';
import { fontScale, heightScale, screenWidth, widthScale } from '../../util';
import { lightenColor } from '../../util/data';

interface RenderDropdownFieldProps {
  disabled?: boolean;
  data: any[];
  placeholderKey?: string;
  lableKey?: string;
  name: string;
  control: any;
  onDropDownValueChange: (value: string, cb: (value: any) => void) => void;
  labelField?: string;
  valueField?: string;
  itemRenderKey?: string;
  maxHeight?: number;
  openDirection?: 'auto' | 'top' | 'bottom';
  inverted?: boolean;
  containerWidth?: boolean;
}

export const RenderDropdownField = (props: RenderDropdownFieldProps) => {
  const {
    data,
    placeholderKey,
    name,
    control,
    lableKey,
    onDropDownValueChange,
    labelField = 'name',
    valueField = 'id',
    disabled = false,
    itemRenderKey = 'label',
    maxHeight = 300,
    openDirection = 'bottom',
    inverted = true,
    containerWidth = true,
  } = props;
  // const [isFocus, setIsFocus] = React.useState(false);
  const { t } = useTranslation();
  // const colors: AppColors = useColors()
  if (disabled) return null;
  return (
    <View
      style={[
        Styles.container,
        containerWidth ? { width: screenWidth - widthScale(40) } : '',
      ]}
    >
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, onBlur } }) => {
          return (
            <View style={[Styles.outerContainer]}>
              {lableKey ? (
                <Text style={Styles.label}>{t(lableKey)}</Text>
              ) : null}
              <Dropdown
                inverted={!inverted}
                dropdownPosition={openDirection}
                style={[
                  Styles.dropdown,
                  // isFocus && { borderColor: colors.marketplaceColorLight },
                ]}
                placeholderStyle={Styles.placeholderStyle}
                selectedTextStyle={Styles.selectedTextStyle}
                inputSearchStyle={Styles.inputSearchStyle}
                containerStyle={Styles.containerStyle}
                iconStyle={Styles.iconStyle}
                renderItem={(item, selected) => {
                  return (
                    <View
                      style={[
                        Styles.item,
                        {
                          backgroundColor: selected
                            ? lightenColor(colors.marketplaceColor, 10)
                            : colors.white,
                        },
                      ]}
                    >
                      <Text style={[Styles.itemText]}>
                        {item[`${itemRenderKey}`]}
                      </Text>
                    </View>
                  );
                }}
                iconColor={colors.grey}
                data={data}
                maxHeight={maxHeight}
                labelField={labelField}
                valueField={valueField}
                placeholder={placeholderKey ? t(placeholderKey) : ''}
                value={value}
                // onFocus={() => setIsFocus(true)}
                onBlur={() => {
                  // setIsFocus(false);
                  onBlur();
                }}
                onChange={item => {
                  if (onDropDownValueChange)
                    onDropDownValueChange(item, onChange);
                  // setIsFocus(false);
                }}
              />
            </View>
          );
        }}
      />
    </View>
  );
};

const Styles = StyleSheet.create({
  container: {
    marginBottom: widthScale(16),
  },
  outerContainer: {
    borderRadius: widthScale(10),
  },
  dropdown: {
    borderWidth: 1,
    height: heightScale(50),
    borderRadius: widthScale(10),
    paddingHorizontal: widthScale(10),
    backgroundColor: colors.white,
    borderColor: colors.lightGrey,
  },
  placeholderStyle: {
    fontSize: fontScale(14),
    color: colors.grey,
  },
  label: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
    marginBottom: widthScale(10),
    color: colors.black,
  },
  selectedTextStyle: {
    fontSize: fontScale(14),
  },
  iconStyle: {
    width: widthScale(20),
    height: widthScale(20),
  },
  inputSearchStyle: {
    height: heightScale(40),
    fontSize: fontScale(14),
  },
  item: {
    padding: widthScale(10),
    backgroundColor: colors.grey,
  },
  itemText: {
    fontSize: fontScale(14),
    color: colors.black,
  },
  containerStyle: {
    borderRadius: widthScale(10),
    marginTop: widthScale(5),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
});
