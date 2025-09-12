import {z} from 'zod';

const initialState = {
  name: '',
  addressLine2: '',
  addressLine1: '',
  city: '',
  country: '',
  postal: 0,
};

const getSchema = (t: (_: string) => string) => {
  const schema = {
    addressLine1: z.string().min(1, {
      message: t('StripePaymentAddress.addressLine1Required') as string,
    }),
    name: z.string(),
    addressLine2: z.string(),
    city: z
      .string()
      .min(1, {message: t('StripePaymentAddress.cityRequired') as string}),
    country: z
      .string()
      .min(1, {message: t('StripePaymentAddress.countryRequired') as string}),
    postal: z.number().min(1, {
      message: t('StripePaymentAddress.postalCodeRequired') as string,
    }),
  };
  return z.object(schema);
};

interface StripeCustomer {
  attributes: {
    stripeCustomerId: string;
  };
  defaultPaymentMethod: string | null;
  id: {
    _sdkType: string;
    uuid: string;
  };
  type: string;
}

interface BillingDetails {
  name: string;
  country: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  postal: number;
}

export type {BillingDetails, StripeCustomer};
export {getSchema, initialState};
