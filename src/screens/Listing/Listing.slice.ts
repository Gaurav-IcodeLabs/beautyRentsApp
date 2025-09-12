import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {Thunk} from '../../appTypes';
import {RootState} from '../../sharetribeSetup';
import {addMarketplaceEntities} from '../../slices/marketplaceData.slice';
import {
  createImageVariantConfig,
  monthIdString,
  types as sdkTypes,
  storableError,
  stringifyDateToISO8601,
} from '../../util';
import {denormalisedResponseEntities} from '../../util/data';
import {getProcess, isBookingProcessAlias} from '../../transactions';
import {fetchMonthlyTimeSlots} from './Listing.helper';
import {transactionLineItems} from '../../util/api';
import moment from 'moment-timezone';

const {UUID} = sdkTypes;
const resultIds = data => data?.data?.map?.(l => l.id);

type listingPageStateType = {
  loadListingPageInprogress: boolean;
  loadListingPageError: string | null;
  loadListingPageSuccess: boolean;
  loadingReviewsInProgress: boolean;
  reviewsError: string | null;
  reviews: [];
  similarListingIds: [];
  getSimilarListingsInProgress: boolean;
  getSimilarListingsError: string | null;
  sendInquiryInProgress: boolean;
  sendInquiryError: string | null;
  monthlyTimeSlots: {};
  timeSlotsForDate: {};
  fetchTimeSlotsInProgress: boolean;
  fetchTimeSlotsError: string | null;
  lineItems: null;
  fetchLineItemsInProgress: boolean;
  fetchLineItemsError: string | null;
};
type initialStateType = {
  page: Record<string, listingPageStateType>;
};

const initialState: initialStateType = {
  page: {},
};

