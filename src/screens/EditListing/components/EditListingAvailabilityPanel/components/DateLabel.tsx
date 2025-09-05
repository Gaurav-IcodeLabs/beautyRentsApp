import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontWeight } from '../../../../../theme';
import { fontScale, parseDateFromISO8601 } from '../../../../../util';

const DateLabel = props => {
  const { dateId, hasAvailability, timeZone } = props;
  const date = parseDateFromISO8601(dateId, timeZone);

  const formattedWeekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone,
  }).format(date);
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone,
  }).format(date);

  return (
    <View style={styles.flexPointFour}>
      <Text
        style={[
          styles.fontStyle,
          hasAvailability ? styles.availContent : styles.nonAvailContent,
        ]}
      >
        {formattedWeekday}
      </Text>
      <Text
        style={[
          styles.fontStyle2,
          hasAvailability ? styles.availContent : styles.nonAvailContent,
        ]}
      >
        {formattedDate}
      </Text>
    </View>
  );
};

export default DateLabel;

const styles = StyleSheet.create({
  flexPointFour: { flex: 1 },
  fontStyle: {
    fontSize: fontScale(16),
    lineHeight: fontScale(21),
  },
  fontStyle2: {
    fontSize: fontScale(12),
    lineHeight: fontScale(21),
  },
  availContent: {
    fontWeight: fontWeight.normal,
    color: colors.black,
  },
  nonAvailContent: {
    fontWeight: fontWeight.light,
    color: colors.grey,
  },
});
