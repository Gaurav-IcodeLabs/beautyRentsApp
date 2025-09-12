import {NativeStackScreenProps} from '@react-navigation/native-stack';

export type AppStackParamList = {
  SignUp: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  EditListing: undefined;
  RecoverPassword: undefined;
  Search: undefined;
  Listing: undefined;
  Inbox: undefined;
  Profile: undefined;
  PayoutSetup: undefined;
  Settings: undefined;
  ResetPassword: undefined;
  Main: undefined;
  ProfileSettings: undefined;
  PaymentMethods: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  About: undefined;
  ContactDetails: undefined;
  PasswordSettings: undefined;
  DeleteAccount: undefined;
  SearchListingMap: undefined;
  OtherUserProfile: undefined;
  WishList: undefined;
  Checkout: undefined;
  Transaction: undefined;
};

export type SignupScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'SignUp'
>;
export type LoginScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'Login'
>;
export type HomeScreenProps = NativeStackScreenProps<AppStackParamList, 'Home'>;
export type EditListingScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'EditListing'
>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'ForgotPassword'
>;
export type SetNewPasswordScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'RecoverPassword'
>;
export type SearchScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'Search'
>;
export type ListingScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'Listing'
>;
export type InboxScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'Inbox'
>;
export type ProfileScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'Profile'
>;
export type ResetPasswordScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'ResetPassword'
>;
export type MainScreenProps = NativeStackScreenProps<AppStackParamList, 'Main'>;
export type SettingsScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'Settings'
>;
export type ProfileSettingsScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'ProfileSettings'
>;
export type ContactDetailsProps = NativeStackScreenProps<
  AppStackParamList,
  'ContactDetails'
>;
export type PasswordSettingsProps = NativeStackScreenProps<
  AppStackParamList,
  'PasswordSettings'
>;
export type DeleteAccountProps = NativeStackScreenProps<
  AppStackParamList,
  'PasswordSettings'
>;
export type SearchListingMapProps = NativeStackScreenProps<
  AppStackParamList,
  'SearchListingMap'
>;
