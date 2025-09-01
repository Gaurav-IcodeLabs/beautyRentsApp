import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { addImage, avatar } from '../../../assets';
import { AppImage } from '../../../components';
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup';
import { colors } from '../../../theme';
import { heightScale, widthScale } from '../../../util';
import {
  imageUploadInProgressSelector,
  requestImageUpload,
} from '../ProfileSettings.slice';

const LIMIT_IN_BYTES = 20971520; //20MB

interface ProfileImageProps {
  control: any;
  setValue: (key: string, value: string) => void;
}

const ProfileImage = ({ control, setValue }: ProfileImageProps) => {
  const { image } = useWatch({ control });

  const imageUrl = image?.attributes?.variants?.['square-small2x']?.url;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const loader = useTypedSelector(imageUploadInProgressSelector);
  const pickImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 1,
    };
    let result = await launchImageLibrary(options);
    if (result.didCancel || !result.assets?.length) {
      return;
    }
    const asset = result.assets[0];
    if (asset?.fileSize && asset.fileSize > LIMIT_IN_BYTES) {
      Alert.alert(
        'Error',
        t('EditListingPhotosForm.imageUploadFailed.uploadOverLimit'),
      );
      return;
    }

    const res = await dispatch(
      requestImageUpload({
        file: {
          uri: asset.uri,
          id: `${asset.uri}_${Date.now()}`,
          type: asset.type,
          name: `${Math.random()}_${Date.now()}`,
        },
      }),
    ).unwrap();
    setValue('image', res?.data?.data);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={pickImage}
      style={styles.container}
    >
      <View style={styles.loaderContainer}>
        {loader ? <ActivityIndicator color={colors.black} /> : null}
      </View>
      <View style={styles.imgContainer}>
        <AppImage
          source={imageUrl ? { uri: imageUrl } : avatar}
          width={widthScale(100)}
        />
      </View>
      <View style={styles.add}>
        <Image
          tintColor={colors.white}
          style={styles.addImage}
          source={addImage}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ProfileImage;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginVertical: heightScale(40),
  },
  imgContainer: {
    overflow: 'hidden',
    height: widthScale(100),
    width: widthScale(100),
    borderRadius: widthScale(100),
    backgroundColor: 'white',
  },
  addImage: {
    height: widthScale(15),
    width: widthScale(15),
  },
  add: {
    height: widthScale(25),
    width: widthScale(25),
    position: 'absolute',
    bottom: 8,
    right: -4,
    zIndex: 4,
    borderRadius: widthScale(20),
    backgroundColor: colors.marketplaceColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});
