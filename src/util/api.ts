// These helpers are calling this template's own server-side routes
// so, they are not directly calling Marketplace API or Integration API.
// You can find these api endpoints from 'server/api/...' directory
import CookieManager from '@react-native-cookies/cookies'
import appSettings from '../config/settings'
import { types as sdkTypes, transit } from './sdkLoader'
import Decimal from 'decimal.js'
import sharetribeTokenStore from '../sharetribeTokenStore'
import { SHARETRIBE_SDK_CLIENT_ID } from '../sharetribeSetup'
// import CookieManager from '@react-native-cookies/cookies'

export const apiBaseUrl = marketplaceRootURL => {
  // return 'http://192.168.1.37:3500'
  return 'https://demo.icodestaging.in/'

  const port = process.env.REACT_APP_DEV_API_SERVER_PORT
  const useDevApiServer = process.env.NODE_ENV === 'development' && !!port

  // In development, the dev API server is running in a different port
  if (useDevApiServer) {
  }

  // Otherwise, use the given marketplaceRootURL parameter or the same domain and port as the frontend
  return marketplaceRootURL
    ? marketplaceRootURL.replace(/\/$/, '')
    : `${window.location.origin}`
}

// Application type handlers for JS SDK.
//
// NOTE: keep in sync with `typeHandlers` in `server/api-util/sdk.js`
export const typeHandlers = [
  // Use Decimal type instead of SDK's BigDecimal.
  {
    type: sdkTypes.BigDecimal,
    customType: Decimal,
    writer: v => new sdkTypes.BigDecimal(v.toString()),
    reader: v => new Decimal(v.value),
  },
]

const serialize = data => {
  return transit.write(data, {
    typeHandlers,
    verbose: appSettings.sdk.transitVerbose,
  })
}

const deserialize = str => {
  return transit.read(str, { typeHandlers })
}

const methods = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
}

// If server/api returns data from SDK, you should set Content-Type to 'application/transit+json'
const request = (path, options = {}, token = '') => {
  const url = `${apiBaseUrl()}${path}`
  const { credentials, headers, body, ...rest } = options
  // If headers are not set, we assume that the body should be serialized as transit format.
  const shouldSerializeBody =
    (!headers || headers['Content-Type'] === 'application/transit+json') && body
  const bodyMaybe = shouldSerializeBody ? { body: serialize(body) } : {}

  const fetchOptions = {
    credentials: credentials || 'include',
    // Since server/api mostly talks to Marketplace API using SDK,
    // we default to 'application/transit+json' as content type (as SDK uses transit).
    headers: headers || {
      'Content-Type': 'application/transit+json',
      ...(token ? { Cookie: token } : {}),
    },
    ...bodyMaybe,
    ...rest,
  }

  return fetch(url, fetchOptions).then(res => {
    const contentTypeHeader = res.headers.get('Content-Type')
    const contentType = contentTypeHeader
      ? contentTypeHeader.split(';')[0]
      : null

    if (res.status >= 400) {
      return res.json().then(data => {
        let e = new Error()
        e = Object.assign(e, data)

        throw e
      })
    }
    if (contentType === 'application/transit+json') {
      return res.text().then(deserialize)
    } else if (contentType === 'application/json') {
      return res.json()
    }
    return res.text()
  })
}

// Keep the previous parameter order for the post method.
// For now, only POST has own specific function, but you can create more or use request directly.
const post = async (path, body, options = {}) => {
  const requestOptions = {
    ...options,
    method: methods.POST,
    body,
  }

  const token = await sharetribeTokenStore({
    clientId: SHARETRIBE_SDK_CLIENT_ID,
  }).getCookieToken()

  if (token) {
    await CookieManager.clearAll()
  }
  return request(path, requestOptions, token)
}

export const deleteUserAccount = body => {
  return post('/st-plugins/delete-user-account', body)
}

// Fetch transaction line items from the local API endpoint.
//
// See `server/api/transaction-line-items.js` to see what data should
// be sent in the body.
export const transactionLineItems = body => {
  return post('/api/transaction-line-items', body)
}

// Transition a transaction with a privileged transition.
//
// This is similar to the `initiatePrivileged` above. It will use the
// backend for the transition. The backend endpoint will add the
// payment line items to the transition params.
//
// See `server/api/transition-privileged.js` to see what data should
// be sent in the body.
export const transitionPrivileged = (body, token) => {
  return post('/api/transition-privileged', body, token)
}

// Initiate a privileged transaction.
//
// With privileged transitions, the transactions need to be created
// from the backend. This endpoint enables sending the order data to
// the local backend, and passing that to the Marketplace API.
//
// See `server/api/initiate-privileged.js` to see what data should be
// sent in the body.
export const initiatePrivileged = (body, token) => {
  return post('/api/initiate-privileged', body, token)
}
