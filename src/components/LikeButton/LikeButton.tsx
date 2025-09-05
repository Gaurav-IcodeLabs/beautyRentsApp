import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useLike } from '../../hooks/useLike';
import { colors } from '../../theme';
import { widthScale } from '../../util';
import { emptyheartIcon, heartFillIcon } from '../../assets';

export const LikeButton = ({ id }: { id: string }) => {
  const { isLiked, handleLike } = useLike(id);
  const isFirstRender = React.useRef(true);
  const scaleValue = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));
  const onPressLike = () => {
    handleLike();
  };

  useEffect(() => {
    if (isLiked && !isFirstRender.current) {
      scaleValue.value = withSpring(1.3, {}, () => {
        scaleValue.value = withSpring(1);
      });
    }
    isFirstRender.current = false;
  }, [isLiked, scaleValue]);

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={[styles.heartIcon]}
      onPress={onPressLike}
    >
      <Animated.Image
        source={isLiked ? heartFillIcon : emptyheartIcon}
        style={[styles.icon, animatedStyle]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  heartIcon: {
    height: widthScale(30),
    width: widthScale(30),
    borderRadius: widthScale(100),
    alignItems: 'center',
    justifyContent: 'center',
    // overflow: 'hidden',
    backgroundColor: colors.white,
  },
  icon: {
    height: widthScale(18),
    width: widthScale(18),
  },
});
