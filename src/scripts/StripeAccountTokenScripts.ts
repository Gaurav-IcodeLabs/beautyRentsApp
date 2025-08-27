export const html = `<script src="https://js.stripe.com/v3/"></script>`

/**
 * Retrieves the Stripe tokens for a given data object.
 *
 * @param {any} data - The data object.
 * @return {void}
 */
export function getStripeTokens(data: any) {
  return `
    const stripe = window.Stripe("${process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}");
    async function getTokenAccount() {
      const res = await stripe.createToken("account", {
        business_type:'${data.accountType}',
        tos_shown_and_accepted: true,
      });
      if (res.error) {
        throw res.error.message;
      }
        
      return res.token.id;
    }
    async function getTokens() {
      try {
        const accountToken = await getTokenAccount();
        window.ReactNativeWebView.postMessage(accountToken);
      } catch (err) {
        window.ReactNativeWebView.postMessage("Error: " + err);
      }
    }
  getTokens();
  true;
  `
}
