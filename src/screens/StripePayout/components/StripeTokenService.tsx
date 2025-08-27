import { WebView } from 'react-native-webview'
import {
  getStripeTokens,
  html,
} from '../../../scripts/StripeAccountTokenScripts'
import React from 'react'

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
  function onMessage(e) {
    const { onSuccess, onCloseModal } = props
    const { data } = e.nativeEvent
    console.log('here data', data)
    if (data.includes('Error:')) {
      onSuccess(new Error())
      onCloseModal()
    } else {
      onSuccess({
        accountToken: data,
      })
      onCloseModal()
    }
  }

  const { isVisible, stripeData } = props
  if (isVisible) {
    return (
      <WebView
        source={{
          html,
          baseUrl: `${process.env.EXPO_PUBLIC_SDK_BASE_URL}`,
        }}
        injectedJavaScript={getStripeTokens(stripeData)}
        onMessage={onMessage}
      />
    )
  }

  return null
}

export default StripeTokenService
