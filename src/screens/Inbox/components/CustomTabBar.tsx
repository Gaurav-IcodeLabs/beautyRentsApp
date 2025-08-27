import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../theme';
import { heightScale, widthScale } from '../../../util';
// import { useColors } from '../../../context'

const CustomTabBar = ({ activeTab, onTabPress }) => {
  const { t } = useTranslation();
  // const color = useColors()
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
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: widthScale(18),
    paddingHorizontal: widthScale(8),
  },
  tabButton: {
    // padding: widthScale(10),
    borderRadius: widthScale(12),
    width: '40%',
    height: heightScale(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
  },
  activeText: {
    color: colors.white,
  },
  inActiveText: {
    color: colors.grey,
  },
  inActiveTab: {
    backgroundColor: colors.lightGrey,
  },
});
