import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ImageStyle,
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  Image,
} from 'react-native';
import { useColors } from '../../context';
import { AppColors, colors } from '../../theme';
import { commonShadow, fontScale, heightScale, widthScale } from '../../util';
import { cross } from '../../assets';
interface RenderSearchInputFieldProps {
  name: string;
  isShadow?: boolean;
  control: any;
  icon: any;
  placeholderKey: string;
  searchFieldStyle?: ViewStyle;
  iconStyle?: ImageStyle;
  inputStyles?: TextStyle;
  setSearchValue?: (value: string) => void;
  value?: string;
  placeholderTextColor?: string;
  onPress?: () => void;
  onChangeText?: (value: string) => void;
  onClear?: () => void;
  editable?: boolean;
}
const RenderSearchInputField = (props: RenderSearchInputFieldProps) => {
  const color: AppColors = useColors();
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  const {
    icon,
    placeholderKey,
    searchFieldStyle = {},
    iconStyle = {},
    inputStyles = {},
    name,
    control,
    placeholderTextColor,
    onPress = () => {},
    onChangeText,
    onClear = () => {},
    editable,
    isShadow = true,
  } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <View
          style={[
            styles.container,
            searchFieldStyle,
            {
              borderWidth: isFocused ? widthScale(1) : widthScale(0),
              borderColor: isFocused ? color.marketplaceColor : '',
            },
            isShadow
              ? commonShadow
              : { borderWidth: widthScale(1), borderColor: color.frostedGrey },
          ]}
        >
          <Image source={icon} style={[styles.iconStyle, iconStyle]} />
          <TextInput
            editable={editable}
            keyboardType={'web-search'}
            placeholder={t(placeholderKey)}
            placeholderTextColor={placeholderTextColor || colors.grey}
            style={[styles.placeHolderStyles, inputStyles]}
            onFocus={() => setIsFocused(true)}
            onPress={onPress}
            value={value}
            onChangeText={text =>
              onChangeText?.(text, onChange) || onChange(text)
            }
            onBlur={() => {
              onBlur();
              setIsFocused(false);
            }}
          />
          {value && (
            <TouchableOpacity onPress={onClear}>
              <Image source={cross} style={[styles.cross]} />
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
};
const styles = StyleSheet.create({
  container: {
    height: heightScale(50),
    backgroundColor: colors.white,
    alignItems: 'center',
    marginBottom: heightScale(10),
    flexDirection: 'row',
    borderRadius: widthScale(12),
  },
  iconStyle: {
    width: widthScale(22),
    height: widthScale(22),
    tintColor: colors.grey,
  },
  placeHolderStyles: {
    marginHorizontal: widthScale(10),
    color: colors.grey,
    fontSize: fontScale(14),
    flex: 1,
  },
  cross: {
    width: widthScale(18),
    height: widthScale(18),
    tintColor: colors.grey,
  },
});
export default RenderSearchInputField;
