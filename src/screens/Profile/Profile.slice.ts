import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ReviewTypeAndState, Thunk } from '../../appTypes';
import { RootState } from '../../sharetribeSetup';
import { addMarketplaceEntities } from '../../slices/marketplaceData.slice';
import { createImageVariantConfig, storableError } from '../../util';
import { currentUserIdSelector } from '../../slices/user.slice';
import { denormalisedResponseEntities } from '../../util/data';

const RESULT_PAGE_SIZE = 5;

const getParams = config => {
  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config?.layout?.listingImage;

  const aspectRatio = aspectHeight / aspectWidth;
  return {
    perPage: RESULT_PAGE_SIZE,
    include: ['author', 'images'],
    'fields.listing': [
      'title',
      'price',
      'publicData.isFeatured',
      'publicData.totalRatingSum',
      'publicData.totalRatings',
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
  };
};

const resultIds = data => data.data.map(l => l.id);
const initialState = {
  pagination: null,
  ownListingInProgress: false,
  ownListingsError: null,
  ownListingsResultIds: [],
  closeOwnListingInProgress: false,
  closeOwnListingError: null,
  openOwnListingInProgress: false,
  openOwnListingError: null,
  discardDraftListingInProgress: false,
  discardDraftListingError: null,
  reviews: [],
  reviewsError: null,
  reviewsInProgress: false,
};

const profile = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getOwnListings.pending, state => {
      state.ownListingInProgress = true;
      state.ownListingsError = null;
    });
    builder.addCase(getOwnListings.fulfilled, (state, { payload, meta }) => {
      const page = meta?.arg?.page;
      state.ownListingInProgress = false;
      if (page === 1) {
        state.ownListingsResultIds = resultIds(payload.data);
      } else {
        state.ownListingsResultIds = state.ownListingsResultIds.concat(
          resultIds(payload.data),
        );
      }
      state.pagination = payload.data.meta;
    });
    builder.addCase(getOwnListings.rejected, (state, { error }) => {
      state.ownListingInProgress = false;
      state.ownListingsError = storableError(error);
    });

    builder.addCase(closeOwnListings.pending, state => {
      state.closeOwnListingInProgress = true;
      state.closeOwnListingError = null;
    });
    builder.addCase(closeOwnListings.fulfilled, state => {
      state.closeOwnListingInProgress = false;
    });
    builder.addCase(closeOwnListings.rejected, (state, action) => {
      state.closeOwnListingInProgress = false;
      state.closeOwnListingError = storableError(action.error);
    });

    builder.addCase(openOwnListings.pending, state => {
      state.openOwnListingInProgress = true;
      state.openOwnListingError = null;
    });
    builder.addCase(openOwnListings.fulfilled, state => {
      state.openOwnListingInProgress = false;
    });
    builder
      .addCase(openOwnListings.rejected, (state, action) => {
        state.openOwnListingInProgress = false;
        state.openOwnListingError = storableError(action.error);
      })

      .addCase(discardDraftListings.pending, state => {
        state.discardDraftListingInProgress = true;
        state.discardDraftListingError = null;
      })
      .addCase(discardDraftListings.fulfilled, state => {
        state.discardDraftListingInProgress = false;
      })
      .addCase(discardDraftListings.rejected, (state, action) => {
        state.discardDraftListingInProgress = false;
        state.discardDraftListingError = storableError(action.error);
      });

    builder.addCase(getAllReviews.pending, state => {
      state.reviewsError = null;
      state.reviewsInProgress = true;
    });
    builder.addCase(getAllReviews.fulfilled, (state, { payload }) => {
      state.reviews = payload;
      state.reviewsInProgress = false;
    });
    builder.addCase(getAllReviews.rejected, (state, action) => {
      state.reviewsError = storableError(action.error);
      state.reviewsInProgress = false;
    });
  },
});

export const getAllReviews = createAsyncThunk<{}, {}, Thunk>(
  'profileSlice/getAllReviews',
  async (_, { dispatch, extra: sdk, getState }) => {
    try {
      const userId = currentUserIdSelector(getState());
      const response = await sdk.reviews.query({
        subjectId: userId,
        type: ReviewTypeAndState.REVIEW_TYPE_OF_PROVIDER,
        state: ReviewTypeAndState.REVIEW_STATE_PUBLIC,
        include: ['author', 'author.profileImage'],
        'fields.image': ['variants.square-small', 'variants.square-small2x'],
      });
      const reviews = denormalisedResponseEntities(response);
      return reviews;
    } catch (error) {
      console.log('error reviews', error);
    }
  },
);

export const getOwnListings = createAsyncThunk<{}, {}, Thunk>(
  'profileSlice/getOwnListings',
  async ({ config, page = 1 }, { dispatch, extra: sdk }) => {
    try {
      const params = getParams(config);
      const response = await sdk.ownListings.query({ ...params, page });
      const listingFields = config?.listing?.listingFields;
      const sanitizeConfig = { listingFields };

      dispatch(
        addMarketplaceEntities({ sdkResponse: response, sanitizeConfig }),
      );
      return response;
    } catch (error) {
      console.error('Error in searchListings', error);
      return error;
    }
  },
);

export const closeOwnListings = createAsyncThunk<{}, {}, Thunk>(
  'profileSlice/closeOwnListings',
  async (params, { dispatch, extra: sdk }) => {
    try {
      const response = await sdk.ownListings.close(
        {
          id: params.id,
        },
        { expand: true },
      );

      dispatch(addMarketplaceEntities({ sdkResponse: response }));
      return response;
    } catch (error) {
      console.error('Error in searchListings', error);
      return error;
    }
  },
);

export const openOwnListings = createAsyncThunk<{}, {}, Thunk>(
  'profileSlice/openOwnListings',
  async (params, { dispatch, extra: sdk }) => {
    try {
      const response = await sdk.ownListings.open(
        {
          id: params.id,
        },
        { expand: true },
      );

      dispatch(addMarketplaceEntities({ sdkResponse: response }));
      return response;
    } catch (error) {
      console.error('Error in searchListings', error);
      return error;
    }
  },
);

export const discardDraftListings = createAsyncThunk<{}, {}, Thunk>(
  'profileSlice/discardDraftListings',
  async (params, { dispatch, extra: sdk }) => {
    try {
      const response = await sdk.ownListings.discardDraft(
        {
          id: params.id,
        },
        { expand: true },
      );

      dispatch(addMarketplaceEntities({ sdkResponse: response }));
      return response;
    } catch (error) {
      console.error('Error', error);
      return error;
    }
  },
);

export const profileListingsPaginationSelector = (state: RootState) =>
  state.profile.pagination;

export const ownListingsResultIdsSelector = (state: RootState) =>
  state.profile.ownListingsResultIds || [];

export const ownListingsInProgressSelector = (state: RootState) =>
  state.profile.ownListingInProgress;

export const reviewsSelector = (state: RootState) => state.profile.reviews;
export const reviewsInProgressSelector = (state: RootState) =>
  state.profile.reviewsInProgress;

export default profile.reducer;
