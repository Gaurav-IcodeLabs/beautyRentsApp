// import Mapbox from '@rnmapbox/maps'
// import _debounce from 'lodash/debounce'
// import isEqual from 'lodash/isEqual'
import _debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { Listing, SearchListingMapProps } from '../../appTypes';
import { ScreenHeader } from '../../components';
import { useColors, useConfiguration } from '../../context';
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup';
import {
  entitiesSelector,
  getListingsById,
} from '../../slices/marketplaceData.slice';
import { AppColors, colors } from '../../theme';
import { widthScale } from '../../util';
import {
  searchListingsByMap,
  searchListingsByMapResultIdsSelector,
} from '../Search/Search.slice';
import MapSelectedCoordinatesListings from './MapSelectedCoordinatesListing/MapSelectedCoordinatesListings';

export const SearchListingMap: React.FC<SearchListingMapProps> = () => {
  const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
  useMemo(() => Mapbox.setAccessToken(token), []);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const config = useConfiguration();
  const mapRef = useRef(null);
  const colors: AppColors = useColors();
  const [selectedCoordinates, setSelectedCoordinates] = React.useState(null);
  const searchListingsByMapResultIds = useTypedSelector(
    searchListingsByMapResultIdsSelector,
  );
  const entities = useTypedSelector(entitiesSelector);
  const listings = getListingsById(entities, searchListingsByMapResultIds);
  const bottomListings = listings.filter((listing: Listing) =>
    isEqual(listing?.attributes?.geolocation, selectedCoordinates),
  );
  const getListingByBounds = async () => {
    if (mapRef.current) {
      const visibleBounds = await mapRef.current.getVisibleBounds();
      const bounds = [
        [visibleBounds[0][1], visibleBounds[0][0]], // NE lat, NE lng
        [visibleBounds[1][1], visibleBounds[1][0]], // SW lat, SW lng
      ];

      dispatch(searchListingsByMap({ bounds, config }));
    }
  };
  const debounceFn = _debounce(getListingByBounds, 500, {
    leading: false,
    trailing: true,
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('Map.heading')} />
      {/* <Mapbox.MapView
        ref={mapRef}
        onCameraChanged={debounceFn}
        style={styles.mapContainer}>
        {listings.map((listing: Listing, index) => {
          const geolocation = listing?.attributes?.geolocation
          const firstImage =
            listing?.images?.[0]?.attributes?.variants?.['listing-card']?.url
          const isPrviousOrNextListingCoordinateSame =
            index &&
            (isEqual(
              geolocation,
              listings[index - 1]?.attributes?.geolocation,
            ) ||
              isEqual(
                geolocation,
                listings[index + 1]?.attributes?.geolocation,
              ))
          const isListingSelected = isEqual(geolocation, selectedCoordinates)

          return (
            <Mapbox.MarkerView
              allowOverlap
              key={index}
              coordinate={[geolocation?.lng, geolocation?.lat]}>
              <TouchableOpacity
                onPress={() => setSelectedCoordinates(geolocation)}>
                <Image
                  source={{ uri: firstImage }}
                  contentFit="cover"
                  style={[
                    styles.image,
                    {
                      borderColor: isListingSelected
                        ? colors.white
                        : colors.marketplaceColor,
                      marginLeft: isPrviousOrNextListingCoordinateSame
                        ? widthScale(20) * index
                        : 0,
                    },
                  ]}
                />
              </TouchableOpacity>
            </Mapbox.MarkerView>
          )
        })}
      </Mapbox.MapView> */}
      {/* <MapSelectedCoordinatesListings listings={bottomListings} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  image: {
    width: widthScale(50),
    height: widthScale(50),
    borderWidth: 2,
    backgroundColor: colors.white,
    borderRadius: widthScale(25),
  },
});
