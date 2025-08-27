import React from 'react';
import { ActivityIndicator, StyleSheet, View, Image } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AppImageProps, CmsAspectRatios } from '../../appTypes';
import useImageAspectHeight from '../../hooks/useImageAspectHeight';
import { colors } from '../../theme';

const calculateHeight = (
  aspectRatio: string,
  originalHeight: number,
  screenWidth: number,
): number | undefined => {
  switch (aspectRatio) {
    case CmsAspectRatios.SQUARE:
      return screenWidth;
    case CmsAspectRatios.LANDSCAPE:
      return (screenWidth * 9) / 16;
    case CmsAspectRatios.PORTRAIT:
      return (screenWidth * 3) / 2;
    case CmsAspectRatios.LISTINGPORTRAIT:
      return (screenWidth * 4) / 3;
    case CmsAspectRatios.LISTINGLANDSCAPE:
      return (screenWidth * 3) / 4;
    case CmsAspectRatios.ORIGINAL:
    default:
      return originalHeight; // Handled by the image's intrinsic size
  }
};

export const AppImage = ({
  source,
  height,
  width,
  loaderColor = colors.black,
  style,
  onError,
  showLoading = true,
  aspectRatio = '1/1',
  ...props
}: AppImageProps): JSX.Element => {
  const loading = useSharedValue(1);
  const error = useSharedValue(0);
  const originalHeight = useImageAspectHeight(source.uri, width);
  const imageHeight = calculateHeight(aspectRatio, originalHeight, width);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(loading.value, {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    }),
  }));

  const handleLoad = (): void => {
    loading.value = 0;
  };

  const handleError = (): void => {
    loading.value = 0;
    error.value = 1;
    if (onError) {
      onError();
    }
  };

  const errorStyle = useAnimatedStyle(() => ({
    opacity: withTiming(error.value, {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    }),
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.loader, animatedStyle]}>
        <ActivityIndicator color={loaderColor} />
      </Animated.View>
      <Animated.View style={[styles.errorContainer, errorStyle]}>
        <View
          style={[
            style,
            {
              width: width || '100%',
              height: aspectRatio ? imageHeight : height || '100%',
            },
            { backgroundColor: colors.grey },
          ]}
        />
      </Animated.View>
      <Image
        source={source}
        style={[
          style,
          {
            width: width || '100%',
            height: aspectRatio ? imageHeight : height || '100%',
          },
        ]}
        onLoad={showLoading ? handleLoad : undefined}
        transition={{
          duration: 500,
          effect: 'cross-dissolve',
          timing: 'ease-in',
        }}
        onError={handleError}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
