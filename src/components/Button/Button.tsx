// import React from 'react'
// import {
//   ActivityIndicator,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
// } from 'react-native'
// import { useColors } from '../../context'
// import { AppColors, colors, fontWeight } from '../../theme'
// import { widthwidthScale } from '../../util'
// import { ButtonProps } from '../../appTypes'

// export const Button = (props: ButtonProps) => {
//   const colorsData: AppColors = useColors()
//   const {
//     text,
//     onPress = () => {},
//     style,
//     textStyle,
//     disabled,
//     loading,
//     loaderColor = colorsData.white,
//     loaderSize,
//   } = props

//   return (
//     <TouchableOpacity
//       style={[
//         styles.container,
//         {
//           backgroundColor: colorsData.marketplaceColor,
//           borderColor: colorsData.marketplaceColorDark,
//         },
//         disabled && styles.disabled,
//         style,
//         disabled && { opacity: 0.5 },
//       ]}
//       disabled={disabled}
//       onPress={onPress}>
//       {loading ? (
//         <ActivityIndicator color={loaderColor} size={loaderSize} />
//       ) : (
//         <Text style={[styles.text, textStyle]}>{text}</Text>
//       )}
//     </TouchableOpacity>
//   )
// }
// const styles = StyleSheet.create({
//   container: {
//     height: widthwidthScale(50),
//     borderRadius: widthwidthScale(10),
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//   },
//   text: {
//     fontSize: widthwidthScale(16),
//     fontWeight: fontWeight.boldest,
//     color: colors.white,
//   },
//   disabled: {
//     opacity: 0.5,
//   },
// })

import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  ImageStyle,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { widthScale } from '../../util';
import { colors, fontWeight } from '../../theme';

interface ButtonProps {
  text: string;
  onPress?: () => void;
  // style?: ViewStyle;
  style?: StyleProp<ViewStyle>;
  animatedViewStyle?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  loaderColor?: string;
  rightIcon?: ImageSourcePropType;
  leftIcon?: ImageSourcePropType;
  iconStyle?: ImageStyle;
}

export const Button = React.memo((props: ButtonProps) => {
  const { t } = useTranslation();
  const {
    text,
    onPress,
    style = {},
    animatedViewStyle = {},
    textStyle = {},
    disabled = false,
    loading = false,
    loaderColor = colors.white,
    rightIcon,
    leftIcon,
    iconStyle,
  } = props || {};

  const loaderOpacity = useSharedValue(loading ? 1 : 0);
  const textOpacity = useSharedValue(loading ? 0 : 1);
  const widthScaleValue = useSharedValue(1);

  React.useEffect(() => {
    loaderOpacity.value = withTiming(loading ? 1 : 0, { duration: 300 });
    textOpacity.value = withTiming(loading ? 0 : 1, { duration: 300 });
  }, [loading, loaderOpacity, textOpacity]);

  // Cleanup animations on unmount
  React.useEffect(() => {
    return () => {
      cancelAnimation(loaderOpacity);
      cancelAnimation(textOpacity);
      cancelAnimation(widthScaleValue);
    };
  }, [loaderOpacity, textOpacity, widthScaleValue]);

  const loaderStyle = useAnimatedStyle(() => ({
    opacity: loaderOpacity.value,
    transform: [{ scale: widthScaleValue.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: widthScaleValue.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: widthScaleValue.value }],
  }));

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={() => {
        widthScaleValue.value = withTiming(0.95, { duration: 100 });
      }}
      onPressOut={() => {
        widthScaleValue.value = withTiming(1, { duration: 100 });
      }}
      style={[
        styles.container,
        style,
        buttonStyle,
        // eslint-disable-next-line react-native/no-inline-styles
        { opacity: disabled ? 0.5 : 1 },
      ]}
    >
      <Animated.View style={[styles.loaderContainer, loaderStyle]}>
        <ActivityIndicator color={loaderColor} />
      </Animated.View>
      <Animated.View style={[styles.row, contentStyle, animatedViewStyle]}>
        {leftIcon && <Image source={leftIcon} style={[iconStyle]} />}
        <Text style={[styles.text, textStyle]}>{t(text)}</Text>
        {rightIcon && <Image source={rightIcon} style={[iconStyle]} />}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    height: widthScale(50),
    borderRadius: widthScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.marketplaceColor,
  },
  text: {
    color: colors.white,
    fontSize: widthScale(16),
    fontWeight: fontWeight.medium,
  },
  loaderContainer: {
    position: 'absolute',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: widthScale(10),
  },
});
