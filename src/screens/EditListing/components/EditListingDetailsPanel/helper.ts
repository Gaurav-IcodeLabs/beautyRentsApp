import { z } from 'zod';
import {
  EXTENDED_DATA_SCHEMA_TYPES,
  isFieldForCategory,
  isFieldForListingType,
  pickCategoryFields,
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_LONG,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
} from '../../../../util';
import { isBookingProcessAlias } from '../../../../transactions';

/**
 * Check if listingType has already been set.
 *
 * If listing type (incl. process & unitType) has been set, we won't allow change to it.
 * It's possible to make it editable, but it becomes somewhat complex to modify following panels,
 * for the different process. (E.g. adjusting stock vs booking availability settings,
 * if process has been changed for existing listing.)
 *
 * @param {Object} publicData JSON-like data stored to listing entity.
 * @returns object literal with to keys: { hasExistingListingType, existingListingTypeInfo }
 */
const hasSetListingType = publicData => {
  const { listingType, transactionProcessAlias, unitType } = publicData || {};
  const existingListingTypeInfo = {
    listingType,
    transactionProcessAlias,
    unitType,
  };

  return {
    hasExistingListingType:
      !!listingType && !!transactionProcessAlias && !!unitType,
    existingListingTypeInfo,
  };
};

/**
 * Pick extended data fields from given form data.
 * Picking is based on extended data configuration for the listing and target scope and listing type.
 *
 * This expects submit data to be namespaced (e.g. 'pub_') and it returns the field without that namespace.
 * This function is used when form submit values are restructured for the actual API endpoint.
 *
 * Note: This returns null for those fields that are managed by configuration, but don't match target listing type.
 *       These might exists if provider swaps between listing types before saving the draft listing.
 *
 * @param {Object} data values to look through against listingConfig.js and util/configHelpers.js
 * @param {String} targetScope Check that the scope of extended data the config matches
 * @param {String} targetListingType Check that the extended data is relevant for this listing type.
 * @param {Object} listingFieldConfigs an extended data configurtions for listing fields.
 * @returns Array of picked extended data fields from submitted data.
 */
const pickListingFieldsData = (
  data,
  targetScope,
  targetListingType,
  targetCategories,
  listingFieldConfigs,
) => {
  const targetCategoryIds = Object.values(targetCategories);

  return listingFieldConfigs.reduce((fields, fieldConfig) => {
    const { key, scope = 'public', schemaType } = fieldConfig || {};
    const namespacePrefix = scope === 'public' ? `pub_` : `priv_`;
    const namespacedKey = `${namespacePrefix}${key}`;

    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
    const isTargetScope = scope === targetScope;
    const isTargetListingType = isFieldForListingType(
      targetListingType,
      fieldConfig,
    );
    const isTargetCategory = isFieldForCategory(targetCategoryIds, fieldConfig);

    if (
      isKnownSchemaType &&
      isTargetScope &&
      isTargetListingType &&
      isTargetCategory
    ) {
      const fieldValue = data[namespacedKey] || null;
      return { ...fields, [key]: fieldValue };
    } else if (isKnownSchemaType && isTargetScope) {
      // Note: this clears extra custom fields
      // These might exists if provider swaps between listing types before saving the draft listing.
      return { ...fields, [key]: null };
    }
    return fields;
  }, {});
};

/**
 * Get listing configuration. For existing listings, it is stored to publicData.
 * For new listings, the data needs to be figured out from listingTypes configuration.
 *
 * In the latter case, we select first type in the array. However, EditListingDetailsForm component
 * gets 'selectableListingTypes' prop, which it uses to provide a way to make selection,
 * if multiple listing types are available.
 *
 * @param {Array} listingTypes
 * @param {Object} existingListingTypeInfo
 * @returns an object containing mainly information that can be stored to publicData.
 */
