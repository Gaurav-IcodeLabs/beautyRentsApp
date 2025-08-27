import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
// import { ImageZoom } from '@likashefqet/react-native-image-zoom'
import { Image as ImageTypes } from '../../appTypes/interfaces/common';
import { colors } from '../../theme';
import { screenWidth, widthScale } from '../../util';
import { cross } from '../../assets';

interface FullImageModalProps {
  image: ImageTypes | null;
  open: boolean;
  setOpen: (velue: boolean) => void;
}

export const FullImageModal = (props: FullImageModalProps) => {
  const { image, open, setOpen } = props;

  return (
    <Modal animationType="fade" transparent={true} visible={open}>
      <View style={styles.centeredView}>
        <TouchableOpacity onPress={() => setOpen(false)}>
          <Image source={cross} style={styles.cross} />
        </TouchableOpacity>
        {/* <ImageZoom
          uri={image?.attributes?.variants?.['listing-card']?.url}
          minScale={0.5}
          style={styles.imageZoom}
          maxScale={10}
          renderLoader={() => <View />}
        /> */}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: colors.black,
  },
  imageZoom: {
    resizeMode: 'contain',
    width: screenWidth,
    height: '100%',
    zIndex: -1,
  },
  cross: {
    width: widthScale(24),
    height: widthScale(24),
    position: 'absolute',
    top: widthScale(100),
    right: widthScale(20),
    tintColor: colors.white,
    zIndex: 10,
  },
});
