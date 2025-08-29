import Mapbox from '@rnmapbox/maps';
import _debounce from 'lodash/debounce';
import React, { useCallback, useMemo, useRef } from 'react';
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
import { calculateBounds, createBounds } from '../Search/helper';
import { clone } from 'zod/v4/core';

export const SearchListingMap: React.FC<SearchListingMapProps> = () => {
  const token = process.env.REACT_NATIVE_MAPBOX_ACCESS_TOKEN;
  useMemo(() => {
    if (!token) {
      console.error('Mapbox access token is missing');
      return;
    }
    Mapbox.setAccessToken(token);
    console.log('Mapbox token set');
  }, [token]);

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
  console.log('entities.listings:', entities.listings);
  const listings = getListingsById(entities, searchListingsByMapResultIds);
  console.log('listings:', listings);
  console.log('listings length:', listings.length);
  if (listings.length > 0) {
    console.log(
      'first listing geolocation:',
      listings[0]?.attributes?.geolocation,
    );
  }

  const isGeolocationEqual = (geo1, geo2) => {
    if (!geo1 || !geo2) return false;
    const tolerance = 0.0001;
    return (
      Math.abs(geo1.lat - geo2.lat) < tolerance &&
      Math.abs(geo1.lng - geo2.lng) < tolerance
    );
  };

  const bottomListings = listings.filter((listing: Listing) =>
    isGeolocationEqual(listing?.attributes?.geolocation, selectedCoordinates),
  );

  const getListingByBounds = async (event?: Mapbox.CameraChangedEvent) => {
    console.log('getListingByBounds called');
  
    try {
      const center = event?.properties?.center || (await mapRef.current?.getCenter());
      const zoom = event?.properties?.zoom || (await mapRef.current?.getZoom());
  
      console.log('Map center from event:', center, 'zoom:', zoom);
  
      const bounds = createBounds(center[1], center[0], zoom);
      console.log('bounds-->', bounds);
  
      const action = await dispatch(
        searchListingsByMap({
          bounds,
          config,
        }),
      );
  
      if (action.meta.requestStatus === 'fulfilled') {
        console.log('Dispatch result:', action.payload);
      } else {
        console.error('Dispatch failed:', action.payload);
      }
    } catch (err) {
      console.error('Error in getListingByBounds:', err);
    }
  };
  

  const debounceFn = useMemo(
    () => _debounce(getListingByBounds, 300),
    [dispatch, config] // keep stable
  );


  return (
    <View style={styles.container}>
      <ScreenHeader title={t('Map.heading')} />
      <Mapbox.MapView
        ref={mapRef}
        onRegionIsChanging={debounceFn}
        onDidFinishLoadingMap={() => {
          console.log('Map loaded - triggering initial search');
          getListingByBounds();
        }}
        onError={error => {
          console.error('Mapbox error:', error);
        }}
        style={styles.mapContainer}
      >
        <Mapbox.Camera
          defaultSettings={{
            centerCoordinate: [76.7, 30.7],
            zoomLevel: 10,
          }}
        />

        {listings.map((listing: Listing, index) => {
          const geolocation = listing?.attributes?.geolocation;
          const firstImage =
            listing?.images?.[0]?.attributes?.variants?.['listing-card']?.url;
          if (!geolocation || !firstImage) {
            console.warn(
              `Skipping listing ${index}: Missing geolocation or image`,
              {
                geolocation,
                firstImage,
              },
            );
            return null;
          }
          const isPreviousOrNextListingCoordinateSame =
            index &&
            (isGeolocationEqual(
              geolocation,
              listings[index - 1]?.attributes?.geolocation,
            ) ||
              isGeolocationEqual(
                geolocation,
                listings[index + 1]?.attributes?.geolocation,
              ));
          const isListingSelected = isGeolocationEqual(
            geolocation,
            selectedCoordinates,
          );

          return (
            <Mapbox.MarkerView
              allowOverlap
              key={index}
              coordinate={[geolocation.lng, geolocation.lat]}
            >
              <TouchableOpacity
                onPress={() => {
                  console.log('Selected coordinates:', geolocation);
                  setSelectedCoordinates(geolocation);
                }}
              >
                <Image
                  source={{ uri: firstImage }}
                  contentFit="cover"
                  style={[
                    styles.image,
                    {
                      borderColor: isListingSelected
                        ? colors.white
                        : colors.marketplaceColor,
                      marginLeft: isPreviousOrNextListingCoordinateSame
                        ? widthScale(20) * index
                        : 0,
                    },
                  ]}
                  onError={error => console.error('Image load error:', error)}
                />
              </TouchableOpacity>
            </Mapbox.MarkerView>
          );
        })}
      </Mapbox.MapView>
      <MapSelectedCoordinatesListings listings={bottomListings} />
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

export default React.memo(SearchListingMap);