const getTransactionInfo = (
  listingTypes,
  existingListingTypeInfo = {},
  inlcudeLabel = false,
) => {
  const { listingType, transactionProcessAlias, unitType } =
    existingListingTypeInfo;

  if (listingType && transactionProcessAlias && unitType) {
    return { listingType, transactionProcessAlias, unitType };
  } else if (listingTypes.length === 1) {
    const { listingType: type, label, transactionType } = listingTypes[0];
    const { alias, unitType: configUnitType } = transactionType;
    const labelMaybe = inlcudeLabel ? { label: label || type } : {};
    return {
      listingType: type,
      transactionProcessAlias: alias,
      unitType: configUnitType,
      ...labelMaybe,
    };
  }
  return {};
};

/**
 * Pick extended data fields from given extended data of the listing entity.
 * Picking is based on extended data configuration for the listing and target scope and listing type.
 *
 * This returns namespaced (e.g. 'pub_') initial values for the form.
 *
 * @param {Object} data extended data values to look through against listingConfig.js and util/configHelpers.js
 * @param {String} targetScope Check that the scope of extended data the config matches
 * @param {String} targetListingType Check that the extended data is relevant for this listing type.
 * @param {Object} listingFieldConfigs an extended data configurtions for listing fields.
 * @returns Array of picked extended data fields
 */
const initialValuesForListingFields = (
  data,
  targetScope,
  targetListingType,
  targetCategories,
  listingFieldConfigs,
) => {
  const targetCategoryIds = Object.values(targetCategories);

  return listingFieldConfigs.reduce((fields, fieldConfig) => {
    const {
      key,
      scope = 'public',
      schemaType,
      enumOptions,
    } = fieldConfig || {};
    const namespacePrefix = scope === 'public' ? `pub_` : `priv_`;
    const namespacedKey = `${namespacePrefix}${key}`;

    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
    const isEnumSchemaType = schemaType === SCHEMA_TYPE_ENUM;
    const shouldHaveValidEnumOptions =
      !isEnumSchemaType ||
      (isEnumSchemaType &&
        !!enumOptions?.find(conf => conf.option === data?.[key]));
    const isTargetScope = scope === targetScope;
    const isTargetListingType = isFieldForListingType(
      targetListingType,
      fieldConfig,
    );
    const isTargetCategory = isFieldForCategory(targetCategoryIds, fieldConfig);

    if (
      isKnownSchemaType &&
      isTargetScope &&
      isTargetListingType &&
      isTargetCategory &&
      shouldHaveValidEnumOptions
    ) {
      const fieldValue = data?.[key] || null;
      return { ...fields, [namespacedKey]: fieldValue };
    }
    return fields;
  }, {});
};

/**
 * If listing represents something else than a bookable listing, we set availability-plan to seats=0.
 * Note: this is a performance improvement since the API is backwards compatible.
 *
 * @param {string} processAlias selected for this listing
 * @returns availabilityPlan without any seats available for the listing
 */
const setNoAvailabilityForUnbookableListings = processAlias => {
  return isBookingProcessAlias(processAlias)
    ? {}
    : {
        availabilityPlan: {
          type: 'availability-plan/time',
          timezone: 'Etc/UTC',
          entries: [
            // Note: "no entries" is the same as seats=0 for every entry.
            // { dayOfWeek: 'mon', startTime: '00:00', endTime: '00:00', seats: 0 },
            // { dayOfWeek: 'tue', startTime: '00:00', endTime: '00:00', seats: 0 },
            // { dayOfWeek: 'wed', startTime: '00:00', endTime: '00:00', seats: 0 },
            // { dayOfWeek: 'thu', startTime: '00:00', endTime: '00:00', seats: 0 },
            // { dayOfWeek: 'fri', startTime: '00:00', endTime: '00:00', seats: 0 },
            // { dayOfWeek: 'sat', startTime: '00:00', endTime: '00:00', seats: 0 },
            // { dayOfWeek: 'sun', startTime: '00:00', endTime: '00:00', seats: 0 },
          ],
        },
      };
};

