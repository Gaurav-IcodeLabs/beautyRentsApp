import { EditListingTabs } from '../../appTypes'
import { store } from '../../sharetribeSetup'
import { getMarketplaceEntities } from '../../slices/marketplaceData.slice'
import {
  createImageVariantConfig,
  displayDeliveryPickup,
  displayDeliveryShipping,
  displayLocation,
  displayPrice,
  isFieldForCategory,
  isFieldForListingType,
  pickCategoryFields,
  SCHEMA_TYPE_BOOLEAN,
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_LONG,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
} from '../../util'
import { compareAndSetStock } from './EditListing.slice'

// You can reorder these panels.
// Note 1: You need to change save button translations for new listing flow
// Note 2: Ensure that draft listing is created after the first panel
//         and listing publishing happens after last panel.
// Note 3: The first tab creates a draft listing and title is mandatory attribute for it.
//         Details tab asks for "title" and is therefore the first tab in the wizard flow.
const TABS_DETAILS_ONLY: readonly string[] = [EditListingTabs.DETAILS]
const TABS_PRODUCT: readonly string[] = [
  EditListingTabs.DETAILS,
  EditListingTabs.PRICING_AND_STOCK,
  EditListingTabs.DELIVERY,
  EditListingTabs.PHOTOS,
]
const TABS_BOOKING: readonly string[] = [
  EditListingTabs.DETAILS,
  EditListingTabs.LOCATION,
  EditListingTabs.PRICING,
  EditListingTabs.AVAILABILITY,
  EditListingTabs.PHOTOS,
]
const TABS_INQUIRY: readonly string[] = [
  EditListingTabs.DETAILS,
  EditListingTabs.LOCATION,
  EditListingTabs.PRICING,
  EditListingTabs.PHOTOS,
]

// Pick only allowed tabs from the given list
const getTabs = (processTabs, disallowedTabs) => {
  return disallowedTabs.length > 0
    ? processTabs.filter(tab => !disallowedTabs.includes(tab))
    : processTabs
}
// Pick only allowed booking tabs (location could be omitted)
const tabsForBookingProcess = (processTabs, listingTypeConfig) => {
  const disallowedTabs = !displayLocation(listingTypeConfig)
    ? [EditListingTabs.LOCATION]
    : []
  return getTabs(processTabs, disallowedTabs)
}
// Pick only allowed purchase tabs (delivery could be omitted)
const tabsForPurchaseProcess = (processTabs, listingTypeConfig) => {
  const isDeliveryDisabled =
    !displayDeliveryPickup(listingTypeConfig) &&
    !displayDeliveryShipping(listingTypeConfig)
  const disallowedTabs = isDeliveryDisabled ? [DELIVERY] : []
  return getTabs(processTabs, disallowedTabs)
}
// Pick only allowed inquiry tabs (location and pricing could be omitted)
const tabsForInquiryProcess = (processTabs, listingTypeConfig) => {
  const locationMaybe = !displayLocation(listingTypeConfig)
    ? [EditListingTabs.LOCATION]
    : []
  const priceMaybe = !displayPrice(listingTypeConfig)
    ? [EditListingTabs.PRICING]
    : []
  return getTabs(processTabs, [...locationMaybe, ...priceMaybe])
}

const getOwnListing = (entities, id) => {
  const listings = getMarketplaceEntities(entities, [
    { id, type: 'ownListing' },
  ])
  return listings.length === 1 ? listings[0] : null
}

const getListingTypeConfig = (listing, selectedListingType, config) => {
  const existingListingType = listing?.attributes?.publicData?.listingType
  const validListingTypes = config.listing.listingTypes
  const hasOnlyOneListingType = validListingTypes?.length === 1

  const listingTypeConfig = existingListingType
    ? validListingTypes.find(conf => conf.listingType === existingListingType)
    : selectedListingType
      ? validListingTypes.find(
          conf => conf.listingType === selectedListingType.listingType,
        )
      : hasOnlyOneListingType
        ? validListingTypes[0]
        : null
  return listingTypeConfig
}

/**
 * Return translations for wizard tab: label and submit button.
 *
 * @param {Object} intl
 * @param {string} tab name of the tab/panel in the wizard
 * @param {boolean} isNewListingFlow
 * @param {string} processName
 */
