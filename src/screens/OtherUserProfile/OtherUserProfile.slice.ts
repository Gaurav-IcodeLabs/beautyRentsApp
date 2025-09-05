import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createImageVariantConfig, storableError } from '../../util';
import { addMarketplaceEntities } from '../../slices/marketplaceData.slice';
import { ReviewTypeAndState, Thunk } from '../../appTypes';
import { denormalisedResponseEntities } from '../../util/data';
import { RootState } from '../../sharetribeSetup';

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
    'fields.listing': ['title', 'price'],
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
  showUserInprogress: false,
  showUserError: null,
  showUserDetails: {},
  pagination: null,
  userListingInProgress: false,
  userListingsError: null,
  userListingsResultIds: [],
  reviews: [],
  reviewsError: null,
  reviewsInProgress: false,
};

const otherUserProfileSlice = createSlice({
  name: 'otherUserProfile',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(showUser.pending, state => {
        state.showUserInprogress = true;
        state.showUserError = null;
      })
      .addCase(showUser.fulfilled, (state, { payload }) => {
        state.showUserInprogress = false;
        state.showUserDetails = payload;
      })
      .addCase(showUser.rejected, (state, { error }) => {
        state.showUserInprogress = false;
        state.showUserError = storableError(error);
      })

      .addCase(getUserListings.pending, state => {
        state.userListingInProgress = true;
        state.userListingsError = null;
      })
      .addCase(getUserListings.fulfilled, (state, { payload, meta }) => {
        const page = meta?.arg?.page;
        state.userListingInProgress = false;
        if (page === 1) {
          state.userListingsResultIds = resultIds(payload.data);
        } else {
          state.userListingsResultIds = state.userListingsResultIds.concat(
            resultIds(payload.data),
          );
        }
        state.pagination = payload.data.meta;
      })
      .addCase(getUserListings.rejected, (state, { error }) => {
        state.userListingInProgress = false;
        state.userListingsError = storableError(error);
      })

      .addCase(getUsersAllReviews.pending, state => {
        state.reviewsError = null;
        state.reviewsInProgress = true;
      })
      .addCase(getUsersAllReviews.fulfilled, (state, { payload }) => {
        state.reviews = payload;
        state.reviewsInProgress = false;
      })
      .addCase(getUsersAllReviews.rejected, (state, action) => {
        state.reviewsError = storableError(action.error);
        state.reviewsInProgress = false;
      });
  },
});

export const getUserListings = createAsyncThunk(
  'otherUserProfileSlice/getUserListings',
  async ({ userId, config, page = 1 }, { dispatch, extra: sdk }) => {
    try {
      const authorId = userId?.uuid ?? userId;
      const params = getParams(config);
      const response = await sdk.listings.query({ ...params, authorId, page });
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

export const getUsersAllReviews = createAsyncThunk<
  {},
  { userId: any; type: string },
  Thunk
>(
  'otherUserProfileSlice/getUsersAllReviews',
  async ({ userId, type }, { dispatch, extra: sdk, getState }) => {
    try {
      const response = await sdk.reviews.query({
        subjectId: userId,
        type: type, //ReviewTypeAndState.REVIEW_TYPE_OF_CUSTOMER,
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

export const showUser = createAsyncThunk<{}, {}, Thunk>(
  'otherUserProfileSlice/showUser',
  async ({ userId, config }, { dispatch, extra: sdk }) => {
    try {
      const response = await sdk.users.show({
        id: userId,
        include: ['profileImage'],
        'fields.image': ['variants.square-small', 'variants.square-small2x'],
      });
      const entities = denormalisedResponseEntities(response);
      if (entities.length !== 1) {
        throw new Error(
          'Expected a resource in the sdk.currentUser.updateProfile response',
        );
      }
      const user = entities[0];
      return user;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  },
);

export const showUserDetailsSelector = (state: RootState) =>
  state.otherUserProfile.showUserDetails;

export const otherUserDisplayNameSelector = (state: RootState) =>
  state.otherUserProfile.showUserDetails.attributes?.profile?.displayName;

export const otherUserBioSelector = (state: RootState) =>
  state.otherUserProfile.showUserDetails.attributes?.profile?.bio;

export const otherUserPublicDataSelector = (state: RootState) =>
  state.otherUserProfile.showUserDetails?.attributes?.profile?.publicData;

export const otherUserMetadataSelector = (state: RootState) =>
  state.otherUserProfile.showUserDetails?.attributes?.profile?.metadata;

export const userListingsPaginationSelector = (state: RootState) =>
  state.otherUserProfile.pagination;

export const userListingsResultIdsSelector = (state: RootState) =>
  state.otherUserProfile.userListingsResultIds || [];

export const userListingsInProgressSelector = (state: RootState) =>
  state.otherUserProfile.userListingInProgress;

export const userReviewsSelector = (state: RootState) =>
  state.otherUserProfile.reviews;

export const userReviewsInProgressSelector = (state: RootState) =>
  state.otherUserProfile.reviewsInProgress;

export default otherUserProfileSlice.reducer;
