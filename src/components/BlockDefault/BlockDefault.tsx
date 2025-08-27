import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Block, CmsAspectRatios, CmsFieldTypes, Media } from '../../appTypes'
import { screenWidth, widthScale } from '../../util'
import { AppImage } from '../AppImage/AppImage'
import { CmsCTA } from '../CmsCTA/CmsCTA'
import { Heading } from '../Heading/Heading'
import { Paragraph } from '../Paragraph/Paragraph'
import { YoutubeIframe } from '../YoutubeIframe/YoutubeIframe'

const FieldMedia = (props: Media) => {
  const { fieldType, aspectRatio, image, youtubeVideoId } = props
  const img =
    CmsAspectRatios.SQUARE === aspectRatio
      ? image?.attributes?.variants?.square1200?.url
      : CmsAspectRatios.LANDSCAPE === aspectRatio
        ? image?.attributes?.variants?.landscape1200?.url
        : CmsAspectRatios.PORTRAIT === aspectRatio
          ? image?.attributes?.variants?.portrait1200?.url
          : image?.attributes?.variants?.original1200?.url

  return fieldType === CmsFieldTypes.IMAGE ? (
    <View style={{ paddingHorizontal: widthScale(10) }}>
      <AppImage
        style={styles.imgStyle}
        width={screenWidth - widthScale(60)}
        source={{ uri: img }}
        aspectRatio={aspectRatio}
      />
    </View>
  ) : fieldType === CmsFieldTypes.YOUTUBE ? (
    <YoutubeIframe
      width={screenWidth - widthScale(40)}
      aspectRatio={aspectRatio}
      youtubeVideoId={youtubeVideoId}
    />
  ) : null
}

export const BlockDefault = (props: Block) => {
  const { title, text, textColor, callToAction, media, isCarousel } = props
  const hasTextComponentFields =
    title.content || text.content || callToAction.content

  return (
    <View style={styles.container}>
      <FieldMedia {...media} />
      {hasTextComponentFields ? (
        <View style={styles.extComponentFields}>
          <Heading
            textStyle={isCarousel ? styles.textStyleCorousal : styles.textStyle}
            color={textColor}
            {...title}
          />
          <Paragraph
            containerStyle={
              isCarousel
                ? styles.textStyleCorousal
                : styles.containerStyleParagraph
            }
            textStyle={styles.textStyleParagraph}
            color={textColor}
            {...text}
          />
          <CmsCTA {...callToAction} />
        </View>
      ) : null}
    </View>
  )
}
const styles = StyleSheet.create({
  container: { marginTop: widthScale(20) },
  extComponentFields: { marginTop: widthScale(20) },
  textStyleCorousal: { marginLeft: widthScale(10) },
  textStyle: { textAlign: 'center' },
  containerStyleParagraph: { alignItems: 'center' },
  textStyleParagraph: { textAlign: 'center' },
  imgStyle: { borderRadius: widthScale(10) },
})
