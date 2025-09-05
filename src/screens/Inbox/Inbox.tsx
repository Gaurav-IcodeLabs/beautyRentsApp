import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import CustomTabBar from './components/CustomTabBar';
import OrdersComponent from './components/OrdersComponent';
import SalesComponent from './components/SalesComponent';
import { InboxTypes } from '../../appTypes';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { widthScale } from '../../util';

export const Inbox = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(InboxTypes.ORDERS);

  const handleTabPress = tabName => {
    setActiveTab(tabName);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case InboxTypes.ORDERS:
        return <OrdersComponent />;
      case InboxTypes.SALES:
        return <SalesComponent />;
      default:
        return null;
    }
  };

  return (
    <View style={style.container}>
      <ScreenHeader
        containerStyle={{ height: widthScale(50) }}
        hideLeftIcon
        title={t('Inbox.title')}
      />
      <View style={style.tabContainer}>
        <CustomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
        {renderScreen()}
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  tabContainer: {
    flex: 1,
    paddingHorizontal: widthScale(20),
  },
});
