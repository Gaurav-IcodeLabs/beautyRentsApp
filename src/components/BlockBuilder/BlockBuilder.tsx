import React from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { Block, BlockBuilderProps } from '../../appTypes'
import { commonShadow, screenWidth, widthScale } from '../../util'
import { BlockDefault } from '../BlockDefault/BlockDefault'
import PaginationCarousel from '../PaginationCarousel/PaginationCarousel'
import { colors } from '../../theme'

export const BlockBuilder = (props: BlockBuilderProps) => {
  const { blocks, isCarousel, textColor } = props

  const [paginationState, setPaginationState] = React.useState(0)

  if (!blocks || blocks.length === 0) {
    return null
  }

  const keyExtractor = (item: Block, index: number) => index.toString()

  const onScrollEnd = (e: any) => {
    const {
      nativeEvent: {
        contentOffset: { x },
      },
    } = e
    const index = Math.floor(x / screenWidth)
    setPaginationState(index)
  }

  const renderItem = ({
    item: block,
    index,
  }: {
    item: Block
    index: number
  }) => (
    <View style={styles.carouselContainer}>
      <BlockDefault isCarousel={isCarousel} {...block} textColor={textColor} />
    </View>
  )

  return (
    <View>
      {isCarousel ? (
        <FlatList
          data={blocks}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          pagingEnabled
          initialNumToRender={2}
          windowSize={2}
          onMomentumScrollEnd={onScrollEnd}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <>
          {blocks.map((block, i) => {
            return (
              <BlockDefault
                key={i.toString()}
                {...block}
                isCarousel={isCarousel}
                textColor={textColor}
              />
            )
          })}
        </>
      )}

      {isCarousel ? (
        <View style={styles.carouselDotContainer}>
          <PaginationCarousel
            dataLength={blocks.length}
            index={paginationState}
          />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  carouselContainer: {
    marginHorizontal: widthScale(20),
    backgroundColor: colors.white,
    borderRadius: widthScale(12),
    marginVertical: widthScale(5),
    overflow: 'visible',
    ...commonShadow,
  },
  carouselDotContainer: {
    marginTop: widthScale(20),
  },
})
