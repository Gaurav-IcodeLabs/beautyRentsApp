import { StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect } from 'react';
import { useColors, useConfiguration } from '../../../context';
import { useTranslation } from 'react-i18next';
import { fontScale, widthScale } from '../../../util';
import { AppColors, colors, fontWeight } from '../../../theme';
import Mapbox from '@rnmapbox/maps';

interface ListingPageMapProps {
  geolocation: any;
}

const ListingPageMap = (props: ListingPageMapProps) => {
  const { geolocation } = props;
  const { branding } = useConfiguration();
  const { t } = useTranslation();
  const colors: AppColors = useColors();
  const token = process.env.REACT_NATIVE_MAPBOX_ACCESS_TOKEN;
  const logo = branding.logoImageMobile.attributes.variants.scaled2x.url ?? '';

  useEffect(() => {
    Mapbox.setAccessToken(token);
  }, []);

  if (!geolocation) {
    return null;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('ListingPage.locationTitle')}</Text>
      <Mapbox.MapView style={styles.mapContainer}>
        <Mapbox.Camera
          animationDuration={2000}
          zoomLevel={14}
          centerCoordinate={[geolocation.lng, geolocation.lat]}
        />
        <Mapbox.MarkerView coordinate={[geolocation.lng, geolocation.lat]}>
          <Image
            source={{ uri: logo }}
            resizeMode="contain"
            style={[styles.image, { borderColor: colors.marketplaceColor }]}
          />
        </Mapbox.MarkerView>
      </Mapbox.MapView>
    </View>
  );
};

export default ListingPageMap;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: widthScale(20),
    paddingVertical: widthScale(10),
    borderBottomWidth: 1,
    borderColor: colors.frostedGrey,
  },
  mapContainer: {
    marginTop: widthScale(10),
    width: '100%',
    height: widthScale(200),
    borderRadius: widthScale(12),
    overflow: 'hidden',
  },
  heading: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontScale(16),
  },
  image: {
    width: widthScale(50),
    height: widthScale(50),
    borderWidth: 2,
    backgroundColor: colors.white,
    borderRadius: widthScale(25),
  },
});
