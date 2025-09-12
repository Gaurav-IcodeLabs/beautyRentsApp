import {Listing} from '../../appTypes';
import {AppDispatch} from '../../sharetribeSetup';
import {findNextBoundary, getStartOf} from '../../util';
import {fetchTimeSlots} from './Listing.slice';

// Helper function for loadData call.
// export const fetchMonthlyTimeSlots = (dispatch, listing) => {
//   const hasWindow = typeof window !== 'undefined';
//   console.log('hasWindow', hasWindow);
//   const attributes = listing.attributes;
//   // Listing could be ownListing entity too, so we just check if attributes key exists
//   const hasTimeZone =
//     attributes &&
//     attributes.availabilityPlan &&
//     attributes.availabilityPlan.timezone;

//   // Fetch time-zones on client side only.
//   if (hasWindow && listing.id && hasTimeZone) {
//     const tz = listing.attributes.availabilityPlan.timezone;
//     const unitType = attributes?.publicData?.unitType;
//     const timeUnit = unitType === 'hour' ? 'hour' : 'day';
//     const nextBoundary = findNextBoundary(new Date(), timeUnit, tz);

//     const nextMonth = getStartOf(nextBoundary, 'month', tz, 1, 'months');
//     const nextAfterNextMonth = getStartOf(nextMonth, 'month', tz, 1, 'months');
//     //fetch 3rd month data here instead of calling it on month change
//     const thirdMonth = getStartOf(nextAfterNextMonth, 'month', tz, 1, 'months');

//     return Promise.all([
//       dispatch(
//         fetchTimeSlots({
//           listingId: listing.id,
//           start: nextBoundary,
//           end: nextMonth,
//           timeZone: tz,
//         }),
//       ),
//       dispatch(
//         fetchTimeSlots({
//           listingId: listing.id,
//           start: nextMonth,
//           end: nextAfterNextMonth,
//           timeZone: tz,
//         }),
//       ),
//       dispatch(
//         fetchTimeSlots({
//           listingId: listing.id,
//           start: nextAfterNextMonth,
//           end: thirdMonth,
//           timeZone: tz,
//         }),
//       ),
//     ]);
//   }

//   // By default return an empty array
//   return Promise.all([]);
// };

// Helper function for loadData call.
export const fetchMonthlyTimeSlots = (
  dispatch: AppDispatch,
  listing: Listing,
): Promise<any[]> => {
  if (!listing?.id || !listing?.attributes?.availabilityPlan?.timezone) {
    return Promise.resolve([]);
  }

  const tz = listing.attributes.availabilityPlan.timezone;
  const unitType = listing.attributes.publicData?.unitType;
  const timeUnit = unitType === 'hour' ? 'hour' : 'day';

  const now = new Date();
  const nextBoundary = findNextBoundary(now, timeUnit, tz);
  const nextMonth = getStartOf(nextBoundary, 'month', tz, 1, 'months');
  const nextAfterNextMonth = getStartOf(nextMonth, 'month', tz, 1, 'months');
  const thirdMonth = getStartOf(nextAfterNextMonth, 'month', tz, 1, 'months');

  const minDurationStartingInInterval = 60;
  const buildOptions = (intervalAlign: Date) => {
    return ['fixed', 'hour'].includes(unitType)
      ? {
          extraQueryParams: {
            intervalDuration: 'P1D',
            intervalAlign,
            maxPerInterval: 1,
            minDurationStartingInInterval,
            perPage: 500, //31
            page: 1,
          },
        }
      : null;
  };
  return Promise.all([
    dispatch(
      fetchTimeSlots({
        listingId: listing.id,
        start: nextBoundary,
        end: nextMonth,
        timeZone: tz,
        options: buildOptions(nextBoundary),
      }),
    ),
    dispatch(
      fetchTimeSlots({
        listingId: listing.id,
        start: nextMonth,
        end: nextAfterNextMonth,
        timeZone: tz,
        options: buildOptions(nextMonth),
      }),
    ),
    dispatch(
      fetchTimeSlots({
        listingId: listing.id,
        start: nextAfterNextMonth,
        end: thirdMonth,
        timeZone: tz,
        options: buildOptions(nextAfterNextMonth),
      }),
    ),
  ]);
};
