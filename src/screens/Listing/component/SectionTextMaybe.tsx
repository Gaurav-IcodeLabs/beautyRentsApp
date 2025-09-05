import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Paragraph } from '../../../components';
import { colors, fontWeight } from '../../../theme';
import { fontScale, widthScale } from '../../../util';

type SectionTextMaybeProps = {
  text: string;
  heading: string;
};

const SectionTextMaybe = (props: SectionTextMaybeProps) => {
  const { text, heading } = props;
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{heading}</Text>
      <Paragraph containerStyle={styles.paragraph} content={text} />
    </View>
  );
};

export default SectionTextMaybe;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: widthScale(20),
    marginVertical: widthScale(12),
    borderBottomWidth: 1,
    borderColor: colors.lightGrey,
  },
  heading: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontScale(16),
  },
  paragraph: {
    // marginTop: 5,
    marginBottom: 0,
  },
});
