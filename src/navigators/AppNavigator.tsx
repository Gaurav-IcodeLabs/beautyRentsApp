import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { AppStackParamList } from '../appTypes';
import * as Screens from '../screens';
import { useTypedSelector } from '../sharetribeSetup';
import { currentUserIdSelector } from '../slices/user.slice';
import { Linking } from 'react-native';
/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 *   https://reactnavigation.org/docs/typescript/#organizing-types
 */

export type AppStackScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;
export const navigationRef = createNavigationContainerRef();
// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack = () => {
  const currentUserId = useTypedSelector(currentUserIdSelector);
  // const linking = {
  //   prefixes: [
  //     'app-template://',
  //     'https://demo.icodestaging.in',
  //     'exp://192.168.1.33:8081',
  //   ],
  // };
  // useEffect(() => {
  //   const handleInitialURL = async () => {
  //     const initialUrl = await Linking.getInitialURL();
  //     if (initialUrl) {
  //       handleUrl(initialUrl);
  //     }
  //   };
  //   handleInitialURL();
  // }, []);

  // useEffect(() => {
  //   const handleNewUrl = (event: { url: string }) => {
  //     handleUrl(event.url);
  //   };
  //   const subscription = Linking.addEventListener('url', handleNewUrl);
  //   return () => {
  //     subscription.remove();
  //   };
  // }, []);

  // const handleUrl = (url: string) => {
  //   const parsedUrl = Linking.parse(url);

  //   if (parsedUrl.path === 'reset-password') {
  //     navigationRef.current?.navigate('ResetPassword', {
  //       email: parsedUrl.queryParams?.e,
  //       passwordResetToken: parsedUrl.queryParams?.t,
  //     });
  //   }
  //   if (parsedUrl.path === 'verify-email') {
  //     if (!currentUserId) return;
  //     if (parsedUrl.queryParams?.t) {
  //       const token = parsedUrl.queryParams.t;
  //       navigationRef.current?.navigate('ContactDetails', {
  //         verificationToken: token,
  //       });
  //     }
  //   }
  // };

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, gestureEnabled: false }}
      initialRouteName={currentUserId ? 'Main' : 'Login'}
    >
      <Stack.Screen name="SignUp" component={Screens.SignUp} />
      <Stack.Screen name="Login" component={Screens.Login} />
      <Stack.Screen
        name="RecoverPassword"
        component={Screens.RecoverPassword}
      />
      <Stack.Screen name="Main" component={Screens.BottomNavigator} />
      <Stack.Screen name="Home" component={Screens.Home} />
      <Stack.Screen name="EditListing" component={Screens.EditListing} />
      <Stack.Screen name="Search" component={Screens.Search} />
      <Stack.Screen name="Listing" component={Screens.Listing} />
      <Stack.Screen name="Inbox" component={Screens.Inbox} />
      <Stack.Screen name="Settings" component={Screens.Settings} />
      {/* <Stack.Screen name="PaymentMethods" component={Screens.PaymentMethods} /> */}
      <Stack.Screen name="Profile" component={Screens.Profile} />
      <Stack.Screen name="TermsOfService" component={Screens.TermsOfService} />
      <Stack.Screen name="PrivacyPolicy" component={Screens.PrivacyPolicy} />
      <Stack.Screen name="About" component={Screens.About} />
      <Stack.Screen name="ResetPassword" component={Screens.ResetPassword} />
      {/* <Stack.Screen name="PayoutSetup" component={Screens.PayoutSetup} /> */}
      <Stack.Screen name="ContactDetails" component={Screens.ContactDetails} />
      <Stack.Screen name="DeleteAccount" component={Screens.DeleteAccount} />
      <Stack.Screen
        name="PasswordSettings"
        component={Screens.PasswordSettings}
      />
      <Stack.Screen
        name="ProfileSettings"
        component={Screens.ProfileSettings}
      />
      {/* <Stack.Screen name="Transaction" component={Screens.Transaction} />
      <Stack.Screen name="Checkout" component={Screens.Checkout} /> */}
      <Stack.Screen
        name="SearchListingMap"
        component={Screens.SearchListingMap}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <AppStack />
    </NavigationContainer>
  );
};
