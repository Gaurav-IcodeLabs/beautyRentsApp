import React from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { Image as ImageTypes } from '../../../appTypes/interfaces/common'
import { AppImage, FullImageModal } from '../../../components'
import PaginationCarousel from '../../../components/PaginationCarousel/PaginationCarousel'
import { commonShadow, screenWidth, widthScale } from '../../../util'
import { colors } from '../../../theme'

interface ListingImageCarouselProps {
  images: ImageTypes[]
}

const ListingImageCarousel = (props: ListingImageCarouselProps) => {
  const { images } = props
  const [open, setOpen] = React.useState(false)
  const [image, setImage] = React.useState<ImageTypes | null>(null)
  const [paginationIndex, setPaginationIndex] = React.useState(0)

  const onScrollEnd = (e: any) => {
    const {
      nativeEvent: {
        contentOffset: { x },
      },
    } = e
    const index = Math.floor(x / screenWidth)
    setPaginationIndex(index)
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        renderItem={({ item }) => {
          return (
            <Pressable
              onPress={() => {
                setOpen(true)
                setImage(item)
              }}
              style={styles.imageContainer}>
              <AppImage
                source={{
                  uri: item?.attributes?.variants?.['listing-card']?.url,
                }}
                width={screenWidth - widthScale(40)}
              />
            </Pressable>
          )
        }}
        onMomentumScrollEnd={onScrollEnd}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
      />

      <PaginationCarousel
        dataLength={images?.length}
        index={paginationIndex}
        style={styles.paginationCarousel}
      />

      <FullImageModal
        open={open}
        image={image}
        setOpen={v => {
          setOpen(v)
        }}
      />
    </View>
  )
}

export default ListingImageCarousel

const styles = StyleSheet.create({
  container: {},
  imageContainer: {
    marginHorizontal: widthScale(20),
    borderRadius: widthScale(10),
    overflow: 'hidden',
    marginTop: widthScale(20),
    marginBottom: widthScale(5),
    ...commonShadow,
    backgroundColor: colors.white,
  },

  img: {},
  paginationCarousel: {
    marginVertical: widthScale(10),
  },
  botomLine: {
    borderBottomWidth: 1,
    marginHorizontal: widthScale(20),
    borderColor: colors.frostedGrey,
  },
})
