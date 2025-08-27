import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { fontScale, widthScale } from '../../../util'
import { colors, fontWeight } from '../../../theme'
import { useColors } from '../../../context'

const OwnMessage = props => {
  const { message, formattedDate } = props
  const colorsData = useColors()
  const content = message.attributes.content
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.chatContainer,
          { backgroundColor: colorsData.marketplaceColor },
        ]}>
        <Text style={styles.textColor}>{content}</Text>
      </View>
      <Text style={styles.timeStyle}>{formattedDate}</Text>
    </View>
  )
}

export default OwnMessage

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  chatContainer: {
    padding: widthScale(10),
    maxWidth: widthScale(300),
    borderTopEndRadius: widthScale(12),
    borderTopStartRadius: widthScale(12),
    borderBottomStartRadius: widthScale(12),
    borderBottomEndRadius: widthScale(0),
  },
  timeStyle: {
    fontSize: fontScale(12),
    color: colors.grey,
    paddingVertical: widthScale(2),
  },
  textColor: {
    color: colors.white,
    fontSize: fontScale(16),
    fontWeight: fontWeight.medium,
  },
})
