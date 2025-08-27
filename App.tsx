// import React, { useEffect, useState } from 'react';
// import { persistor, store } from './src/sharetribeSetup';
// import { fetchAppAssets } from './src/slices/hostedAssets.slice';
// import { fetchCurrentUser } from './src/slices/user.slice';
// import i18next from 'i18next';
// import { AppNavigator } from './src/navigators';
// import {
//   initialWindowMetrics,
//   SafeAreaProvider,
// } from 'react-native-safe-area-context';
// import { StyleSheet } from 'react-native';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { ConfigurationProvider } from './src/context';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import { KeyboardProvider } from 'react-native-keyboard-controller';

// const App = () => {
//   // const [config, setConfig] = useState(null);

//   // useEffect(() => {
//   //   store
//   //     .dispatch(fetchAppAssets({}))
//   //     .unwrap()
//   //     .then(async res => {
//   //       if (res.appConfig) {
//   //         console.log('Assets fetched');
//   //         store.dispatch(fetchCurrentUser({}));
//   //         if (res.translations) {
//   //           i18next.addResourceBundle(
//   //             'en',
//   //             'translation',
//   //             res.translations,
//   //             false,
//   //             true,
//   //           );
//   //         }
//   //         setConfig({
//   //           appConfig: res.appConfig,
//   //           colors: res.appConfig.branding,
//   //         });
//   //       }
//   //     });
//   // }, []);

//   // if (config === null) {
//   //   console.log('first');
//   //   return null;
//   // }
//   // console.log('config', config);
//   // console.log('config called');

//   // return (
//   //   <SafeAreaProvider initialMetrics={initialWindowMetrics}>
//   //     <GestureHandlerRootView style={styles.container}>
//   //       <ConfigurationProvider value={config?.appConfig}>
//   //         <Provider store={store}>
//   //           <PersistGate loading={null} persistor={persistor}>
//   //             <KeyboardProvider>
//   //               <AppNavigator />
//   //             </KeyboardProvider>
//   //           </PersistGate>
//   //         </Provider>
//   //       </ConfigurationProvider>
//   //     </GestureHandlerRootView>
//   //   </SafeAreaProvider>
//   // );
//   return <App />;
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });
// export default App;
import React from 'react';
import App from './src/app';

export default function AppTemplate() {
  return <App />;
}
