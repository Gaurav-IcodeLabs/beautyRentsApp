import { z } from 'zod'
import {
  addScopePrefix,
  EXTENDED_DATA_SCHEMA_TYPES,
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_LONG,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
} from '../../util'

const getFieldValue = (
  data: any,
  key: string,
  schemaType = SCHEMA_TYPE_TEXT,
) => {
  const value = data?.[key]
  if (
    schemaType === SCHEMA_TYPE_TEXT ||
    schemaType === SCHEMA_TYPE_ENUM ||
    schemaType === SCHEMA_TYPE_LONG
  ) {
    return value != null ? value : ''
  } else if (schemaType === SCHEMA_TYPE_MULTI_ENUM) {
    return value != null ? value : []
  }
}

export const initialValuesForUserFields = (
  data,
  targetScope,
  targetUserType,
  userFieldConfigs,
) => {
  return userFieldConfigs.reduce((fields, field) => {
    const { key, userTypeConfig, scope = 'public', schemaType } = field || {}
    const namespacedKey = addScopePrefix(scope, key)
    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType)
    const isTargetScope = scope === targetScope
    const isTargetUserType =
      !userTypeConfig?.limitToUserTypeIds ||
      userTypeConfig?.userTypeIds?.includes(targetUserType)

    if (isKnownSchemaType && isTargetScope && isTargetUserType) {
      const fieldValue = getFieldValue(data, key)
      return { ...fields, [namespacedKey]: fieldValue }
    }
    return fields
  }, {})
}

export const getSchema = (userTypeConfig, userType, userFieldProps = [], t) => {
  const { displayInSignUp: showDisplayName, required: displayNameRequired } =
    userTypeConfig?.displayNameSettings || {}

  const conditionalFields = userFieldProps.reduce(
    (acc, { key: field, fieldConfig }) => {
      const {
        defaultRequiredMessage,
        saveConfig: { displayInSignUp, isRequired },
        schemaType,
        minimum,
        maximum,
        enumOptions,
      } = fieldConfig

      if (!displayInSignUp) {
        return acc // Skip if field is not displayed in signup
      }

      let fieldSchema
      switch (schemaType) {
        case SCHEMA_TYPE_TEXT:
        case SCHEMA_TYPE_ENUM: // Enum can reuse text validation
          fieldSchema = z.string()
          if (isRequired) {
            fieldSchema = fieldSchema.min(3, defaultRequiredMessage)
          } else {
            fieldSchema = fieldSchema.optional()
          }
          break
        case SCHEMA_TYPE_LONG:
          fieldSchema = z.string()
          if (isRequired) {
            fieldSchema = fieldSchema.min(
              minimum,
              t('CustomExtendedDataField.numberTooSmall'),
            )
            // .max(maximum, t('CustomExtendedDataField.numberTooBig'))   // TODO-H: Add max validation
          } else {
            fieldSchema = fieldSchema.optional()
          }
          break
        case SCHEMA_TYPE_MULTI_ENUM:
          fieldSchema = z.array(z.string())
          if (isRequired) {
            fieldSchema = fieldSchema.min(1, defaultRequiredMessage)
          } else {
            fieldSchema = fieldSchema.optional()
          }
          break
        default:
          fieldSchema = z.string().optional()
      }

      return { ...acc, [field]: fieldSchema }
    },
    {},
  )

  const formSchema = z.object({
    firstName: z.string().min(1, t('ProfileSettingsForm.firstNameRequired')),
    lastName: z.string().min(1, t('ProfileSettingsForm.lastNameRequired')),
    displayName:
      showDisplayName && displayNameRequired
        ? z.string().min(3, t('ProfileSettingsForm.displayNameRequired'))
        : z.string().optional(),
    ...conditionalFields,
  })

  return formSchema
}