/**
 * Get initialValues for the form. This function includes
 * title, description, listingType, transactionProcessAlias, unitType,
 * and those publicData & privateData fields that are configured through
 * config.listing.listingFields.
 *
 * @param {object} props
 * @param {object} existingListingTypeInfo info saved to listing's publicData
 * @param {object} listingTypes app's configured types (presets for listings)
 * @param {object} listingFields those extended data fields that are part of configurations
 * @returns initialValues object for the form
 */
const getInitialValues = (
  props,
  existingListingTypeInfo,
  listingTypes,
  listingFields,
  listingCategories,
  categoryKey,
) => {
  const { description, title, publicData, privateData } =
    props?.listing?.attributes || {};
  console.log(
    'props?.listing?.attributes',
    JSON.stringify(props?.listing?.attributes),
  );
  const { listingType, bookingType = '' } = publicData || {};

  const nestedCategories = pickCategoryFields(
    publicData,
    categoryKey,
    1,
    listingCategories,
  );
  // Initial values for the form
  return {
    title,
    description,
    // bookingType,
    ...nestedCategories,
    // Transaction type info: listingType, transactionProcessAlias, unitType
    ...getTransactionInfo(listingTypes, existingListingTypeInfo),
    ...initialValuesForListingFields(
      publicData,
      'public',
      listingType,
      nestedCategories,
      listingFields,
    ),
    ...initialValuesForListingFields(
      privateData,
      'private',
      listingType,
      nestedCategories,
      listingFields,
    ),
  };
};

const TITLE_MAX_LENGTH = 60;

const getListngDetailsSchema = (initialValues, listingFieldsConfig, t) => {
  const { listingType, transactionProcessAlias, unitType } = initialValues;

  const conditionalFields = listingFieldsConfig.reduce(
    (
      acc,
      {
        saveConfig: { isRequired },
        categoryConfig,
        listingTypeConfig,
        scope,
        schemaType,
        key,
      },
    ) => {
      // const {
      //   defaultRequiredMessage,
      //   saveConfig: { displayInSignUp, isRequired },
      //   schemaType,
      //   minimum,
      //   maximum,
      //   enumOptions,
      // } = fieldConfig

      const defaultRequiredMessage = '';
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
          fieldSchema = z.string();
          if (isRequired) {
            // fieldSchema = fieldSchema.min(
            //   minimum,
            //   t('CustomExtendedDataField.numberTooSmall'),
            // )
            // .max(maximum, t('CustomExtendedDataField.numberTooBig'))   // TODO-H: Add max validation
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

      const field = `pub_${key}`;
      return { ...acc, [field]: fieldSchema };
    },
    {},
  );

  const formSchema = z.object({
    title: z
      .string()
      .min(1, t('EditListingDetailsForm.titleRequired'))
      .max(TITLE_MAX_LENGTH, t('EditListingDetailsForm.maxLength')),
    description: z
      .string()
      .min(1, t('EditListingDetailsForm.descriptionRequired')),
    listingType: z.string().default(listingType),
    transactionProcessAlias: z.string().default(transactionProcessAlias),
    unitType: z.string().default(unitType),
    //Check level of categories later TODO-M
    categoryLevel1: z.string().optional(),
    categoryLevel2: z.string().optional(),
    categoryLevel3: z.string().optional(),
    categoryLevel4: z.string().optional(),
    ...conditionalFields,
  });

  return formSchema;
};

const getDefaultValues = initialValues => {
  const {
    title = '',
    description = '',
    transactionProcessAlias = '',
    unitType = '',
    listingType = '',
    bookingType = '',
    ...rest
  } = initialValues;
  console.log('initialValues', initialValues);

  //TODO-H : Need to debug later, Default values assigned from outside reflects in watch/getValues While default values assigned inside zod is not reflecting
  return {
    title,
    description,
    transactionProcessAlias,
    unitType,
    listingType,
    bookingType,
    ...rest,
  };
};

export {
  hasSetListingType,
  getInitialValues,
  getTransactionInfo,
  getListngDetailsSchema,
  pickListingFieldsData,
  setNoAvailabilityForUnbookableListings,
  getDefaultValues,
};
