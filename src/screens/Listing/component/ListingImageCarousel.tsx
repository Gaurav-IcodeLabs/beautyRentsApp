import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {Image as ImageTypes} from '../../../appTypes/interfaces/common';
import {
  AnimatedDotsCarousel,
  AppImage,
  FullImageModal,
  LikeButton,
} from '../../../components';
import {fontScale, screenWidth, widthScale} from '../../../util';
import {colors, fontWeight} from '../../../theme';

interface ListingImageCarouselProps {
  images: ImageTypes[];
  totalRatingSum?: number;
  totalRatings?: number;
  listingId?: string;
}

const ListingImageCarousel = (props: ListingImageCarouselProps) => {
  const {images, totalRatingSum = 0, totalRatings = 0, listingId} = props;
  const [open, setOpen] = React.useState(false);
  const [image, setImage] = React.useState<ImageTypes | null>(null);
  const [paginationIndex, setPaginationIndex] = React.useState(0);

  const onScrollEnd = (e: any) => {
    const {
      nativeEvent: {
        contentOffset: {x},
      },
    } = e;
    const index = Math.floor(x / screenWidth);
    setPaginationIndex(index);
  };

  const averageRating =
    totalRatings > 0
      ? Math.round((totalRatingSum / totalRatings) * 10) / 10
      : 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        overScrollMode="never"
        bounces={false}
        renderItem={({item}) => {
          return (
            <Pressable
              onPress={() => {
                // setOpen(true);
                // setImage(item);
              }}
              style={styles.imageContainer}>
              <AppImage
                source={{
                  uri: item?.attributes?.variants?.['listing-card']?.url,
                }}
                width={screenWidth - widthScale(40)}
                style={{borderRadius: widthScale(10)}}
              />
            </Pressable>
          );
        }}
        onMomentumScrollEnd={onScrollEnd}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
      />
      {listingId && (
        <View style={styles.likeButton}>
          <LikeButton id={listingId} />
        </View>
      )}
      <View
        style={[
          styles.ratingSection,
          {bottom: images?.length > 1 ? widthScale(7 + 28) : widthScale(7)},
        ]}>
        <Text style={styles.rating}>
          {averageRating} ({totalRatings}) {'Reviews'}
        </Text>
      </View>
      <AnimatedDotsCarousel
        activeIndex={paginationIndex}
        dataLength={images?.length}
        containerStyle={styles.paginationCarousel}
      />

      <FullImageModal
        open={open}
        image={image}
        setOpen={v => {
          setOpen(v);
        }}
      />
    </View>
  );
};

export default ListingImageCarousel;

const styles = StyleSheet.create({
  container: {},
  imageContainer: {
    marginHorizontal: widthScale(20),
    borderRadius: widthScale(10),
    marginVertical: widthScale(20),
    backgroundColor: colors.white,
  },
  paginationCarousel: {
    marginVertical: widthScale(10),
  },
  botomLine: {
    borderBottomWidth: 1,
    marginHorizontal: widthScale(20),
    borderColor: colors.frostedGrey,
  },
  ratingSection: {
    backgroundColor: colors.marketplaceColor,
    alignSelf: 'center',
    paddingHorizontal: widthScale(12),
    paddingVertical: widthScale(6),
    borderRadius: widthScale(20),
    position: 'absolute',
    zIndex: 10,
  },
  rating: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.normal,
    color: colors.white,
  },
  likeButton: {
    position: 'absolute',
    right: widthScale(30),
    top: widthScale(30),
  },
});
