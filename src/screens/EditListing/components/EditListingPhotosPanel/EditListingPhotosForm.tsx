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
import { useConfiguration } from '../../../../context';
import { useAppDispatch, useTypedSelector } from '../../../../sharetribeSetup';
import { colors, fontWeight } from '../../../../theme';
import {
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
import { cross, uploadIcon } from '../../../../assets';
import { useNavigation } from '@react-navigation/native';
import {
  // fetchStripeAccount,
  stripeAccountSelector,
} from '../../../../slices/StripeConnectAccount.slice';
import {
  getStripeAccountData,
  hasRequirements,
} from '../../../../helpers/StripeHelpers';
import { getListingTypeConfig } from '../../helper';
import { Listing } from '../../../../appTypes';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';

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
  const bottom = useSafeAreaInsets().bottom;

  const pickImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 5,
    };
    let result = await launchImageLibrary(options);
    if (result.didCancel) {
      return;
    }

    const assets = result.assets || [];

    const validImages = [];

    for (const asset of assets) {
      if (asset?.fileSize && asset?.fileSize > LIMIT_IN_BYTES) {
        Alert.alert(
          'Error',
          t('EditListingPhotosForm.imageUploadFailed.uploadOverLimit'),
        );
        continue;
      }

      try {
        const res = await dispatch(
          requestImageUpload({
            file: {
              uri: asset.uri,
              id: `${asset.uri}_${Date.now()}`,
              type: asset.type,
              name: `${Math.random()}_${Date.now()}`,
            },
            listingImageConfig,
          }),
        ).unwrap();

        if (res?.data?.data?.id) {
          validImages.push({
            id: res?.data.data.id,
            uri: res.data.data.attributes.variants['listing-card'].url,
          });
        }
      } catch (error) {
        console.error('error image upliad', error);
      }
    }

    if (validImages.length > 0) {
      setImages([...validImages, ...images]);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.imagePick}
        onPress={pickImage}
        disabled={imageUploadingInProgress}
      >
        {imageUploadingInProgress ? (
          <ActivityIndicator size="large" color={colors.marketplaceColor} />
        ) : (
          <View style={styles.textSection}>
            <Image
              style={styles.uploadIcon}
              source={uploadIcon}
              tintColor={colors.marketplaceColor}
            />
            <Text style={styles.text}>
              {t('EditListingPhotosForm.chooseImage')}
            </Text>
            <Text>{t('EditListingPhotosForm.imageTypes')}</Text>
          </View>
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
              <View key={index} style={styles.image}>
                <TouchableOpacity
                  onPress={() => {
                    setImages(images.filter(img => img.id !== image.id));
                  }}
                  style={styles.remove}
                >
                  <Image style={styles.cross} source={cross} />
                </TouchableOpacity>
                <AppImage
                  style={styles.appImageStyle}
                  source={{ uri: image.uri }}
                  width={widthScale(80)}
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
    marginHorizontal: widthScale(20),
    height: screenWidth / 2,
    borderRadius: widthScale(12),
    overflow: 'hidden',
    marginBottom: widthScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.marketplaceColor,
    borderStyle: 'dashed',
  },
  textSection: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    marginVertical: widthScale(10),
    marginHorizontal: widthScale(10),
    width: widthScale(80),
    height: widthScale(80),
    borderRadius: widthScale(15),
    justifyContent: 'center',
  },
  container: {},
  button: {
    marginTop: 'auto',
    marginHorizontal: widthScale(20),
  },
  remove: {
    position: 'absolute',
    top: widthScale(-3),
    right: widthScale(-3),
    zIndex: 100,
    backgroundColor: colors.white,
    borderRadius: widthScale(10),
    height: widthScale(15),
    width: widthScale(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cross: {
    width: widthScale(22),
    height: widthScale(22),
    tintColor: colors.marketplaceColor,
  },
  uploadIcon: {
    height: widthScale(30),
    width: widthScale(30),
    marginBottom: widthScale(5),
  },
  appImageStyle: {
    borderRadius: widthScale(10),
  },
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
