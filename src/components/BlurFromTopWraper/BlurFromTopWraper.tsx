// import MaskedView from '@react-native-masked-view/masked-view'
// import { LinearGradient } from 'expo-linear-gradient'
// import React from 'react'
// import { StyleSheet } from 'react-native'

// interface BlurFromTopWraperProps {
//   children: React.ReactNode
//   style?: any
// }

// export default function BlurFromTopWraper({
//   children,
//   style = null,
// }: BlurFromTopWraperProps) {
//   return (
//     <MaskedView
//       style={style ? style : Styles.container}
//       maskElement={
//         <LinearGradient
//           style={[StyleSheet.absoluteFill]}
//           colors={['white', 'transparent']}
//           start={{ x: 0, y: 0.05 }}
//           end={{ x: 0, y: 0 }}
//         />
//       }>
//       {children}
//     </MaskedView>
//   )
// }
// const Styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// })
import { View, Text } from 'react-native';
import React from 'react';

const BlurFromTopWraper = () => {
  return (
    <View>
      <Text>BlurFromTopWraper</Text>
    </View>
  );
};

export default BlurFromTopWraper;