const listingSlice = createSlice({
  name: 'listing',
  initialState,
  reducers: {
    addPageToState: (state, action) => {
      const listingId = action.payload;
      state.page[listingId] = {
        loadListingPageInprogress: false,
        loadListingPageError: null,
        loadListingPageSuccess: false,
        loadingReviewsInProgress: false,
        reviewsError: null,
        reviews: [],
        similarListingIds: [],
        getSimilarListingsInProgress: false,
        getSimilarListingsError: null,
        sendInquiryError: null,
        sendInquiryInProgress: false,
        monthlyTimeSlots: {},
        timeSlotsForDate: {},
        fetchTimeSlotsInProgress: false,
        fetchTimeSlotsError: null,
        lineItems: null,
        fetchLineItemsInProgress: false,
        fetchLineItemsError: null,
      };
    },

    removePageFromState: (state, action) => {
      const {listingId} = action.payload;
      const page = {...state.page};
      delete page?.[listingId];
      state.page = page;
    },

    clearLineItems: (state, {payload: {listingId}}) => {
      const page = state.page?.[listingId];
      if (page && page.lineItems) {
        console.log('Clearing lineItems for:', listingId);
        page.lineItems = null;
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(
      loadListing.pending,
      (
        state,
        {
          meta: {
            arg: {id},
          },
        }: {meta: {arg: string}},
      ) => {
        state.page[id].loadListingPageInprogress = true;
        state.page[id].loadListingPageError = null;
        state.page[id].loadListingPageSuccess = false;
      },
    );
    builder.addCase(
      loadListing.fulfilled,
      (
        state,
        {
          meta: {
            arg: {id},
          },
        }: {meta: {arg: string}},
      ) => {
        state.page[id].loadListingPageInprogress = false;
        state.page[id].loadListingPageError = null;
        state.page[id].loadListingPageSuccess = true;
      },
    );
    builder.addCase(
      loadListing.rejected,
      (
        state,
        {
          meta: {
            arg: {id},
          },
        }: {meta: {arg: string}; error: any},
      ) => {
        state.page[id].loadListingPageInprogress = false;
        state.page[id].loadListingPageSuccess = false;
        state.page[id].loadListingPageError = storableError(error);
      },
    );

    builder.addCase(
      loadListingReviews.pending,
      (state, {meta: {arg}}: {meta: {arg: string}}) => {
        state.page[arg].loadingReviewsInProgress = true;
        state.page[arg].reviewsError = null;
      },
    );
    builder.addCase(
      loadListingReviews.fulfilled,
      (state, {meta: {arg}, payload}: {meta: {arg: string}; payload: any}) => {
        state.page[arg].loadingReviewsInProgress = false;
        state.page[arg].reviews = payload;
        state.page[arg].reviewsError = null;
      },
    );

    builder.addCase(
      loadListingReviews.rejected,
      (state, {meta: {arg}}: {meta: {arg: string}; error: any}) => {
        state.page[arg].loadingReviewsInProgress = false;
        state.page[arg].reviewsError = storableError(error);
      },
    );

    builder.addCase(
      loadSimilarListings.pending,
      (
        state,
        {
          meta: {
            arg: {listingId},
          },
        }: {meta: {arg: string}},
      ) => {
        state.page[listingId].getSimilarListingsInProgress = true;
        state.page[listingId].getSimilarListingsError = null;
      },
    );
    builder.addCase(
      loadSimilarListings.fulfilled,
      (
        state,
        {
          meta: {
            arg: {listingId},
          },
          payload,
        }: {meta: {arg: string}; payload: any},
      ) => {
        state.page[listingId].getSimilarListingsInProgress = false;
        state.page[listingId].getSimilarListingsError = null;
        state.page[listingId].similarListingIds = resultIds(payload.data);
      },
    );

    builder
      .addCase(
        loadSimilarListings.rejected,
        (
          state,
          {
            meta: {
              arg: {listingId},
            },
          }: {meta: {arg: string}; error: any},
        ) => {
          state.page[listingId].getSimilarListingsInProgress = false;
          state.page[listingId].getSimilarListingsError = storableError(error);
        },
      )
      .addCase(
        sendInquiry.pending,
        (
          state,
          {
            meta: {
              arg: {listing},
            },
          },
        ) => {
          state.page[listing.id.uuid].sendInquiryInProgress = true;
          state.page[listing.id.uuid].sendInquiryError = null;
        },
      )
      .addCase(
        sendInquiry.fulfilled,
        (
          state,
          {
            meta: {
              arg: {listing},
            },
          },
        ) => {
          state.page[listing.id.uuid].sendInquiryInProgress = false;
        },
      )
      .addCase(
        sendInquiry.rejected,
        (
          state,
          {
            meta: {
              arg: {listing},
            },
          }: {meta: {arg: {}}; error: any},
        ) => {
          state.page[listing.id.uuid].sendInquiryInProgress = false;
          state.page[listing.id.uuid].sendInquiryError = storableError(error);
        },
      )
      .addCase(fetchTimeSlots.pending, (state, {meta}) => {
        const {start, timeZone, listingId, useFetchTimeSlotsForDate} = meta.arg;

        if (useFetchTimeSlotsForDate) {
          // Daily fetch
          const dateId = stringifyDateToISO8601(start, timeZone);
          state.page[listingId.uuid] = {
            ...state.page[listingId.uuid],
            timeSlotsForDate: {
              ...state.page[listingId.uuid]?.timeSlotsForDate,
              [dateId]: {
                fetchTimeSlotsInProgress: true,
                timeSlots: [],
              },
            },
          };
        } else {
          // Monthly fetch
          const monthId = monthIdString(start, timeZone);
          state.page[listingId.uuid] = {
            ...state.page[listingId.uuid],
            monthlyTimeSlots: {
              ...state.page[listingId.uuid]?.monthlyTimeSlots,
              [monthId]: {
                ...state.page[listingId.uuid]?.monthlyTimeSlots?.[monthId],
                fetchTimeSlotsInProgress: true,
              },
            },
          };
        }
      })

      .addCase(fetchTimeSlots.fulfilled, (state, {meta, payload}) => {
        const {listingId, useFetchTimeSlotsForDate} = meta.arg;

        if (useFetchTimeSlotsForDate && payload.dateId) {
          // Daily success
          const {dateId, timeSlots} = payload;
          state.page[listingId.uuid] = {
            ...state.page[listingId.uuid],
            timeSlotsForDate: {
              ...state.page[listingId.uuid]?.timeSlotsForDate,
              [dateId]: {
                fetchTimeSlotsInProgress: false,
                timeSlots,
              },
            },
          };
        } else if (payload.monthId) {
          // Monthly success
          const {monthId, timeSlots} = payload;
          state.page[listingId.uuid] = {
            ...state.page[listingId.uuid],
            monthlyTimeSlots: {
              ...state.page[listingId.uuid]?.monthlyTimeSlots,
              [monthId]: {
                ...state.page[listingId.uuid]?.monthlyTimeSlots?.[monthId],
                fetchTimeSlotsInProgress: false,
                timeSlots,
              },
            },
          };
        }
      })

      .addCase(fetchTimeSlots.rejected, (state, {meta, payload}) => {
        const {start, timeZone, listingId, useFetchTimeSlotsForDate} = meta.arg;

        if (useFetchTimeSlotsForDate) {
          // Daily error
          const dateId = stringifyDateToISO8601(start, timeZone);
          state.page[listingId.uuid] = {
            ...state.page[listingId.uuid],
            timeSlotsForDate: {
              ...state.page[listingId.uuid]?.timeSlotsForDate,
              [dateId]: {
                fetchTimeSlotsInProgress: false,
                fetchTimeSlotsError: payload?.error,
              },
            },
          };
        } else {
          // Monthly error
          const monthId = monthIdString(start, timeZone);
          state.page[listingId.uuid] = {
            ...state.page[listingId.uuid],
            monthlyTimeSlots: {
              ...state.page[listingId.uuid]?.monthlyTimeSlots,
              [monthId]: {
                ...state.page[listingId.uuid]?.monthlyTimeSlots?.[monthId],
                fetchTimeSlotsInProgress: false,
                fetchTimeSlotsError: payload?.error,
              },
            },
          };
        }
      })

      .addCase(fetchTransactionLineItems.pending, (state, {meta}) => {
        const {listingId} = meta.arg;
        state.page[listingId.uuid].fetchLineItemsInProgress = true;
        state.page[listingId.uuid].fetchLineItemsError = null;
      })
      .addCase(
        fetchTransactionLineItems.fulfilled,
        (state, {payload, meta}) => {
          const {listingId} = meta.arg;
          state.page[listingId.uuid].fetchLineItemsInProgress = false;
          state.page[listingId.uuid].lineItems = payload;
        },
      )
      .addCase(fetchTransactionLineItems.rejected, (state, {payload, meta}) => {
        const {listingId} = meta.arg;
        state.page[listingId.uuid].fetchLineItemsInProgress = false;
        state.page[listingId.uuid].fetchLineItemsError = payload;
      });
  },
});

export const loadListing = createAsyncThunk<{}, {}, Thunk>(
  'listing/loadListing',
  async ({id, config}, {dispatch, extra: sdk}) => {
    try {
      const {
        aspectWidth = 1,
        aspectHeight = 1,
        variantPrefix = 'listing-card',
      } = config.layout.listingImage;
      const aspectRatio = aspectHeight / aspectWidth;
      const listingId = new UUID(id);
      const response = await sdk.listings.show({
        id: listingId,
        include: ['author', 'images', 'author.profileImage', 'currentStock'],
        'fields.user': ['createdAt', 'profile'],
        'fields.image': [
          'variants.scaled-small',
          'variants.scaled-medium',
          `variants.${variantPrefix}`,
          `variants.${variantPrefix}-2x`,
        ],
        ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
        ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
      });
      const authorId = response.data.included?.find(
        (i: any) => i.type === 'users',
      )?.id.uuid;
      dispatch(addMarketplaceEntities({sdkResponse: response}));
      await Promise.all([
        dispatch(loadListingReviews(id)),
        dispatch(
          loadSimilarListings({userId: authorId, config, listingId: id}),
        ),
      ]);
      const listing = response.data.data;
      const transactionProcessAlias =
        listing?.attributes?.publicData?.transactionProcessAlias || '';
      if (isBookingProcessAlias(transactionProcessAlias)) {
        // Fetch timeSlots.
        // This can happen parallel to loadData.
        // We are not interested to return them from loadData call.
        fetchMonthlyTimeSlots(dispatch, listing);
      }
      return response;
    } catch (error) {
      console.log('error', error);
      return storableError(error);
    }
  },
);
export const loadListingReviews = createAsyncThunk<{}, {}, Thunk>(
  'listing/loadListingReviews',
  async (id, {dispatch, extra: sdk}) => {
    try {
      const listingId = new UUID(id);
      const response = await sdk.reviews.query({
        listing_id: listingId,
        state: 'public',
        include: ['author', 'author.profileImage'],
      });

      dispatch(addMarketplaceEntities({sdkResponse: response}));
      const reviews = denormalisedResponseEntities(response);
      return reviews;
    } catch (error) {
      return storableError(error);
    }
  },
);

export const loadSimilarListings = createAsyncThunk<
  {},
  {userId: string; listingId: string},
  Thunk
>(
  'listing/getSimilarListings',
  async ({userId, config}, {dispatch, extra: sdk}) => {
    try {
      const {
        aspectWidth = 1,
        aspectHeight = 1,
        variantPrefix = 'listing-card',
      } = config.layout.listingImage;
      const aspectRatio = aspectHeight / aspectWidth;

      const authorId = userId?.uuid ?? userId;
      const response = await sdk.listings.query({
        authorId,
        include: ['author', 'images'],
        'fields.image': [
          'variants.scaled-small',
          'variants.scaled-medium',
          `variants.${variantPrefix}`,
          `variants.${variantPrefix}-2x`,
        ],
        ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
        ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
        perPage: 7,
      });
      dispatch(addMarketplaceEntities({sdkResponse: response}));
      return response;
    } catch (error) {
      return storableError(error);
    }
  },
);

export const sendInquiry = createAsyncThunk(
  'listing/sendInquiry',
  async ({listing, message}, {dispatch, extra: sdk}) => {
    try {
      const processAlias =
        listing?.attributes?.publicData?.transactionProcessAlias;
      const listingId = listing?.id;
      const [processName, alias] = processAlias.split('/');
      const transitions = getProcess(processName)?.transitions;
      const bodyParams = {
        transition: transitions.INQUIRE,
        processAlias,
        params: {listingId},
      };
      const response = await sdk.transactions.initiate(bodyParams);
      const transactionId = response.data.data.id;
      // Send the message to the created transaction
      await sdk.messages.send({transactionId, content: message});
      return transactionId;
    } catch (error) {
      console.log('error', error);
      return storableError(error);
    }
  },
);

const timeSlotsRequest = params => (dispatch, getState, sdk) => {
  return sdk.timeslots.query(params).then(response => {
    return denormalisedResponseEntities(response);
  });
};

type FetchTimeSlotsArgs = {
  listingId: any; // or UUID obj
  start: Date;
  end: Date;
  timeZone: string;
  options?: {
    extraQueryParams?: {
      intervalDuration: string;
      intervalAlign: Date;
      maxPerInterval: number;
      minDurationStartingInInterval: number;
      perPage: number;
      page: number;
    };
    useFetchTimeSlotsForDate?: boolean;
  } | null;
};

export const fetchTimeSlots = createAsyncThunk<
  // Return type
  {monthId?: string; dateId?: string; timeSlots: any},
  // Arg type
  FetchTimeSlotsArgs
>(
  'listing/fetchTimeSlots',
  async ({listingId, start, end, timeZone, options}, {dispatch}) => {
    const {extraQueryParams = null, useFetchTimeSlotsForDate = false} =
      options || {};
    // The maximum pagination page size for timeSlots is 500
    const extraParams = extraQueryParams || {
      perPage: 500,
      page: 1,
    };

    try {
      const timeSlots = await dispatch(
        timeSlotsRequest({listingId, start, end, ...extraParams}),
      );

      if (useFetchTimeSlotsForDate) {
        const dateId = stringifyDateToISO8601(start, timeZone);
        return {dateId, timeSlots};
      }

      const monthId = monthIdString(start, timeZone);
      // console.log('timeSlots in slice', JSON.stringify(timeSlots));
      return {monthId, timeSlots};
    } catch (e: any) {
      const error = storableError(e);
      throw error;
    }
  },
);
// try {
//   const timeSlots = await dispatch(
//     timeSlotsRequest({ listingId, start, end, ...extraParams }),
//   );
//   console.log('timeSlots-------->>>>>>>', JSON.stringify(timeSlots));
//   const response = { monthId, timeSlots };
//   return response;
// } catch (e) {
//   console.log('e...', e);
//   const error = storableError(e);
//   return error;
// }

export const fetchTransactionLineItems = createAsyncThunk(
  'listing/fetchTransactionLineItems',
  async params => {
    try {
      const response = await transactionLineItems(params);
      const lineItems = response?.data;
      return lineItems;
    } catch (e: any) {
      console.log(JSON.stringify(e), 'fetching-line-items-failed');
      return storableError(e);
    }
  },
);

export const {removePageFromState, addPageToState, clearLineItems} =
  listingSlice.actions;

export const loadListingPageInprogressSelector = (
  state: RootState,
  listingId: string,
) => state.listing.page?.[listingId]?.loadListingPageInprogress;

export const loadListingPageErrorSelector = (
  state: RootState,
  listingId: string,
) => state.listing.page?.[listingId]?.loadListingPageError;

export const loadListingPageSuccessSelector = (
  state: RootState,
  listingId: string,
) => state.listing.page?.[listingId]?.loadListingPageSuccess;

export const loadingReviewsInProgressSelector = (
  state: RootState,
  listingId: string,
) => state.listing.page?.[listingId]?.loadingReviewsInProgress;

export const reviewsErrorSelector = (state: RootState, listingId: string) =>
  state.listing.page?.[listingId]?.reviewsError;

export const reviewsSelector = (state: RootState, listingId: string) =>
  state.listing.page?.[listingId]?.reviews;

export const similarListingIdsSelector = (
  state: RootState,
  listingId: string,
) => state.listing.page?.[listingId]?.similarListingIds;

export const getSimilarListingsInProgressSelector = (
  state: RootState,
  listingId: string,
) => state.listing.page?.[listingId]?.getSimilarListingsInProgress;

export const getSimilarListingsErrorSelector = (
  state: RootState,
  listingId: string,
) => state.listing.page?.[listingId]?.getSimilarListingsError;

export const sendInquiryInProgressSelector = (
  state: RootState,
  listingId: string,
) => state.listing.page?.[listingId]?.sendInquiryInProgress;

export const sendInquiryErrorSelector = (state: RootState, listingId: string) =>
  state.listing.page?.[listingId]?.sendInquiryError;

export const monthlyTimeSlotsSelector = (state: RootState, listingId: string) =>
  state.listing.page?.[listingId]?.monthlyTimeSlots;

export const timeSlotsPerDateSelector = (state: RootState, listingId: string) =>
  state.listing.page?.[listingId]?.timeSlotsForDate;

export const fetchTimeSlotsInProgressSelector = (
  state: RootState,
  listingId: string,
) => state.listing.page?.[listingId]?.fetchTimeSlotsInProgress;
export const fetchTimeSlotsErrorSelector = (
  state: RootState,
  listingId: string,
) => state.listing.page?.[listingId]?.fetchTimeSlotsError;
export const lineItemsSelector = (state: RootState, listingId: string) =>
  state.listing.page?.[listingId]?.lineItems;
export const fetchLineItemsErrorSelector = (
  state: RootState,
  listingId: string,
) => state.listing.page?.[listingId]?.fetchLineItemsError;
export const fetchLineItemsInProgressSelector = (
  state: RootState,
  listingId: string,
) => state.listing.page?.[listingId]?.fetchLineItemsInProgress;
export const isListingPageCreatedSelector = (
  state: RootState,
  listingId: string,
) => !!state.listing.page?.[listingId];

export default listingSlice.reducer;
