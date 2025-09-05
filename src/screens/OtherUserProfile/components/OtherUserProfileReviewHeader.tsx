import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { fontScale, widthScale } from '../../../util';
import { colors, fontWeight } from '../../../theme';

interface ProfileBottomContentHeaderProps {
  tabsData: any;
  selectedTab: string;
  handleTabPress: (tab: string) => void;
}

export default function OtherUserProfileReviewHeader(
  props: ProfileBottomContentHeaderProps,
) {
  const { tabsData = [] } = props;
  return (
    <View style={styles.container}>
      {tabsData.map((item: any) => {
        const isSelected = item.label === props.selectedTab;
        return (
          <Pressable
            key={item.label}
            style={[styles.tabContainer, isSelected && styles.activeTab]}
            onPress={() => props.handleTabPress(item.label)}
          >
            <Text
              style={[
                styles.text,
                isSelected && { color: colors.marketplaceColor },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: widthScale(20),
  },
  tabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: widthScale(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.darkGrey,
  },
  text: {
    fontSize: fontScale(12),
    // fontWeight: fontWeight.medium,
    color: colors.darkGrey,
  },
  activeTab: {
    borderBottomColor: colors.marketplaceColor,
  },
});
