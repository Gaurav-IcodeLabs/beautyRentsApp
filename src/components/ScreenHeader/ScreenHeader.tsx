import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageStyle,
  TextStyle,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import React from 'react';
import { backIcon } from '../../assets';
import { hitSlope } from '../../util';
import { useNavigation } from '@react-navigation/native';
import { fontScale, widthScale } from '../../util';
import { colors, fontWeight } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export interface ScreenHeaderProps {
  title?: string;
  subTitle?: string;
  leftIcon?: any;
  rightIcon?: any;
  titleStyle?: TextStyle;
  subTitleStyle?: TextStyle;
  titleIconStyle?: ImageStyle;
  titleIcon?: any;
  isRightIconText?: boolean;
  bottomBorder?: boolean;
  onLeftIconPress?: Function;
  onRightIconPress?: Function;
  rightIconDisabled?: boolean;
  leftIconDisabled?: boolean;
  rightIconStyle?: StyleProp<ImageStyle>;
  rightIconTextStyle?: TextStyle;
  rightIconDisabledTextStyle?: TextStyle;
  containerStyle?: ViewStyle;
  rightIconContainerStyle?: ViewStyle;
  leftIconContainerStyle?: ViewStyle;
  hideLeftIcon?: boolean;
  rightIconLoader?: boolean;
  rightLoaderColor?: string;
  backgroundColor?: ViewStyle;
}
export const ScreenHeader = ({
  leftIcon,
  title,
  rightIcon,
  titleStyle,
  titleIconStyle,
  bottomBorder = false,
  onLeftIconPress,
  onRightIconPress = () => {},
  rightIconDisabled = false,
  leftIconDisabled = false,
  isRightIconText,
  rightIconStyle = {},
  rightIconTextStyle,
  rightIconContainerStyle,
  rightIconDisabledTextStyle,
  titleIcon,
  containerStyle = {},
  hideLeftIcon = false,
  rightIconLoader = false,
  rightLoaderColor,
  subTitle,
  subTitleStyle,
  leftIconContainerStyle = {},
  backgroundColor = {},
}: ScreenHeaderProps) => {
  const navigation = useNavigation();
  const top = useSafeAreaInsets().top;
  return (
    <View
      style={[Styles.headerContainer, { paddingTop: top }, backgroundColor]}
    >
      <View
        style={[
          Styles.container,
          bottomBorder && Styles.btmBorder,
          containerStyle,
        ]}
      >
        <View style={Styles.contantContainer}>
          <View style={[Styles.leftIconConatainer, leftIconContainerStyle]}>
            {!hideLeftIcon && (
              <TouchableOpacity
                disabled={leftIconDisabled}
                hitSlop={hitSlope(15)}
                onPress={() => {
                  onLeftIconPress ? onLeftIconPress() : navigation.goBack();
                }}
              >
                <Image
                  style={Styles.icon}
                  source={leftIcon ? leftIcon : backIcon}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={Styles.titleContainer}>
            <View style={Styles.titleIconContainer}>
              {titleIcon && (
                <Image
                  resizeMode="contain"
                  style={[Styles.titleIconStyle, titleIconStyle]}
                  source={titleIcon}
                />
              )}
              <View>
                <Text numberOfLines={1} style={[Styles.title, titleStyle]}>
                  {title}
                </Text>
                {subTitle && (
                  <Text
                    numberOfLines={1}
                    style={[Styles.subTitle, subTitleStyle]}
                  >
                    {subTitle}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={[Styles.rightIconConatainer, rightIconContainerStyle]}>
            {rightIcon && (
              <TouchableOpacity
                disabled={rightIconDisabled}
                onPress={() => onRightIconPress()}
              >
                {rightIconLoader ? (
                  <ActivityIndicator
                    color={rightLoaderColor ? rightLoaderColor : 'white'}
                  />
                ) : (
                  <>
                    {isRightIconText ? (
                      <Text
                        style={[
                          Styles.rightIconTextStyle,
                          rightIconDisabled
                            ? rightIconDisabledTextStyle
                              ? rightIconDisabledTextStyle
                              : rightIconTextStyle
                            : rightIconTextStyle,
                        ]}
                      >
                        {rightIcon}
                      </Text>
                    ) : (
                      <Image
                        source={rightIcon}
                        style={rightIconStyle}
                        resizeMode="contain"
                      />
                    )}
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
export const Styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.white,
  },
  container: {
    height: widthScale(60),
    flexDirection: 'column-reverse',
    borderColor: colors.lightGrey,
  },
  contantContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    height: widthScale(24),
    width: widthScale(24),
  },
  leftIconConatainer: {
    width: widthScale(70),
    paddingLeft: widthScale(16),
  },
  rightIconConatainer: {
    width: widthScale(70),
    paddingRight: widthScale(26),
  },
  rightIconTextStyle: {
    textAlign: 'right',
  },
  titleContainer: { flex: 1 },
  titleIconContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btmBorder: {
    borderBottomWidth: 1,
  },
  titleIconStyle: {
    marginRight: widthScale(14),
  },
  title: {
    fontWeight: fontWeight.semiBold,
    color: colors.black,
    fontSize: fontScale(18),
    lineHeight: fontScale(24),
    textAlign: 'center',
  },
  subTitle: {
    fontWeight: fontWeight.medium,
    color: colors.black,
    fontSize: fontScale(14),
    lineHeight: fontScale(16),
    textAlign: 'center',
  },
});
