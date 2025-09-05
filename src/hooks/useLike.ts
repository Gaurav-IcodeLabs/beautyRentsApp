import { useRef } from 'react';
import { useAppDispatch, useTypedSelector } from '../sharetribeSetup';
import {
  currentUserWishListSelector,
  updateCurrentUser,
} from '../slices/user.slice';

export const useLike = (listingId: string) => {
  const dispatch = useAppDispatch();
  const isRequestInProgress = useRef(false);
  const wishListIds = useTypedSelector(currentUserWishListSelector) || [];

  const isLiked = wishListIds.includes(listingId);

  const handleLike = async () => {
    if (isRequestInProgress.current) {
      return;
    }
    isRequestInProgress.current = true;
    const updatedLikedIds = isLiked
      ? wishListIds.filter((id: string) => id !== listingId)
      : [...wishListIds, listingId];
    try {
      await dispatch(
        updateCurrentUser({
          publicData: {
            ['wishList']: updatedLikedIds,
          },
        }),
      ).unwrap();
    } catch (error) {
      console.error('Error updating liked advisors:', error);
    } finally {
      isRequestInProgress.current = false;
    }
  };

  return { isLiked, handleLike };
};
