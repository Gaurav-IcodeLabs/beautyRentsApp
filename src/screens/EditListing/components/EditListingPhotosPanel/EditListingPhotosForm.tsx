// import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
} from 'react-native';
import { AppImage, Button } from '../../../../components';
import { useColors, useConfiguration } from '../../../../context';
import { useAppDispatch, useTypedSelector } from '../../../../sharetribeSetup';
import { AppColors, colors, fontWeight } from '../../../../theme';
import {
  commonShadow,
  fontScale,
  requirePayoutDetails,
  screenWidth,
  widthScale,
} from '../../../../util';
import {
  imageUploadingInProgressSelector,
  requestImageUpload,
  selectedListingTypeSelector,
} from '../../EditListing.slice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cross } from '../../../../assets';
import { useNavigation } from '@react-navigation/native';
import {
  fetchStripeAccount,
  stripeAccountSelector,
} from '../../../../slices/StripeConnectAccount.slice';
import {
  getStripeAccountData,
  hasRequirements,
} from '../../../../helpers/StripeHelpers';
import { getListingTypeConfig } from '../../helper';
import { Listing } from '../../../../appTypes';

const LIMIT_IN_BYTES = 20971520; //20MB

interface EditListingPhotosFormProps {
  listingImageConfig: any;
  saveActionMsg: string;
  onSubmit: (values: object) => void;
  inProgress: boolean;
  listing: Listing;
}

const EditListingPhotosForm = (props: EditListingPhotosFormProps) => {
  const config = useConfiguration();
  const { listingImageConfig, saveActionMsg, onSubmit, inProgress, listing } =
    props;
  const [images, setImages] = useState([]);
  const navigation = useNavigation();
  const imageUploadingInProgress = useTypedSelector(
    imageUploadingInProgressSelector,
  );
  const selectedListingType = useTypedSelector(selectedListingTypeSelector);
  const stripeAccount = useTypedSelector(stripeAccountSelector);
  const listingTypeConfig = getListingTypeConfig(
    listing,
    selectedListingType,
    config,
  );
  const isPayoutDetailsRequired = requirePayoutDetails(listingTypeConfig);

  useEffect(() => {
    listing.images.forEach(image => {
      setImages(prevImages => [
        ...prevImages,
        {
          id: image.id.uuid,
          uri: image.attributes.variants['listing-card'].url,
        },
      ]);
    });
  }, [listing?.images]);

  // Through hosted configs (listingTypeConfig.defaultListingFields?.payoutDetails),
  // it's possible to publish listing without payout details set by provider.
  // Customers can't purchase these listings - but it gives operator opportunity to discuss with providers who fail to do so.

  const stripeConnected = !!stripeAccount && !!stripeAccount.id;
  const stripeAccountData = stripeConnected
    ? getStripeAccountData(stripeAccount)
    : null;
  const stripeRequirementsMissing =
    stripeAccount &&
    (hasRequirements(stripeAccountData, 'past_due') ||
      hasRequirements(stripeAccountData, 'currently_due'));

  const dispatch = useAppDispatch();

  const { t } = useTranslation();
  const colors: AppColors = useColors();
  const bottom = useSafeAreaInsets().bottom;

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    const asset = result.assets[0];

    if (asset?.fileSize > LIMIT_IN_BYTES) {
      Alert.alert(
        'Error',
        t('EditListingPhotosForm.imageUploadFailed.uploadOverLimit'),
      );
    }

    if (result.canceled) {
      return;
    }

    const res = await dispatch(
      requestImageUpload({
        file: {
          uri: asset.uri,
          id: `${asset.uri}_${Date.now()}`,
          type: asset.mimeType,
          name: `${Math.random()}_${Date.now()}`,
        },
        listingImageConfig,
      }),
    ).unwrap();

    if (res?.data.data.id) {
      setImages([
        {
          id: res.data.data.id,
          uri: res.data.data.attributes.variants['listing-card'].url,
        },
        ...images,
      ]);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        style={[styles.imagePick]}
        onPress={pickImage}
        disabled={imageUploadingInProgress}
      >
        {imageUploadingInProgress ? (
          <ActivityIndicator size="large" color={colors.marketplaceColor} />
        ) : (
          <>
            <Text style={styles.text}>
              {t('EditListingPhotosForm.chooseImage')}
            </Text>
            <Text>{t('EditListingPhotosForm.imageTypes')}</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.container}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal
          contentContainerStyle={styles.scrollStyles}
        >
          {images?.map((image, index) => {
            return (
              <View key={image?.id?.uuid} style={styles.image}>
                <TouchableOpacity
                  onPress={() => {
                    setImages(images.filter(img => img.id !== image.id));
                  }}
                  style={styles.remove}
                >
                  <Image
                    style={[
                      styles.cross,
                      { tintColor: colors.marketplaceColor },
                    ]}
                    source={cross}
                  />
                </TouchableOpacity>
                <AppImage
                  style={styles.appImageStyle}
                  source={{ uri: image.uri }}
                  width={widthScale(72)}
                />
              </View>
            );
          })}
        </ScrollView>
        <Text style={styles.tipText}>
          {t('EditListingPhotosForm.addImagesTip')}
        </Text>
      </View>

      {isPayoutDetailsRequired && stripeAccount && stripeRequirementsMissing ? (
        <Button
          text="Add Payout"
          onPress={() => navigation.navigate('PayoutSetup')}
          style={[styles.button, { marginBottom: bottom }]}
        />
      ) : (
        <Button
          text={saveActionMsg}
          onPress={() => onSubmit(images.map(img => img.id))}
          disabled={images.length === 0}
          loading={inProgress}
          style={[styles.button, { marginBottom: bottom }]}
        />
      )}
    </View>
  );
};

export default EditListingPhotosForm;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  imagePick: {
    width: screenWidth - widthScale(40),
    height: screenWidth - widthScale(60),
    borderRadius: widthScale(10),
    overflow: 'hidden',
    marginBottom: widthScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.listingBackground,
    alignSelf: 'center',
    ...commonShadow,
  },
  image: {
    marginVertical: widthScale(10),
    marginHorizontal: widthScale(10),
    width: widthScale(72),
    height: widthScale(72),
    borderRadius: widthScale(15),
    ...commonShadow,
  },
  container: {},
  button: {
    marginTop: 'auto',
    marginHorizontal: widthScale(20),
  },
  remove: {
    position: 'absolute',
    top: widthScale(0),
    right: widthScale(0),
    zIndex: 100,
    backgroundColor: colors.white,
    borderRadius: widthScale(20),
    height: widthScale(20),
    width: widthScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cross: {
    width: widthScale(30),
    height: widthScale(30),
  },
  appImageStyle: { borderRadius: widthScale(10) },
  text: {
    color: colors.black,
    fontSize: fontScale(24),
    fontWeight: fontWeight.semiBold,
  },
  scrollStyles: {
    paddingStart: widthScale(10),
    paddingEnd: widthScale(10),
  },
  tipText: {
    marginHorizontal: widthScale(20),
    marginTop: widthScale(10),
    marginBottom: widthScale(30),
    color: colors.black,
    fontSize: fontScale(13),
  },
});
