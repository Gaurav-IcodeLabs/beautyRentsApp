// SearchPage can enforce listing query to only those listings with valid listingType
// NOTE: this only works if you have set 'enum' type search schema to listing's public data fields
//       - listingType
//       Same setup could be expanded to 2 other extended data fields:
//       - transactionProcessAlias
//       - unitType
//       ...and then turned enforceValidListingType config to true in configListing.js
// Read More:
// https://www.sharetribe.com/docs/how-to/manage-search-schemas-with-flex-cli/#adding-listing-search-schemas

import {
  addTime,
  constructQueryParamName,
  daysBetween,
  getExclusiveEndDate,
  getStartOf,
  parseDateFromISO8601,
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_MULTI_ENUM,
  subtractTime,
} from '../../util'
import { convertUnitToSubUnit, unitDivisor } from '../../util/currency'

const searchValidListingTypes = (config, listingTypes) => {
  return config.listing.enforceValidListingType
    ? {
        pub_listingType: listingTypes.map(l => l.listingType),
        // pub_transactionProcessAlias: listingTypes.map(l => l.transactionType.alias),
        // pub_unitType: listingTypes.map(l => l.transactionType.unitType),
      }
    : {}
}

const omitInvalidCategoryParams = (config, params) => {
  const categoryConfig = config.search.defaultFilters?.find(
    f => f.schemaType === 'category',
  )
  const categories = config.categoryConfiguration.categories
  const { key: prefix, scope } = categoryConfig || {}
  const categoryParamPrefix = constructQueryParamName(prefix, scope)

  const validURLParamForCategoryData = (prefix, categories, level, params) => {
    const levelKey = `${categoryParamPrefix}${level}`
    const levelValue = params?.[levelKey]
    const foundCategory = categories.find(cat => cat.id === levelValue)
    const subcategories = foundCategory?.subcategories || []
    return foundCategory && subcategories.length > 0
      ? {
          [levelKey]: levelValue,
          ...validURLParamForCategoryData(
            prefix,
            subcategories,
            level + 1,
            params,
          ),
        }
      : foundCategory
        ? { [levelKey]: levelValue }
        : {}
  }

  const categoryKeys = validURLParamForCategoryData(
    prefix,
    categories,
    1,
    params,
  )
  const nonCategoryKeys = Object.entries(params).reduce(
    (picked, [k, v]) =>
      k.startsWith(categoryParamPrefix) ? picked : { ...picked, [k]: v },
    {},
  )

  return { ...nonCategoryKeys, ...categoryKeys }
}

const priceSearchParams = (config, priceParam) => {
  const inSubunits = value =>
    convertUnitToSubUnit(value, unitDivisor(config.currency))
  const values = priceParam ? priceParam.split(',') : []
  return priceParam && values.length === 2
    ? {
        price: [inSubunits(values[0]), inSubunits(values[1]) + 1].join(','),
      }
    : {}
}

const datesSearchParams = (config, datesParam) => {
  const searchTZ = 'Etc/UTC'
  const datesFilter = config.search.defaultFilters.find(f => f.key === 'dates')
  const values = datesParam ? datesParam.split(',') : []
  const hasValues = datesFilter && datesParam && values.length === 2
  const { dateRangeMode, availability } = datesFilter || {}
  const isNightlyMode = dateRangeMode === 'night'
  const isEntireRangeAvailable = availability === 'time-full'

  // SearchPage need to use a single time zone but listings can have different time zones
  // We need to expand/prolong the time window (start & end) to cover other time zones too.
  //
  // NOTE: you might want to consider changing UI so that
  //   1) location is always asked first before date range
  //   2) use some 3rd party service to convert location to time zone (IANA tz name)
  //   3) Make exact dates filtering against that specific time zone
  //   This setup would be better for dates filter,
  //   but it enforces a UX where location is always asked first and therefore configurability
  const getProlongedStart = date => subtractTime(date, 14, 'hours', searchTZ)
  const getProlongedEnd = date => addTime(date, 12, 'hours', searchTZ)

  const startDate = hasValues ? parseDateFromISO8601(values[0], searchTZ) : null
  const endRaw = hasValues ? parseDateFromISO8601(values[1], searchTZ) : null
  const endDate =
    hasValues && isNightlyMode
      ? endRaw
      : hasValues
        ? getExclusiveEndDate(endRaw, searchTZ)
        : null

  const today = getStartOf(new Date(), 'day', searchTZ)
  const possibleStartDate = subtractTime(today, 14, 'hours', searchTZ)
  const hasValidDates =
    hasValues &&
    startDate.getTime() >= possibleStartDate.getTime() &&
    startDate.getTime() <= endDate.getTime()

  const dayCount = isEntireRangeAvailable ? daysBetween(startDate, endDate) : 1
  const day = 1440
  const hour = 60
  // When entire range is required to be available, we count minutes of included date range,
  // but there's a need to subtract one hour due to possibility of daylight saving time.
  // If partial range is needed, then we just make sure that the shortest time unit supported
  // is available within the range.
  // You might want to customize this to match with your time units (e.g. day: 1440 - 60)
  const minDuration = isEntireRangeAvailable ? dayCount * day - hour : hour
  return hasValidDates
    ? {
        start: getProlongedStart(startDate),
        end: getProlongedEnd(endDate),
        // Availability can be time-full or time-partial.
        // However, due to prolonged time window, we need to use time-partial.
        availability: 'time-partial',
        // minDuration uses minutes
        minDuration,
      }
    : {}
}

