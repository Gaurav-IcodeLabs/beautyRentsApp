import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, Image } from 'react-native';
import { whiteTick } from '../../assets';
import { colors } from '../../theme';
import { widthScale } from '../../util';

interface CheckBoxProps {
  checked: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const CheckBox = (props: CheckBoxProps) => {
  const { checked, onPress = () => {}, style, disabled = false } = props;
  // const colors: AppColors = useColors();
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.container,
        checked
          ? { backgroundColor: colors.marketplaceColor }
          : // eslint-disable-next-line react-native/no-inline-styles
            { borderWidth: 2, borderColor: colors.grey },

        {
          borderRadius: widthScale(4),
        },
        style,
      ]}
    >
      {checked && (
        <Image
          source={whiteTick}
          style={{ width: widthScale(12), height: widthScale(12) }}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: widthScale(18),
    width: widthScale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
