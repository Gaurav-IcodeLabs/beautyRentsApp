/* eslint-disable react-native/no-unused-styles */
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { HeadingProps } from '../../appTypes'
import { colors, fontWeight } from '../../theme'
import { fontScale, widthScale } from '../../util'
export const Heading = (props: HeadingProps) => {
  const {
    fieldType,
    content,
    color = colors.black,
    containerStyle = {},
    textStyle = {},
  } = props

  if (!content) {
    return null
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles[fieldType] , styles.txt, { color }, textStyle]}>{content}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: widthScale(10),
  },
  txt: {
    textAlign: 'left',
  },
  heading1: {
    fontSize: fontScale(32),
    fontWeight: fontWeight.bold,
  },
  heading2: {
    fontSize: fontScale(24),
    fontWeight: fontWeight.bold,
  },
  heading3: {
    fontSize: fontScale(18),
    fontWeight: fontWeight.bold,
  },
  heading4: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.bold,
  },
  heading5: {
    fontSize: fontScale(13),
    fontWeight: fontWeight.bold,
  },
  heading6: {
    fontSize: fontScale(11),
    fontWeight: fontWeight.bold,
  },
})
