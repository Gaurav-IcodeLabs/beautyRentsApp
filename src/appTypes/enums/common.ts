/* eslint-disable no-unused-vars */
export enum Headings {
  HEADING1 = 'heading1',
  HEADING2 = 'heading2',
  HEADING3 = 'heading3',
  HEADING4 = 'heading4',
  HEADING5 = 'heading5',
  HEADING6 = 'heading6',
}

export enum AssetNames {
  TERMS_OF_SERVICE = 'terms-of-service',
  PRIVACY_POLICY = 'privacy-policy',
  ABOUT = 'about',
}

export enum ReviewTypeAndState {
  REVIEW_TYPE_OF_PROVIDER = 'ofProvider',
  REVIEW_TYPE_OF_CUSTOMER = 'ofCustomer',
  REVIEW_STATE_PUBLIC = 'public',
  REVIEW_STATE_PENDING = 'pending',
}

export enum Screens {
  SIGNUP = 'SignUp',
  LOGIN = 'Login',
  FORGOTPASSWORD = 'ForgotPassword',
  HOME = 'Home',
  EDITLISTING = 'EditListing',
  RECOVERPASSWORD = 'RecoverPassword',
  SEARCH = 'Search',
  LISTING = 'Listing',
  INBOX = 'Inbox',
  PROFILE = 'Profile',
  SETTINGS = 'Settings',
  PROFILESETTINGS = 'ProfileSettings',
  RESETPASSWORD = 'ResetPassword',
  MAIN = 'Main',
  CONTACTDETAILS = 'ContactDetails',
  TERMSOFSERVICE = 'TermsOfService',
  PRIVACYPOLICY = 'PrivacyPolicy',
  ABOUT = 'About',
  PASSWORDSETTINGS = 'PasswordSettings',
  DELETEACCOUNT = 'DeleteAccount',
  PAYMENTMETHODS = 'PaymentMethods',
  PAYOUTSETUP = 'PayoutSetup',
  WISHLIST = 'WishList',
}

export enum ListingSortKeys {
  NEWEST = 'createdAt',
  OLDEST = '-createdAt',
  LOWEST_PRICE = '-price',
  HIGHEST_PRICE = 'price',
  RELEVANCE = 'relevance',
}
