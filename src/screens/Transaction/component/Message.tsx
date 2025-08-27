import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { commonShadow, fontScale, widthScale } from '../../../util'
import { colors, fontWeight } from '../../../theme'

const Message = props => {
  const { message, formattedDate } = props
  const content = message.attributes.content
  return (
    <View style={styles.container}>
      <View style={styles.chatContainer}>
        <Text style={styles.textColor}>{content}</Text>
      </View>
      <Text style={styles.timeStyle}>{formattedDate}</Text>
    </View>
  )
}

export default Message

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  chatContainer: {
    padding: widthScale(10),
    maxWidth: widthScale(300),
    backgroundColor: 'white',
    borderTopEndRadius: widthScale(12),
    borderTopStartRadius: widthScale(12),
    borderBottomStartRadius: widthScale(0),
    borderBottomEndRadius: widthScale(12),
    ...commonShadow,
  },
  timeStyle: {
    fontSize: fontScale(12),
    color: colors.grey,
    paddingVertical: widthScale(2),
  },
  textColor: {
    color: colors.grey,
    fontSize: fontScale(16),
    fontWeight: fontWeight.medium,
  },
})
