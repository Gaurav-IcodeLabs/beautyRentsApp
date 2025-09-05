import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { colors, fontWeight } from '../../../theme';
import { fontScale, heightScale, widthScale } from '../../../util';

const CustomTabBar = ({ activeTab, onTabPress }) => {
  const { t } = useTranslation();
  const tabs = [
    { text: t('InboxPage.ordersTabTitle'), name: 'orders' },
    { text: t('InboxPage.salesTabTitle'), name: 'sales' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.name}
          style={[
            styles.tabButton,
            activeTab === tab.name
              ? {
                  backgroundColor: colors.marketplaceColor,
                }
              : styles.inActiveTab,
          ]}
          onPress={() => onTabPress(tab.name)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.name ? styles.activeText : styles.inActiveText,
            ]}
          >
            {tab.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: widthScale(18),
    // paddingHorizontal: widthScale(20),
  },
  tabButton: {
    borderRadius: widthScale(12),
    width: '48%',
    height: heightScale(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.medium,
  },
  activeText: {
    color: colors.white,
  },
  inActiveText: {
    color: colors.darkGrey,
  },
  inActiveTab: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
});
