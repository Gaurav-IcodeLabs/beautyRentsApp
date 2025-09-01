import { FlatList, Image, Modal, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { getTabsData } from './helper';
import { useTranslation } from 'react-i18next';
import { SettingsScreenProps } from '../../appTypes';
import { Button, ScreenHeader } from '../../components';
import SettingTab from './components/SettingTab';
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup';
import { logout, logoutInProgressSelector } from '../../slices/auth.slice';
import { Screens } from '../../appTypes';
import { colors, fontWeight } from '../../theme';
import { CommonActions } from '@react-navigation/native';
import { fontScale, screenWidth, widthScale } from '../../util';
import { logoutIcon } from '../../assets';
import { lightenColor } from '../../util/data';

interface TabItemType {
  key: number;
  label: string;
  screen: Screens;
}

const seperator = () => <View style={styles.divider} />;

export const Settings: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const tabs = getTabsData();
  const dispatch = useAppDispatch();
  const loader = useTypedSelector(logoutInProgressSelector);
  const [showModal, setShowModal] = React.useState(false);

  const signOut = async () => {
    const res = await dispatch(logout({}));
    if (!!res?.payload) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        }),
      );
    }
  };
  const handleOnPress = (item: TabItemType) => {
    if (item.key === 10) {
      setShowModal(true);
    } else {
      if (item?.screen) {
        navigation.navigate(item.screen);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('Settings.title')} />
      <FlatList
        data={tabs}
        keyExtractor={item => String(item.key)}
        ItemSeparatorComponent={seperator}
        renderItem={({ item }) => (
          <SettingTab
            lable={item.lable}
            screen={item.screen}
            icon={item?.icon}
            onTabPress={() => handleOnPress(item)}
          />
        )}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalWrapper}>
          <View style={styles.contentContainer}>
            <View style={styles.imageSection}>
              <Image source={logoutIcon} />
            </View>
            <Text style={styles.modalHeading}>
              {t('Settings.logoutHeading')}
            </Text>
            <Text style={styles.modalDesc}>{t('Settings.logoutDesc')}</Text>
            <Button
              text="Settings.logout"
              onPress={signOut}
              style={styles.btn}
            />
            <Button
              text="FilterForm.cancel"
              onPress={() => setShowModal(false)}
              style={[styles.btnCancel]}
              textStyle={styles.textCancel}
              loading={loader}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.grey,
    marginHorizontal: widthScale(16),
  },
  modalWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  contentContainer: {
    backgroundColor: colors.white,
    width: screenWidth - widthScale(40),
    borderRadius: widthScale(16),
    padding: widthScale(20),
  },
  imageSection: {
    alignSelf: 'center',
    backgroundColor: lightenColor(colors.marketplaceColor, 5),
    width: widthScale(40),
    height: widthScale(40),
    borderRadius: widthScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeading: {
    marginVertical: widthScale(5),
    textAlign: 'center',
    color: colors.black,
    fontSize: fontScale(24),
    fontWeight: fontWeight.semiBold,
  },
  modalDesc: {
    textAlign: 'center',
    color: colors.grey,
    fontSize: fontScale(16),
    fontWeight: fontWeight.normal,
  },
  btn: {
    marginTop: widthScale(10),
  },
  btnCancel: {
    marginTop: widthScale(10),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  textCancel: {
    color: colors.black,
  },
});