const tabLabelAndSubmit = (
  t,
  tab,
  isNewListingFlow,
  isPriceDisabled,
  processName,
) => {
  const processNameString = isNewListingFlow ? `${processName}.` : ''
  const newOrEdit = isNewListingFlow ? 'new' : 'edit'

  let labelKey = null
  let submitButtonKey = null
  if (tab === EditListingTabs.DETAILS) {
    labelKey = 'EditListingWizard.tabLabelDetails'
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.saveDetails`
  } else if (tab === EditListingTabs.PRICING) {
    labelKey = 'EditListingWizard.tabLabelPricing'
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.savePricing`
  } else if (tab === EditListingTabs.PRICING_AND_STOCK) {
    labelKey = 'EditListingWizard.tabLabelPricingAndStock'
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.savePricingAndStock`
  } else if (tab === EditListingTabs.DELIVERY) {
    labelKey = 'EditListingWizard.tabLabelDelivery'
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.saveDelivery`
  } else if (tab === EditListingTabs.LOCATION) {
    labelKey = 'EditListingWizard.tabLabelLocation'
    submitButtonKey =
      isPriceDisabled && isNewListingFlow
        ? `EditListingWizard.${processNameString}${newOrEdit}.saveLocationNoPricingTab`
        : `EditListingWizard.${processNameString}${newOrEdit}.saveLocation`
  } else if (tab === EditListingTabs.AVAILABILITY) {
    labelKey = 'EditListingWizard.tabLabelAvailability'
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.saveAvailability`
  } else if (tab === EditListingTabs.PHOTOS) {
    labelKey = 'EditListingWizard.tabLabelPhotos'
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.savePhotos`
  }

  return {
    label: t(labelKey),
    submitButton: t(submitButtonKey),
  }
}

/**
 * Validate listing fields (in extended data) that are included through configListing.js
 * This is used to check if listing creation flow can show the "next" tab as active.
 *
 * @param {Object} publicData
 * @param {Object} privateData
 */
const hasValidListingFieldsInExtendedData = (
  publicData,
  privateData,
  config,
) => {
  const isValidField = (fieldConfig, fieldData) => {
    const { key, schemaType, enumOptions = [], saveConfig = {} } = fieldConfig

    const schemaOptionKeys = enumOptions.map(o => `${o.option}`)
    const hasValidEnumValue = optionData => {
      return schemaOptionKeys.includes(optionData)
    }
    const hasValidMultiEnumValues = savedOptions => {
      return savedOptions.every(optionData =>
        schemaOptionKeys.includes(optionData),
      )
    }

    const categoryKey = config.categoryConfiguration.key
    const categoryOptions = config.categoryConfiguration.categories
    const categoriesObj = pickCategoryFields(
      publicData,
      categoryKey,
      1,
      categoryOptions,
    )
    const currentCategories = Object.values(categoriesObj)

    const isTargetListingType = isFieldForListingType(
      publicData?.listingType,
      fieldConfig,
    )
    const isTargetCategory = isFieldForCategory(currentCategories, fieldConfig)
    const isRequired =
      !!saveConfig.isRequired && isTargetListingType && isTargetCategory

    if (isRequired) {
      const savedListingField = fieldData[key]
      return schemaType === SCHEMA_TYPE_ENUM
        ? typeof savedListingField === 'string' &&
            hasValidEnumValue(savedListingField)
        : schemaType === SCHEMA_TYPE_MULTI_ENUM
          ? Array.isArray(savedListingField) &&
            hasValidMultiEnumValues(savedListingField)
          : schemaType === SCHEMA_TYPE_TEXT
            ? typeof savedListingField === 'string'
            : schemaType === SCHEMA_TYPE_LONG
              ? typeof savedListingField === 'number' &&
                Number.isInteger(savedListingField)
              : schemaType === SCHEMA_TYPE_BOOLEAN
                ? savedListingField === true || savedListingField === false
                : false
    }
    return true
  }
  return config.listing.listingFields.reduce((isValid, fieldConfig) => {
    const data = fieldConfig.scope === 'private' ? privateData : publicData
    return isValid && isValidField(fieldConfig, data)
  }, true)
}

/**
 * Check if a wizard tab is completed.
 *
 * @param tab wizard's tab
 * @param listing is contains some specific data if tab is completed
 *
 * @return true if tab / step is completed.
 */
const tabCompleted = (tab, listing, config) => {
  const {
    availabilityPlan,
    description,
    geolocation,
    price,
    title,
    publicData,
    privateData,
  } = listing.attributes
  const images = listing.images
  const {
    listingType,
    transactionProcessAlias,
    unitType,
    shippingEnabled,
    pickupEnabled,
  } = publicData || {}
  const deliveryOptionPicked = publicData && (shippingEnabled || pickupEnabled)

  switch (tab) {
    case EditListingTabs.DETAILS:
      return !!(
        description &&
        title &&
        listingType &&
        transactionProcessAlias &&
        unitType &&
        hasValidListingFieldsInExtendedData(publicData, privateData, config)
      )
    case EditListingTabs.PRICING:
      return !!price
    case EditListingTabs.PRICING_AND_STOCK:
      return !!price
    case EditListingTabs.DELIVERY:
      return !!deliveryOptionPicked
    case EditListingTabs.LOCATION:
      return !!(geolocation && publicData?.location?.address)
    case EditListingTabs.AVAILABILITY:
      return !!availabilityPlan
    case EditListingTabs.PHOTOS:
      return images && images.length > 0
    default:
      return false
  }
}