const stockFilters = datesMaybe => {
  const hasDatesFilterInUse = Object.keys(datesMaybe).length > 0

  // If dates filter is not in use,
  //   1) Add minStock filter with default value (1)
  //   2) Add relaxed stockMode: "match-undefined"
  // The latter is used to filter out all the listings that explicitly are out of stock,
  // but keeps bookable and inquiry listings.
  return hasDatesFilterInUse
    ? {}
    : { minStock: 1, stockMode: 'match-undefined' }
}

const handleMultipleSelect = (schemaType, key, option, setSelectedFilters) => {
  if (
    schemaType === SCHEMA_TYPE_ENUM ||
    schemaType === SCHEMA_TYPE_MULTI_ENUM
  ) {
    setSelectedFilters(prevFilters => {
      const updatedFilters = { ...prevFilters }

      if (updatedFilters[key]?.includes(option)) {
        // Option is already selected, remove it
        updatedFilters[key] = updatedFilters[key].filter(
          selectedOption => selectedOption !== option,
        )
        if (updatedFilters[key].length === 0) {
          delete updatedFilters[key]
        }
      } else {
        // Option is not selected, add it
        updatedFilters[key] = updatedFilters[key]
          ? [...updatedFilters[key], option]
          : [option]
      }

      return updatedFilters
    })
  }
}

const handleCategoryPress = (
  categoryId,
  level,
  setSelectedCategories,
  categoryData,
) => {
  setSelectedCategories(prevSelected => {
    const newSelected = { ...prevSelected }

    // Reset selections at higher levels
    for (let i = level; i < categoryData.categoryLevelKeys.length; i++) {
      delete newSelected[categoryData.categoryLevelKeys[i]]
    }

    // Toggle selection at the current level
    if (newSelected[categoryData.categoryLevelKeys[level - 1]] === categoryId) {
      delete newSelected[categoryData.categoryLevelKeys[level - 1]]
    } else {
      newSelected[categoryData.categoryLevelKeys[level - 1]] = categoryId
    }

    return newSelected
  })
}

/**
 * Converts miles to degrees.
 * @param {number} miles - The distance in miles.
 * @returns {number} - The distance in degrees.
 */
function milesToDegrees(miles: number): number {
  return miles * 0.0144927536231884
}

/**
 * Creates bounds with a radius of 3 miles around a given latitude and longitude.
 * @param {number} lat - The latitude.
 * @param {number} lng - The longitude.
 * @param {number} radiusMiles - The radius in miles (default is 3).
 * @returns {string} - The bounds in 'swLat,swLng,neLat,neLng' format.
 */
const createBounds = (
  lat: number,
  lng: number,
  radiusMiles: number = 50,
): string => {
  const degrees = milesToDegrees(radiusMiles)
  const swLat = lat - degrees
  const swLng = lng - degrees
  const neLat = lat + degrees
  const neLng = lng + degrees
  return `${neLat},${neLng},${swLat},${swLng}`
}
export function calculateBounds(centerLat, centerLng, radiusInKm) {
  const earthRadius = 6371;
  const radiusInRadians = radiusInKm / earthRadius;
  const centerLatRad = (centerLat * Math.PI) / 180;
  const centerLngRad = (centerLng * Math.PI) / 180;
  const neLat = centerLat + (radiusInRadians * 180) / Math.PI;
  const neLng =
    centerLng + (radiusInRadians * 180) / Math.PI / Math.cos(centerLatRad);
  const swLat = centerLat - (radiusInRadians * 180) / Math.PI;
  const swLng =
    centerLng - (radiusInRadians * 180) / Math.PI / Math.cos(centerLatRad);
  return {
    neLat,
    neLng,
    swLat,
    swLng,
  };
}

export {
  priceSearchParams,
  datesSearchParams,
  stockFilters,
  omitInvalidCategoryParams,
  searchValidListingTypes,
  handleMultipleSelect,
  handleCategoryPress,
  createBounds,
  calculateBounds,
}
