import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Thunk } from '../../appTypes';
import { addMarketplaceEntities } from '../../slices/marketplaceData.slice';
import { RootState } from '../../sharetribeSetup';

const RESULT_PAGE_SIZE = 10;
export const getListingQueryParams = (sortKey?: string) => {
  return {
    perPage: RESULT_PAGE_SIZE,
    include: ['author', 'images', 'author.profileImage'],
    'fields.listing': [
      'title',
      'description',
      'price',
      'publicData',
      'createdAt',
    ],
    ...(sortKey ? { sort: sortKey } : {}),
  };
};

const initialState = {
  wishlistIds: [],
  fetchWishlistInProgress: false,
  fetchWishlistError: null,
};

export const resultIdsOfListing = data => data.data.map(l => l.id);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchWishListListing.pending, state => {
        state.fetchWishlistInProgress = true;
        state.fetchWishlistError = null;
      })
      .addCase(fetchWishListListing.fulfilled, (state, action) => {
        state.wishlistIds = resultIdsOfListing(action.payload.data);
        state.fetchWishlistInProgress = false;
      })
      .addCase(fetchWishListListing.rejected, (state, action) => {
        state.fetchWishlistInProgress = false;
        state.fetchWishlistError = action.error;
      });
  },
});

export const fetchWishListListing = createAsyncThunk<{}, Thunk>(
  'wishlist/fetchWishListListing',
  async ({ page = 1, ...rest }, { dispatch, getState, extra: sdk }) => {
    try {
      const params = getListingQueryParams();
      const response = await sdk.listings.query({
        page,
        ...rest,
        ...params,
      });
      dispatch(addMarketplaceEntities({ sdkResponse: response }));
      return response;
    } catch (error) {
      console.log('error', error);
    }
  },
);

export const wishlistIdsSelector = (state: RootState) =>
  state.wishlist.wishlistIds;

export const wishlistIdsInProcessSelector = (state: RootState) =>
  state.wishlist.fetchWishlistInProgress;

export const wishlistIdsErrorSelector = (state: RootState) =>
  state.wishlist.fetchWishlistError;

export default wishlistSlice.reducer;
