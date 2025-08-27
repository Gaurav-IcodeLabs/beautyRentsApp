import { createInstance } from 'sharetribe-flex-sdk';
import sharetribeTokenStore from './sharetribeTokenStore';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import * as reducers from '../src/slices';
import * as storage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';
import { SDK } from './appTypes';

export const SHARETRIBE_SDK_CLIENT_ID =
  process.env.REACT_NATIVE_SHARETRIBE_SDK_CLIENT_ID;
export const SHARETRIBE_SDK_CLIENT_SECRET =
  process.env.REACT_NATIVE_SHARETRIBE_SDK_CLIENT_SECRET;

export const sdk: SDK = createInstance({
  clientId: SHARETRIBE_SDK_CLIENT_ID ?? '',
  tokenStore: sharetribeTokenStore({
    clientId: SHARETRIBE_SDK_CLIENT_ID ?? '',
  }),
  clientSecret: SHARETRIBE_SDK_CLIENT_SECRET ?? '',
});

const rootReducer = combineReducers({
  ...reducers,
});

const persistConfig = {
  key: 'root',
  // Use the ExpoFileSystemStorage as the storage engine
  storage: storage.default,
  whitelist: ['user'],
  version: 0,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: sdk,
      },
      immutableCheck: true,
      serializableCheck: false,
    }),
});

const persistor = persistStore(store);

export { store, persistor };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
