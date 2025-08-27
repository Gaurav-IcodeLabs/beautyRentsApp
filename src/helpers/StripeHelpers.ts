// /* eslint-disable react/react-in-jsx-scope */
// import { useTranslation } from 'react-i18next'
// import { Text, View } from 'react-native'
// import { isStripeError } from '../util/errors'
import { supportedCountries } from '../config/configStripe'

// Get attribute: stripeAccountData
export const getStripeAccountData = (stripeAccount: any) =>
  stripeAccount.attributes.stripeAccountData || null

// Get last 4 digits of bank account returned in Stripe account
export const getBankAccountLast4Digits = (stripeAccountData: any) =>
  stripeAccountData && stripeAccountData.external_accounts.data.length > 0
    ? stripeAccountData.external_accounts.data[0].last4
    : null

// Check if there's requirements on selected type: 'past_due', 'currently_due' etc.
export const hasRequirements = (stripeAccountData: any, requirementType: any) =>
  stripeAccountData != null &&
  stripeAccountData.requirements &&
  Array.isArray(stripeAccountData.requirements[requirementType]) &&
  stripeAccountData.requirements[requirementType].length > 0

/**
 * Renders an error message based on the given props.
 *
 * @param {object} props - The props object containing stripeAccountError and stripeAccountLinkError.
 * @return {ReactNode} The error message component or null.
 */
// export const ErrorsMaybe = (props: any) => {
//   const {t} = useTranslation();
//   const {stripeAccountError, stripeAccountLinkError} = props;
//   const errorMessage = isStripeError(stripeAccountError) ? (
//     <Text>
//       {t('StripeConnectAccountForm.createStripeAccountFailedWithStripeError')}
//     </Text>
//   ) : stripeAccountError ? (
//     <Text>{t('StripeConnectAccountForm.createStripeAccountFailed')}</Text>
//   ) : isStripeError(stripeAccountLinkError) ? (
//     <Text>
//       {t(
//         'StripeConnectAccountForm.createStripeAccountLinkFailedWithStripeError',
//       )}
//     </Text>
//   ) : stripeAccountLinkError ? (
//     <Text>{t('StripeConnectAccountForm.createStripeAccountLinkFailed')} </Text>
//   ) : null;

//   return errorMessage ? <View>{errorMessage}</View> : null;
// };

/**
 * Returns the country configuration object for the given country code.
 *
 * @param {any} countryCode - The country code to find the configuration for.
 * @throws {Error} If the country code is not found in the Stripe configuration.
 * @return {any} The country configuration object.
 */
export const stripeCountryConfigs = (countryCode: any) => {
  const country = supportedCountries.find(c => c.code === countryCode)

  if (!country) {
    throw new Error(`Country code not found in Stripe config ${countryCode}`)
  }
  return country
}

/**
 * Retrieves the currency associated with a given country code.
 *
 * @param {any} countryCode - The country code to retrieve the currency for.
 * @return {any} The currency associated with the given country code.
 */
export const countryCurrency = (countryCode: any) => {
  const country = stripeCountryConfigs(countryCode)
  return country.currency
}
