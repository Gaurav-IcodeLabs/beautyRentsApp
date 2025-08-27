import queryString from 'query-string'
import { types as sdkTypes } from './sdkLoader'

const { LatLng, LatLngBounds } = sdkTypes

export const parseFloatNum = str => {
  const trimmed = str && typeof str.trim === 'function' ? str.trim() : null
  if (!trimmed) {
    return null
  }
  const num = parseFloat(trimmed)
  const isNumber = !isNaN(num)
  const isFullyParsedNum = isNumber && num.toString() === trimmed
  return isFullyParsedNum ? num : null
}

export const decodeLatLng = str => {
  const parts = str.split(',')
  if (parts.length !== 2) {
    return null
  }
  const lat = parseFloatNum(parts[0])
  const lng = parseFloatNum(parts[1])
  if (lat === null || lng === null) {
    return null
  }
  return new LatLng(lat, lng)
}

export const decodeLatLngBounds = str => {
  const parts = str.split(',')
  if (parts.length !== 4) {
    return null
  }
  const ne = decodeLatLng(`${parts[0]},${parts[1]}`)
  const sw = decodeLatLng(`${parts[2]},${parts[3]}`)
  if (ne === null || sw === null) {
    return null
  }
  return new LatLngBounds(ne, sw)
}

/**
 * Parse a URL search query. Converts numeric values into numbers,
 * 'true' and 'false' as booleans, and serialised LatLng and
 * LatLngBounds into respective instances based on given options.
 *
 * @param {String} search - query string to parse, optionally with a
 * leading '?' or '#' character
 *
 * @param {Object} options - Options for parsing:
 *
 * - latlng {Array<String} keys to parse as LatLng instances, null if
 *   not able to parse
 * - latlngBounds {Array<String} keys to parse as LatLngBounds
 *   instances, null if not able to parse
 *
 * @return {Object} key/value pairs parsed from the given String
 */
export const parse = (search, options = {}) => {
  const { latlng = [], latlngBounds = [] } = options
  const params = queryString.parse(search)
  return Object.keys(params).reduce((result, key) => {
    const val = params[key]
    /* eslint-disable no-param-reassign */
    if (latlng.includes(key)) {
      result[key] = decodeLatLng(val)
    } else if (latlngBounds.includes(key)) {
      result[key] = decodeLatLngBounds(val)
    } else if (val === 'true') {
      result[key] = true
    } else if (val === 'false') {
      result[key] = false
    } else {
      const num = parseFloatNum(val)
      result[key] = num === null ? val : num
    }
    /* eslint-enable no-param-reassign */
    return result
  }, {})
}
