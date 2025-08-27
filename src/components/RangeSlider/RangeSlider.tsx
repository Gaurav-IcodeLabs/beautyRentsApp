/* eslint-disable react-native/no-inline-styles */
import _throttle from 'lodash/throttle'
import React, { useCallback, useState } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useColors } from '../../context'
import { AppColors, colors } from '../../theme'
import { widthScale } from '../../util'

const THUMB_RADIUS = 12
const THUMB_SIZE = 15

interface RangeSliderComponentProps {
  valueLow: number
  valueHigh: number
  handleValueChange: (valueLow: number, valueHigh: number) => void
  style?: ViewStyle
  initialValue: {
    low: number
    high: number
  }
}

const RangeSliderComponent = (props: RangeSliderComponentProps) => {
  const {
    valueLow,
    valueHigh,
    handleValueChange,
    style = {},
    initialValue,
  } = props
  const colors: AppColors = useColors()
  const leftThumbTranslation = useSharedValue(0)
  const prevLeftThumbTranslation = useSharedValue(0)
  const rightThumbTranslation = useSharedValue(0)
  const prevRightThumbTranslation = useSharedValue(0)
  const [fullWidth, setFullWidth] = useState(0)
  const throttleFn = useCallback(_throttle(handleValueChange, 150), [])
  const HIGHEST_VALUE = initialValue.high
  const LOWEST_VALUE = initialValue.low

  const giveValuesBack = () => {
    'worklet'
    runOnJS(throttleFn)(
      LOWEST_VALUE +
        Math.floor(
          (leftThumbTranslation.value / fullWidth) *
            (HIGHEST_VALUE - LOWEST_VALUE),
        ),
      HIGHEST_VALUE +
        Math.ceil(
          (rightThumbTranslation.value / fullWidth) *
            (HIGHEST_VALUE - LOWEST_VALUE),
        ),
      true,
    )
  }

  const leftThumbPan = Gesture.Pan()
    .activeOffsetX([0, 0])
    .onUpdate(e => {
      if (e.translationX + prevLeftThumbTranslation.value > 0) {
        if (
          e.translationX +
            prevLeftThumbTranslation.value -
            rightThumbTranslation.value <=
          fullWidth
        ) {
          leftThumbTranslation.value =
            e.translationX + prevLeftThumbTranslation.value
        } else {
          leftThumbTranslation.value = fullWidth + rightThumbTranslation.value
        }
      } else {
        leftThumbTranslation.value = 0
      }
      giveValuesBack()
    })
    .onFinalize(() => {
      prevLeftThumbTranslation.value = leftThumbTranslation.value
    })
  const rightThumbPan = Gesture.Pan()
    .activeOffsetX([0, 0])
    .onUpdate(e => {
      if (e.translationX + prevRightThumbTranslation.value < 0) {
        if (
          leftThumbTranslation.value -
            (e.translationX + prevRightThumbTranslation.value) <=
          fullWidth
        ) {
          rightThumbTranslation.value =
            e.translationX + prevRightThumbTranslation.value
        } else {
          rightThumbTranslation.value = leftThumbTranslation.value - fullWidth
        }
      } else {
        rightThumbTranslation.value = 0
      }
      giveValuesBack()
    })
    .onFinalize(() => {
      prevRightThumbTranslation.value = rightThumbTranslation.value
    })

  const leftThumbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: leftThumbTranslation.value }],
    }
  })
  const rightThumbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: rightThumbTranslation.value }],
    }
  })

  const onGetFullWidth = (fullWidthValue: number) => {
    'worklet'
    leftThumbTranslation.value =
      (valueLow / (HIGHEST_VALUE - LOWEST_VALUE)) * fullWidthValue
    prevLeftThumbTranslation.value = leftThumbTranslation.value

    rightThumbTranslation.value =
      -((HIGHEST_VALUE - valueHigh) / (HIGHEST_VALUE - LOWEST_VALUE)) *
      fullWidthValue
    prevRightThumbTranslation.value = rightThumbTranslation.value
  }

  return (
    <View
      style={style}
      onLayout={e => {
        if (e.nativeEvent.layout.width) {
          setFullWidth(e.nativeEvent.layout.width)
          runOnUI(onGetFullWidth)(e.nativeEvent.layout.width)
        }
      }}>
      {fullWidth ? (
        <>
          <View
            style={[
              styles.innerContainer,
              { backgroundColor: colors.marketplaceColor },
            ]}>
            <Animated.View
              style={[
                styles.leftThumb,
                { marginLeft: -fullWidth, width: fullWidth },
                leftThumbAnimatedStyle,
              ]}
            />
            <Animated.View
              style={[
                {
                  marginRight: -fullWidth,
                  width: fullWidth,
                },
                styles.rightThumb,
                rightThumbAnimatedStyle,
              ]}
            />
          </View>

          <GestureDetector gesture={leftThumbPan}>
            <Animated.View
              style={[
                {
                  top: -(THUMB_SIZE + 20) / 2 + 4 / 2,
                  left: -10 - THUMB_SIZE / 2,
                },
                styles.gesterLeftThumb,
                leftThumbAnimatedStyle,
              ]}>
              <View
                style={[
                  {
                    width: THUMB_SIZE,
                    height: THUMB_SIZE,
                    borderRadius: THUMB_RADIUS,
                  },
                  {
                    borderColor: colors.marketplaceColor,
                  },
                  styles.gesterThumbInner,
                ]}
              />
            </Animated.View>
          </GestureDetector>
          <GestureDetector gesture={rightThumbPan}>
            <Animated.View
              style={[
                {
                  top: -(THUMB_SIZE + 20) / 2 + 4 / 2,
                  right: -10 - THUMB_SIZE / 2,
                },
                styles.gesterRightThumb,
                rightThumbAnimatedStyle,
              ]}>
              <View
                style={[
                  {
                    width: THUMB_SIZE,
                    height: THUMB_SIZE,
                    borderRadius: THUMB_RADIUS,
                  },
                  {
                    borderColor: colors.marketplaceColor,
                  },
                  styles.gesterThumbInner,
                ]}
              />
            </Animated.View>
          </GestureDetector>
        </>
      ) : null}
    </View>
  )
}

export const RangeSlider = React.memo(
  RangeSliderComponent,
  (prevProps, nextProps) => true,
)

const styles = StyleSheet.create({
  innerContainer: {
    height: widthScale(4),
    borderRadius: widthScale(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  leftThumb: {
    backgroundColor: colors.frostedGrey,
    height: widthScale(4),
  },
  rightThumb: {
    backgroundColor: colors.frostedGrey,
    height: widthScale(4),
  },
  gesterLeftThumb: {
    position: 'absolute',
    zIndex: 10,
    padding: widthScale(10),
  },
  gesterThumbInner: {
    borderWidth: widthScale(2),

    backgroundColor: colors.white,
  },
  gesterRightThumb: {
    padding: widthScale(10),
    position: 'absolute',
    zIndex: 20,
  },
})
