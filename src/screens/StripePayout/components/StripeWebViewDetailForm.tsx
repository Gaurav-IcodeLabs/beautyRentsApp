import {ActivityIndicator, Alert, Modal, StyleSheet, View} from 'react-native';
import React, {FC, useState} from 'react';
import WebView from 'react-native-webview';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAppDispatch} from '../../../sharetribeSetup';
import {fetchStripeAccount} from '../../../slices/StripeConnectAccount.slice';

type StripeWebViewPropTypes = {
  webViewUrl: string;
  isVisible: boolean;
  setVisible: any;
};

const StripeWebViewDetailForm: FC<StripeWebViewPropTypes> = props => {
  const {webViewUrl, isVisible, setVisible} = props;
  const {top} = useSafeAreaInsets();
  const [isWebLoading, setWebLoading] = useState(false);
  const dispatch = useAppDispatch();

  const onNavigationStateChangeEffectWebView = async (e: {url: string}) => {
    if (
      e?.url?.includes(
        `${process.env.REACT_NATIVE_SDK_BASE_URL}/account/payments/success`,
      )
    ) {
      setVisible({
        show: false,
        url: '',
      });
      dispatch(fetchStripeAccount());
    } else if (
      e?.url?.includes(
        `${process.env.REACT_NATIVE_SDK_BASE_URL}/account/payments/failure`,
      )
    ) {
      setVisible({
        show: false,
        url: '',
      });
      dispatch(fetchStripeAccount());
    }
  };

  return (
    <View style={styles.flex}>
      <Modal visible={isVisible} animationType="slide">
        <View
          style={[
            styles.flex,
            {paddingTop: top},
            isWebLoading && styles.center,
          ]}>
          {isWebLoading && (
            <ActivityIndicator
              style={styles.abso}
              color={'black'}
              size={'small'}
            />
          )}
          <WebView
            onLoadStart={() => setWebLoading(true)}
            onLoadEnd={() => {
              setWebLoading(false);
            }}
            source={{uri: webViewUrl}}
            onNavigationStateChange={e => {
              onNavigationStateChangeEffectWebView(e);
            }}
            onError={() => {
              Alert.alert('Something Went Wrong', 'Please Try Again Later');
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

export default StripeWebViewDetailForm;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  abso: {position: 'absolute', bottom: '48%', right: '48%', zIndex: 10},
});
