import {Alert, Linking, Platform} from 'react-native';
import {
  check,
  RESULTS,
  request,
  openSettings,
  Permission,
} from 'react-native-permissions';
import i18n from 'i18next';

// Request OS permission; not a React hook on purpose
export const requestPermission = async (permission: Permission) => {
  const status = await check(permission);
  switch (status) {
    case RESULTS.UNAVAILABLE:
      return 'granted';
      break;
    case RESULTS.DENIED:
      const result = await request(permission);
      if (result === 'blocked' && Platform.OS === 'android') showAlert();
      return result;
    case RESULTS.LIMITED:
      break;
    case RESULTS.GRANTED:
      return RESULTS.GRANTED;
    case RESULTS.BLOCKED:
      currentLocationAlert();
  }
};
const openAppSettings = () => {
  try {
    return openSettings();
  } catch (err) {
    console.log('ERROR IN open settings ', err);
  }
};
const showAlert = () => {
  const t = i18n.t.bind(i18n);
  Alert.alert(t('UsePermission.alert'), t('UsePermission.alertMessage'), [
    {text: t('Common.alertCancel')},
    {
      text: t('UsePermission.openSettings'),
      onPress: async () => {
        await openAppSettings();
      },
    },
  ]);
};
export const currentLocationAlert = () => {
  const t = i18n.t.bind(i18n);
  Alert.alert(
    `${t('ProfilePage.alert')}`,
    `${t('ProfilePage.currentAccessBlocked')}`,
    [
      {
        text: `${t('ProfilePage.cancel')}`,
        onPress: () => {
          console.log('Cancel Pressed');
        },
        style: 'cancel',
      },
      {
        text: `${t('ProfilePage.goToSettings')}`,
        onPress: () => {
          if (Platform.OS === 'android') {
            Linking.openSettings();
          } else {
            Linking.openURL('app-settings:');
          }
        },
      },
    ],
  );
};
