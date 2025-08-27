import { Screens } from '../../appTypes';
import {
  aboutIcon,
  cardIcon,
  deleteIcon,
  editIcon,
  lockIcon,
  logoutIcon,
  payoutIcon,
  privacyIcon,
  profileIcon,
  termsIcon,
} from '../../assets';

export const getTabsData = () => {
  return [
    {
      key: 1,
      screen: Screens.PROFILESETTINGS,
      lable: 'Settings.profileSettings',
      icon: editIcon,
    },
    {
      key: 2,
      screen: Screens.CONTACTDETAILS,
      lable: 'Settings.contactDetails',
      icon: profileIcon,
    },
    {
      key: 3,
      screen: Screens.PASSWORDSETTINGS,
      lable: 'Settings.passwordSettings',
      icon: lockIcon,
    },
    {
      key: 4,
      screen: Screens.PAYOUTSETUP,
      lable: 'Settings.payoutDetails',
      icon: payoutIcon,
    },
    {
      key: 5,
      screen: Screens.PAYMENTMETHODS,
      lable: 'Settings.paymentMethods',
      icon: cardIcon,
    },
    {
      key: 6,
      screen: Screens.TERMSOFSERVICE,
      lable: 'Settings.TermsOfService',
      icon: termsIcon,
    },
    {
      key: 7,
      screen: Screens.PRIVACYPOLICY,
      lable: 'Settings.privacyPolicy',
      icon: privacyIcon,
    },
    {
      key: 8,
      screen: Screens.ABOUT,
      lable: 'Settings.about',
      icon: aboutIcon,
    },
    {
      key: 9,
      screen: Screens.DELETEACCOUNT,
      lable: 'Settings.DeleteYourAccount',
      icon: deleteIcon,
    },
    {
      key: 10,
      screen: null,
      lable: 'Settings.logout',
      icon: logoutIcon,
    },
  ];
};

export const redTabs = ['Settings.DeleteYourAccount', 'Settings.logout'];
