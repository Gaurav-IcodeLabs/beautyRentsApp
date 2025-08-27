import React from 'react'
import { StyleSheet, View } from 'react-native'
import Markdown from 'react-native-markdown-display'
import { ParagraphProps } from '../../appTypes'
import { colors } from '../../theme'
import { fontScale, widthScale } from '../../util'
export const Paragraph = (props: ParagraphProps) => {
  const {
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
      <Markdown
        style={{
          body: {
            color: color,
            ...textStyle,
          },
          heading1: {
            color: color,
            ...textStyle,
          },
          paragraph: {
            color: color,
            ...textStyle,
          },
          link: {
            ...textStyle,
          },
        }}>
        {content}
      </Markdown>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: widthScale(10),
  },
})
