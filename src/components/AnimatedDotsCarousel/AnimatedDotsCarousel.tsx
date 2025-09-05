import React, { useEffect, memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { widthScale } from '../../util';
import { colors } from '../../theme';

const DOT_ACTIVE_WIDTH = widthScale(16);
const DOT_INACTIVE_WIDTH = widthScale(8);

type AnimatedDotsCarouselProps = {
  activeIndex: number;
  dataLength?: number;
  containerStyle?: ViewStyle;
};

type DotProps = {
  dotIndex: number;
  currentIndex: SharedValue<number>;
};

const Dot = memo(({ dotIndex, currentIndex }: DotProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(
      currentIndex.value === dotIndex ? DOT_ACTIVE_WIDTH : DOT_INACTIVE_WIDTH,
    ),
    backgroundColor: colors.marketplaceColor,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
});

export const AnimatedDotsCarousel = ({
  activeIndex,
  dataLength = 0,
  containerStyle = {},
}: AnimatedDotsCarouselProps) => {
  const currentIndex = useSharedValue(activeIndex);

  useEffect(() => {
    currentIndex.value = activeIndex;
  }, [activeIndex, currentIndex]);

  if (dataLength < 2) {
    return null;
  }

  const data = Array.from({ length: dataLength }, (_, i) => i);

  return (
    <View style={[styles.dotsContainer, containerStyle]}>
      {data.map(index => (
        <Dot key={index} dotIndex={index} currentIndex={currentIndex} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: widthScale(8),
    borderRadius: widthScale(5),
    marginHorizontal: widthScale(3),
  },
});
