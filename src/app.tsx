import React, { useEffect, useState } from 'react';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { persistor, store } from './sharetribeSetup';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { fetchAppAssets } from './slices/hostedAssets.slice';
import { StyleSheet } from 'react-native';
import { AppNavigator } from './navigators';
import { ColorsProvider, ConfigurationProvider } from './context';
import { mergeColors } from './theme';
// import i18n from 'i18next';
import { mergeTranslations } from './locales';
import { fetchCurrentUser } from './slices/user.slice';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import i18n from './locales/index';
import { hideSplash } from 'react-native-splash-view';

const App = () => {
  const [config, setConfig] = useState(null);
  useEffect(() => {

    setTimeout(() => {
      hideSplash(); // Hide after some time
    }, 1500);

    const loadAssets = async () => {
      try {
        const res = await store.dispatch(fetchAppAssets({})).unwrap();

        if (res.appConfig) {
          i18n.addResourceBundle(
            'en',
            'translation',
            mergeTranslations(res.translations),
          );

          setConfig({
            appConfig: res.appConfig,
            colors: mergeColors(res.appConfig.branding),
          });

          store.dispatch(fetchCurrentUser({}));
        }
      } catch (err) {
        console.error('Failed to load app assets:', err);
      }
    };

    loadAssets();
  }, []);

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything.
  if (config === null) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={styles.container}>
        <ConfigurationProvider value={config?.appConfig}>
          <ColorsProvider value={config.colors}>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <KeyboardProvider>
                  <AppNavigator />
                </KeyboardProvider>
              </PersistGate>
            </Provider>
          </ColorsProvider>
        </ConfigurationProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
