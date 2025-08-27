/**
 * Create the name of the query parameter.
 *
 * @param {String} key Key extracted from listingExtendData config.
 * @param {String} scope Scope extracted from listingExtendData config.
 */
export const constructQueryParamName = (key, scope) => {
  const prefixedKey = scope === 'meta' ? `meta_${key}` : `pub_${key}`
  return prefixedKey.replace(/\s/g, '_')
}
