import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Thunk } from '../../appTypes'
import { RootState, store } from '../../sharetribeSetup'
import { addMarketplaceEntities } from '../../slices/marketplaceData.slice'
import { createImageVariantConfig, storableError } from '../../util'
import {
  datesSearchParams,
  omitInvalidCategoryParams,
  priceSearchParams,
  searchValidListingTypes,
  stockFilters,
} from './helper'

const RESULT_PAGE_SIZE = 24

export const defaultSearchParams = config => {
  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage
  const aspectRatio = aspectHeight / aspectWidth

  return {
    page: 1,
    perPage: RESULT_PAGE_SIZE,
    include: ['author', 'images'],
    'fields.listing': [
      'title',
      'geolocation',
      'price',
      'publicData.listingType',
      'publicData.transactionProcessAlias',
      'publicData.unitType',
      // These help rendering of 'purchase' listings,
      // when transitioning from search page to listing page
      'publicData.pickupEnabled',
      'publicData.shippingEnabled',
    ],
    'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
    'fields.image': [
      'variants.scaled-small',
      'variants.scaled-medium',
      `variants.${variantPrefix}`,
      `variants.${variantPrefix}-2x`,
    ],
    ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
    ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
    'limit.images': 1,
  }
}

const resultIds = data => data.data.map(l => l.id)

const initialState = {
  pagination: null,
  searchParams: {},
  searchInProgress: false,
  searchListingsError: null,
  currentPageResultIds: [],
  searchListingsByMapError: null,
  searchListingsByMapInProgress: false,
  searchListingsByMapResultIds: [],
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    resetEditListing: () => {
      return initialState
    },
  },
  extraReducers: builder => {
    builder.addCase(searchListings.pending, (state, { meta }) => {
      state.searchInProgress = true
      state.searchParams = meta.arg.searchParams
    })
    builder.addCase(searchListings.fulfilled, (state, { payload }) => {
      state.searchInProgress = false
      state.currentPageResultIds = resultIds(payload.data)
      state.pagination = payload.data.meta
    })
    builder.addCase(searchListings.rejected, (state, { payload }) => {
      state.searchInProgress = false
      state.searchListingsError = payload
    })
    builder.addCase(searchListingsByMap.pending, state => {
      state.searchListingsByMapInProgress = true;
      state.searchListingsByMapError = null;
    })
    builder.addCase(searchListingsByMap.fulfilled, (state, {payload}) => {
      state.searchListingsByMapInProgress = false;
      state.searchListingsByMapResultIds = resultIds(payload.data);
    })
    builder.addCase(searchListingsByMap.rejected, (state, {error}) => {
      state.searchListingsByMapInProgress = false;
      state.searchListingsByMapError = storableError(error);
    });
  },
})

export const searchListings = createAsyncThunk<{}, {}, Thunk>(
  'search/searchListingsStatus',
  async (data, { dispatch, extra: sdk }) => {
    try {
      const { searchParams, config } = data

      const { perPage, price, dates, sort, mapSearch, ...restOfParams } =
        searchParams

      const priceMaybe = priceSearchParams(config, price)
      const datesMaybe = datesSearchParams(config, dates)
      const stockMaybe = stockFilters(datesMaybe)
      const sortMaybe =
        sort === config.search.sortConfig.relevanceKey ? {} : { sort }

      const params = {
        // The rest of the params except invalid nested category-related params
        // Note: invalid independent search params are still passed through
        ...omitInvalidCategoryParams(config, restOfParams),
        ...priceMaybe,
        ...datesMaybe,
        ...stockMaybe,
        ...sortMaybe,
        ...searchValidListingTypes(config, config.listing.listingTypes),
        perPage,
      }

      const response = await sdk.listings.query(params)
      const listingFields = config?.listing?.listingFields
      const sanitizeConfig = { listingFields }

      dispatch(
        addMarketplaceEntities({ sdkResponse: response, sanitizeConfig }),
      )

      return response
    } catch (error) {
      console.log('first', storableError(error))
      console.error('Error in searchListings', error)
      return storableError(error)
    }
  },
)

export const loadData = config => {
  store.dispatch(
    searchListings({
      searchParams: defaultSearchParams(config),
      config,
    }),
  )
}

export const searchListingsByMap = createAsyncThunk<{}, {}, Thunk>(
  'search/searchListingsByMap',
  async (data, {dispatch, extra: sdk}) => {
    try {
      const {bounds, config} = data;
      console.log('bounds',JSON.stringify(bounds))
      const searchParams = defaultSearchParams(config);
      const params = {
        ...searchParams,
        bounds,
        page: 1,
        perPage: 20,
      };
      const response = await sdk.listings.query(params);
      const listingFields = config?.listing?.listingFields;
      const sanitizeConfig = {listingFields};
      dispatch(addMarketplaceEntities({sdkResponse: response, sanitizeConfig}));
      return response;
    } catch (error) {
      console.log('Error in searchListings', storableError(error));
      return storableError(error);
    }
  },
);

export const currentListingIdsSelector = (state: RootState) =>
  state.search.currentPageResultIds
export const searchInProgressSelector = (state: RootState) =>
  state.search.searchInProgress
export const searchParamsSelector = (state: RootState) =>
  state.search.searchParams

export const searchListingsByMapInProgressSelector = (state: RootState) =>
  state.search.searchListingsByMapInProgress;

export const searchListingsByMapErrorSelector = (state: RootState) =>
  state.search.searchListingsByMapError;

export const searchListingsByMapResultIdsSelector = (state: RootState) =>
  state.search.searchListingsByMapResultIds;

export default searchSlice.reducer