//EditListing Slice helpers
/**
 * Check which wizard tabs are active and which are not yet available. Tab is active if previous
 * tab is completed. In edit mode all tabs are active.
 *
 * @param isNew flag if a new listing is being created or an old one being edited
 * @param listing data to be checked
 * @param tabs array of tabs used for this listing. These depend on transaction process.
 *
 * @return object containing activity / editability of different tabs of this wizard
 */
const tabsActive = (isNew, listing, tabs, config) => {
  return tabs.reduce((acc, tab) => {
    const previousTabIndex = tabs.findIndex(t => t === tab) - 1
    const validTab = previousTabIndex >= 0
    const hasListingType = !!listing?.attributes?.publicData?.listingType
    const prevTabComletedInNewFlow = tabCompleted(
      tabs[previousTabIndex],
      listing,
      config,
    )
    const isActive =
      validTab && !isNew
        ? hasListingType
        : validTab && isNew
          ? prevTabComletedInNewFlow
          : true
    return { ...acc, [tab]: isActive }
  }, {})
}

// Return an array of image ids
const imageIds = images => {
  // For newly uploaded image the UUID can be found from "img.imageId"
  // and for existing listing images the id is "img.id"
  return images ? images.map(img => img.imageId || img.id) : null
}

const getImageVariantInfo = listingImageConfig => {
  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = listingImageConfig
  const aspectRatio = aspectHeight / aspectWidth
  const fieldsImage = [
    `variants.${variantPrefix}`,
    `variants.${variantPrefix}-2x`,
  ]

  return {
    fieldsImage,
    imageVariants: {
      ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
      ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
    },
  }
}

// Helper function to make compareAndSetStock call if stock update is needed.
const updateStockOfListingMaybe = (listingId, stockTotals, dispatch) => {
  const { oldTotal, newTotal } = stockTotals || {}
  // Note: newTotal and oldTotal must be given, but oldTotal can be null
  const hasStockTotals = newTotal >= 0 && typeof oldTotal !== 'undefined'

  if (listingId && hasStockTotals) {
    return dispatch(compareAndSetStock({ listingId, oldTotal, newTotal }))
  }
  return Promise.resolve()
}

const sortExceptionsByStartTime = (a, b) => {
  return a?.attributes?.start?.getTime() - b?.attributes?.start?.getTime()
}

// Create array of N items where indexing starts from 1
const getArrayOfNItems = n =>
  Array(n)
    .fill()
    .map((v, i) => i + 1)
    .slice(1)

// When navigating through weekly calendar,
// we want to merge new week-related data (inProgres, error) to weeklyExceptionQueries hashmap.
const mergeToWeeklyExceptionQueries = (
  weeklyExceptionQueries,
  weekStartId,
  newDataProps,
) => {
  return weekStartId
    ? {
        weeklyExceptionQueries: {
          ...weeklyExceptionQueries,
          [weekStartId]: {
            ...weeklyExceptionQueries[weekStartId],
            ...newDataProps,
          },
        },
      }
    : {}
}

// When navigating through monthly calendar (e.g. when adding a new AvailabilityException),
// we want to merge new month-related data (inProgres, error) to monthlyExceptionQueries hashmap.
const mergeToMonthlyExceptionQueries = (
  monthlyExceptionQueries,
  monthId,
  newDataProps,
) => {
  return monthId
    ? {
        monthlyExceptionQueries: {
          ...monthlyExceptionQueries,
          [monthId]: {
            ...monthlyExceptionQueries[monthId],
            ...newDataProps,
          },
        },
      }
    : {}
}

export {
  tabsForBookingProcess,
  tabsForPurchaseProcess,
  tabsForInquiryProcess,
  getOwnListing,
  getListingTypeConfig,
  tabLabelAndSubmit,
  tabsActive,
  TABS_DETAILS_ONLY,
  TABS_PRODUCT,
  TABS_BOOKING,
  TABS_INQUIRY,
  imageIds,
  getImageVariantInfo,
  updateStockOfListingMaybe,
  sortExceptionsByStartTime,
  getArrayOfNItems,
  mergeToMonthlyExceptionQueries,
  mergeToWeeklyExceptionQueries,
}
