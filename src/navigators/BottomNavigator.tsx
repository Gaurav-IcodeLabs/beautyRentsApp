/* eslint-disable react/no-unstable-nested-components */
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { EditListing, Home, Inbox, Profile, Search } from '../screens';
import {
  homeIcon,
  searchIcon,
  inboxIcon,
  profileIcon,
  addIcon,
} from '../assets';
import { colors } from '../theme';
import { fontScale, heightScale, widthScale } from '../util';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
export const BottomNavigator = () => {
  // const Tab = createBottomTabNavigator();
  const { Navigator, Screen } = createBottomTabNavigator();
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          paddingTop: heightScale(10),
          height: heightScale(80),
          borderRadius: widthScale(50),
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: fontScale(12),
          paddingTop: widthScale(2),
        },
        tabBarActiveTintColor: colors.marketplaceColor,
        tabBarInactiveTintColor: colors.grey,
      }}
    >
      <Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: t('BottomTab.home'),
          tabBarIcon: ({ focused }) => (
            <Image
              tintColor={focused ? colors.marketplaceColor : colors.grey}
              source={homeIcon}
              style={styles.iconImage}
            />
          ),
        }}
      />

      <Screen
        name="Search"
        component={Search}
        options={{
          tabBarLabel: t('BottomTab.search'),
          tabBarIcon: ({ focused }) => (
            <Image
              tintColor={focused ? colors.marketplaceColor : colors.grey}
              source={searchIcon}
              style={styles.iconImage}
            />
          ),
        }}
      />
      <Screen
        name="EditListing"
        component={EditListing}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('EditListing')}
              style={styles.icon}
            >
              <Image source={addIcon} style={styles.iconImage} />
            </TouchableOpacity>
          ),
        }}
      />
      <Screen
        name="Inbox"
        component={Inbox}
        options={{
          tabBarLabel: t('BottomTab.inbox'),
          tabBarIcon: ({ focused }) => (
            <Image
              tintColor={focused ? colors.marketplaceColor : colors.grey}
              source={inboxIcon}
              style={styles.iconImage}
            />
          ),
        }}
      />
      <Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: t('BottomTab.profile'),
          tabBarIcon: ({ focused }) => (
            <Image
              tintColor={focused ? colors.marketplaceColor : colors.grey}
              source={profileIcon}
              style={styles.iconImage}
            />
          ),
        }}
      />
    </Navigator>
  );
};
const styles = StyleSheet.create({
  icon: {
    height: widthScale(54),
    width: widthScale(54),
    borderRadius: widthScale(22),
    position: 'absolute',
    bottom: widthScale(5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.marketplaceColor,
    overflow: 'hidden',
  },
  iconText: {
    fontSize: fontScale(12),
  },
  iconImage: { height: widthScale(25), width: widthScale(25) },
});
