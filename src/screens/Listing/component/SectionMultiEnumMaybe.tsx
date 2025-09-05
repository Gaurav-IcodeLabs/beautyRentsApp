import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontWeight } from '../../../theme';
import { fontScale, widthScale } from '../../../util';
import PropertyGroup from './PropertyGroup';

interface SectionMultiEnumMaybeProps {
  heading?: string;
  options?: string[];
  selectedOptions: string[];
  showUnselectedOptions?: boolean;
}

export default function SectionMultiEnumMaybe(
  props: SectionMultiEnumMaybeProps,
) {
  const {
    heading,
    options,
    selectedOptions,
    showUnselectedOptions = true,
  } = props;
  const hasContent = showUnselectedOptions || selectedOptions?.length > 0;
  if (!heading || !options || !hasContent) {
    return null;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{heading}</Text>
      <PropertyGroup
        id="ListingPage.amenities"
        options={options}
        selectedOptions={selectedOptions}
        showUnselectedOptions={showUnselectedOptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: widthScale(20),
    paddingVertical: widthScale(10),
    borderBottomWidth: 1,
    borderColor: colors.lightGrey,
  },
  heading: {
    fontWeight: fontWeight.medium,
    fontSize: fontScale(16),
    marginBottom: widthScale(12),
  },
});
