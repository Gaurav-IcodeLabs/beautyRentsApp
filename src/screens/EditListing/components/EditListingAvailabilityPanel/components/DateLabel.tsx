import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, fontWeight } from '../../../../../theme'
import {
  fontScale,
  parseDateFromISO8601
} from '../../../../../util'

const DateLabel = props => {
  const { dateId, hasAvailability, timeZone } = props
  const date = parseDateFromISO8601(dateId, timeZone)

  const formattedWeekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone,
  }).format(date)

  return (
    <View style={styles.flexPointFour}>
      <Text
        style={[
          styles.fontStyle,
          hasAvailability ? styles.availContent : styles.nonAvailContent,
        ]}>
        {formattedWeekday}
      </Text>
    </View>
  )
}

export default DateLabel

const styles = StyleSheet.create({
  flexPointFour: { flex: 0.4 },
  fontStyle: {
    fontSize: fontScale(14),
    lineHeight: fontScale(21),
  },
  availContent: { fontWeight: fontWeight.normal, color: colors.black },
  nonAvailContent: { fontWeight: fontWeight.light, color: colors.grey },
})
