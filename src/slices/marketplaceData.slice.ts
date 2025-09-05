import { createSlice } from '@reduxjs/toolkit';
import { denormalisedEntities, updatedEntities } from '../util/data';
import { RootState } from '../sharetribeSetup';

const merge = (state, payload: any) => {
  const { sdkResponse, sanitizeConfig } = payload;
  const apiResponse = sdkResponse.data;
  return {
    ...state,
    entities: updatedEntities(
      { ...state.entities },
      apiResponse,
      sanitizeConfig,
    ),
  };
};

const initialState = {
  // Database of all the fetched entities.
  entities: {},
};

const marketplaceDataSlice = createSlice({
  name: 'marketplaceData',
  initialState,
  reducers: {
    addMarketplaceEntities: (state, action) => {
      const newState = merge(state, action?.payload);
      state.entities = newState.entities;
    },
  },
});

/**
 * Get the denormalised listing entities with the given IDs
 *
 * @param {Object} entities the full Redux store
 * @param {Array<UUID>} listingIds listing IDs to select from the store
 */
export const getListingsById = (entities, listingIds) => {
  const resources = listingIds.map(id => ({
    id,
    type: 'listing',
  }));
  const throwIfNotFound = false;
  return denormalisedEntities(entities, resources, throwIfNotFound);
};

export const getOwnListingsById = (entities, listingIds) => {
  const resources = listingIds.map(id => ({
    id,
    type: 'ownListing',
  }));
  const throwIfNotFound = false;
  return denormalisedEntities(entities, resources, throwIfNotFound);
};

/**
 * Get the denormalised entities from the given entity references.
 *
 * @param {Object} entities the full Redux store
 *
 * @param {Array<{ id, type }>} entityRefs References to entities that
 * we want to query from the data. Currently we expect that all the
 * entities have the same type.
 *
 * @return {Array<Object>} denormalised entities
 */
export const getMarketplaceEntities = (entities, entityRefs: string[]) => {
  const throwIfNotFound = false;
  return denormalisedEntities(entities, entityRefs, throwIfNotFound);
};

export const entitiesSelector = (state: RootState) =>
  state.marketplaceData.entities;

export const { addMarketplaceEntities } = marketplaceDataSlice.actions;

export default marketplaceDataSlice.reducer;
