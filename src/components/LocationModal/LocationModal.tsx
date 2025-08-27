import { zodResolver } from '@hookform/resolvers/zod';
import _debounce from 'lodash/debounce';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { useConfiguration } from '../../context';
import { colors } from '../../theme';
import { fontScale, widthScale } from '../../util';
import { RenderTextInputField } from '../RenderTextInputField/RenderTextInputField';
import { ScreenHeader } from '../ScreenHeader/ScreenHeader';
import { getLocationSchema, getPlaceDetails } from './helper';

export const LocationModal = forwardRef((props, ref) => {
  const {
    maps: { mapboxConfig, mapboxAccessToken },
  } = useConfiguration();
  console.log('mapboxConfig', mapboxConfig);
  console.log('mapboxAccessToken', mapboxAccessToken);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const {
    visible,
    onModalClose,
    onSelectLocation = () => {},
    placeholderKey,
    labelKey,
  } = props;
  const {
    control,
    formState: { isValid },
    setValue,
  } = useForm({
    defaultValues: {
      address: '',
      geolocation: '',
    },
    resolver: zodResolver(getLocationSchema(z)),
    mode: 'onChange',
  });

  const fetchLocations = async query => {
    try {
      setLoading(true);
      const { GEOCODING_PLACES_BASE_URL, limit, language } = mapboxConfig;
      const res = await fetch(
        `${GEOCODING_PLACES_BASE_URL}/${encodeURIComponent(
          query,
        )}.json?limit=${limit}&language=${language}&access_token=${mapboxAccessToken}`,
      );

      const data = await res.json();
      setLocations(data.features);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('unable to fetch places');
    }
  };

  const selectLocationPress = location => {
    //empty the locations array
    setLocations([]);
    const { address, origin } = getPlaceDetails(location);
    setValue('geolocation', origin);
    setValue('address', address);
    onSelectLocation('geolocation', origin);
    onSelectLocation('address', address);
    onModalClose();
  };

  const debounceFn = _debounce(fetchLocations, 500, {
    leading: false,
    trailing: true,
  });

  const clearField = () => {
    setValue('address', '');
    setValue('geolocation', '');
  };

  useImperativeHandle(ref, () => ({
    clearField,
  }));

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.container}>
        <ScreenHeader onLeftIconPress={onModalClose} title="Enter Location" />
        <View style={styles.containerMapBox}>
          <RenderTextInputField
            autoCapitalize="none"
            control={control}
            name={'address'}
            labelKey={labelKey}
            placeholderKey={placeholderKey}
            onChangeText={(txt: string, cb: Function) => {
              cb(txt);
              if (txt.length >= 3) {
                debounceFn(txt);
              }
            }}
            autoFocus={true}
          />
          {loading && <ActivityIndicator color={colors.grey} size={'small'} />}
          {!!locations?.length && (
            <View style={[styles.dropDownContainer]}>
              <ScrollView>
                {locations.map((location, index) => (
                  <TouchableOpacity
                    style={styles.locationsTouchable}
                    key={index}
                    onPress={() => selectLocationPress(location)}
                  >
                    <Text style={styles.locationText} numberOfLines={2}>
                      {location.place_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  containerMapBox: {
    flex: 1,
    marginHorizontal: widthScale(20),
    marginTop: widthScale(20),
  },
  dropDownContainer: {
    flex: 1,
    paddingHorizontal: widthScale(10),
    backgroundColor: colors.white,
    marginBottom: widthScale(50),
  },
  locationText: {
    fontSize: fontScale(14),
    marginVertical: widthScale(10),
    color: colors.black,
  },
  locationsTouchable: {
    borderBottomWidth: 1,
    borderBottomColor: colors.frostedGrey,
    paddingVertical: widthScale(5),
  },
});
