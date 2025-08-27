import { z } from 'zod';
import {
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_LONG,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
  addScopePrefix,
} from '../../util';

const getSoleUserTypeMaybe = userTypes =>
  Array.isArray(userTypes) && userTypes.length === 1
    ? userTypes[0].userType
    : null;

const getSchema = (userTypeConfig, userType, userFieldProps = [], t) => {
  const { displayInSignUp: showDisplayName, required: displayNameRequired } =
    userTypeConfig?.displayNameSettings || {};
  const { displayInSignUp: showPhoneNumber, required: phoneNumberRequired } =
    userTypeConfig?.phoneNumberSettings || {};

  const conditionalFields = userFieldProps.reduce(
    (acc, { key: field, fieldConfig }) => {
      const {
        defaultRequiredMessage,
        saveConfig: { displayInSignUp, isRequired },
        schemaType,
        minimum,
        maximum,
        enumOptions,
      } = fieldConfig;

      if (!displayInSignUp) {
        return acc; // Skip if field is not displayed in signup
      }

      let fieldSchema;
      switch (schemaType) {
        case SCHEMA_TYPE_TEXT:
        case SCHEMA_TYPE_ENUM: // Enum can reuse text validation
          fieldSchema = z.string();
          if (isRequired) {
            fieldSchema = fieldSchema.min(3, defaultRequiredMessage);
          } else {
            fieldSchema = fieldSchema.optional();
          }
          break;
        case SCHEMA_TYPE_LONG:
          fieldSchema = z.number();
          if (isRequired) {
            fieldSchema = fieldSchema
              .min(
                minimum,
                t('CustomExtendedDataField.numberTooSmall', { min: minimum }),
              )
              .max(
                maximum,
                t('CustomExtendedDataField.numberTooBig', { max: maximum }),
              ); // TODO-H: Add max validation
          } else {
            fieldSchema = fieldSchema.optional();
          }
          break;
        case SCHEMA_TYPE_MULTI_ENUM:
          fieldSchema = z.array(z.string());
          if (isRequired) {
            fieldSchema = fieldSchema.min(1, defaultRequiredMessage);
          } else {
            fieldSchema = fieldSchema.optional();
          }
          break;
        default:
          fieldSchema = z.string().optional();
      }

      return { ...acc, [field]: fieldSchema };
    },
    {},
  );

  const formSchema = z.object({
    email: z.string().email(t('SignupForm.emailInvalid')), //Email required check pending - TODO-M
    fname: z.string().min(1, t('SignupForm.firstNameRequired')),
    lname: z.string().min(1, t('SignupForm.lastNameRequired')),
    password: z.string().min(8, t('SignupForm.passwordRequired')),
    ...(userType ? { userType: z.string().default(userType) } : {}),
    displayName:
      showDisplayName && displayNameRequired
        ? z.string().min(3, t('SignupForm.displayNameRequired'))
        : z.string().optional(),
    phoneNumber:
      showPhoneNumber && phoneNumberRequired
        ? z.string().min(8, t('SignupForm.phoneNumberRequired'))
        : z.string().optional(),
    terms: z.boolean().refine(val => val === true, {
      message: t('SignupForm.termsRequired'),
    }),
    ...conditionalFields,
  });

  return formSchema;
};

const getNonUserFieldParams = (values, userFieldConfigs) => {
  const userFieldKeys = userFieldConfigs.map(({ scope, key }) =>
    addScopePrefix(scope, key),
  );

  return Object.entries(values).reduce((picked, [key, value]) => {
    const isUserFieldKey = userFieldKeys.includes(key);

    return isUserFieldKey
      ? picked
      : {
          ...picked,
          [key]: value,
        };
  }, {});
};

export { getSoleUserTypeMaybe, getSchema, getNonUserFieldParams };
