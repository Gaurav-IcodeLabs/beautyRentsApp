import {WebView} from 'react-native-webview';
import {
  getStripeTokens,
  html,
} from '../../../scripts/StripeAccountTokenScripts';
import React from 'react';
import {View} from 'react-native';

/**
 * Creates a StripeTokenService object.
 *
 * @param {Object} props - The properties object.
 * @param {Function} props.onSuccess - The success callback function.
 * @param {Function} props.onCloseModal - The close modal callback function.
 * @param {boolean} props.isVisible - Indicates whether the component is visible.
 * @param {Object} props.stripeData - The stripe data object.
 * @return {JSX.Element} The rendered component.
 */

function StripeTokenService(props) {
  const {isVisible, stripeData} = props;
  function onMessage(e) {
    const {onSuccess, onCloseModal} = props;
    const {data} = e.nativeEvent;
    console.log('here data', data);
    if (data.includes('Error:')) {
      onSuccess(new Error());
      onCloseModal();
    } else {
      onSuccess({
        accountToken: data,
      });
      onCloseModal();
    }
  }

  if (isVisible) {
    return (
      <View
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          height: 0,
          overflow: 'hidden',
        }}>
        <WebView
          source={{
            html,
            baseUrl: `${process.env.REACT_NATIVE_SDK_BASE_URL}`,
          }}
          injectedJavaScript={getStripeTokens(stripeData)}
          onMessage={onMessage}
        />
      </View>
    );
  }
  return null;
}

export default StripeTokenService;
