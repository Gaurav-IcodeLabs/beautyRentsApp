import React from 'react'
import { StyleSheet, View } from 'react-native'
import { colors } from '../../theme'
import { OverLayProps } from '../../appTypes'

const OverLay = (props: OverLayProps) => {
  const { color, opacity } = props
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: color || colors.black, opacity: opacity || 0.5 },
      ]}
    />
  )
}
export default OverLay
const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})
