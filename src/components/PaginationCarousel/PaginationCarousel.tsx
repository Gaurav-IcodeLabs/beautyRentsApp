// import { View, StyleSheet, ViewStyle } from 'react-native'
// import AnimatedDotsCarousel from 'react-native-animated-dots-carousel'
// import React from 'react'

// import { widthScale } from '../../util'
// import { useColors } from '../../context'
// import { AppColors, colors } from '../../theme'

// /**
//  * Renders a pagination carousel.
//  * @param {number} dataLength - The length of the data.
//  * @param {number} index - The current index.
//  * @returns {JSX.Element | null} - The pagination carousel component.
//  */
// const PaginationCarousel = ({
//   dataLength,
//   index,
//   style = {},
// }: {
//   dataLength: number
//   index: number
//   style?: ViewStyle
// }): JSX.Element | null => {
//   if (dataLength < 2) {
//     return null
//   }
//   const colors: AppColors = useColors()
//   return (
//     <View style={[Styles.paginationContainer, style]}>
//       <AnimatedDotsCarousel
//         length={dataLength}
//         currentIndex={index}
//         maxIndicators={3}
//         interpolateOpacityAndColor={true}
//         activeIndicatorConfig={{
//           color: colors.marketplaceColor,
//           margin: 3,
//           opacity: 1,
//           size: 8,
//         }}
//         inactiveIndicatorConfig={{
//           color: colors.grey,
//           margin: 3,
//           opacity: 0.5,
//           size: 8,
//         }}
//         decreasingDots={[
//           {
//             config: {
//               color: colors.grey,
//               margin: 3,
//               opacity: 0.5,
//               size: 5,
//             },
//             quantity: 0.5,
//           },
//           {
//             config: {
//               color: colors.grey,
//               margin: 3,
//               opacity: 0.5,
//               size: 5,
//             },
//             quantity: 0.5,
//           },
//         ]}
//       />
//     </View>
//   )
// }
// export default PaginationCarousel
// const Styles = StyleSheet.create({
//   paginationContainer: {
//     height: widthScale(20),
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: colors.transparent,
//   },
// })
import { View, Text } from 'react-native';
import React from 'react';

const PaginationCarousel = () => {
  return (
    <View>
      <Text>PaginationCarousel</Text>
    </View>
  );
};

export default PaginationCarousel;
