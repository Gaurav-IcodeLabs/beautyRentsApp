import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Block, CmsAspectRatios, CmsFieldTypes, Media } from '../../appTypes';
import { fontScale, screenWidth, widthScale } from '../../util';
import { AppImage } from '../AppImage/AppImage';
import { CmsCTA } from '../CmsCTA/CmsCTA';
import { Heading } from '../Heading/Heading';
import { Paragraph } from '../Paragraph/Paragraph';
import { YoutubeIframe } from '../YoutubeIframe/YoutubeIframe';
import { colors, fontWeight } from '../../theme';

const FieldMedia = (props: Media) => {
  const { fieldType, aspectRatio, image, youtubeVideoId, sectionId } = props;
  const isHowItWorksSection = sectionId === 'how-beauty-rent-work';
  const img =
    CmsAspectRatios.SQUARE === aspectRatio
      ? image?.attributes?.variants?.square1200?.url
      : CmsAspectRatios.LANDSCAPE === aspectRatio
      ? image?.attributes?.variants?.landscape1200?.url
      : CmsAspectRatios.PORTRAIT === aspectRatio
      ? image?.attributes?.variants?.portrait1200?.url
      : image?.attributes?.variants?.original1200?.url;
  const width = isHowItWorksSection
    ? widthScale(30)
    : screenWidth - widthScale(60);
  const paddingH = isHowItWorksSection ? widthScale(0) : widthScale(10);

  return fieldType === CmsFieldTypes.IMAGE ? (
    <View style={{ paddingHorizontal: paddingH }}>
      <AppImage
        style={styles.imgStyle}
        width={width}
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
  ) : null;
};

export const BlockDefault = (props: Block) => {
  const { title, text, textColor, callToAction, media, isCarousel, sectionId } =
    props;
  const hasTextComponentFields =
    title.content || text.content || callToAction.content;
  const isHowItWorksSection = sectionId === 'how-beauty-rent-work';
  const isWhatMakeDiffSection = sectionId === 'what-makes-different';
  const isFAQSection = sectionId === 'faq';

  return (
    <View
      style={[
        styles.container,
        isHowItWorksSection && styles.flexRow,
        isFAQSection && styles.faqStyle,
      ]}
    >
      <FieldMedia {...media} sectionId={sectionId} />
      {hasTextComponentFields ? (
        <View
          style={[
            styles.extComponentFields,
            isHowItWorksSection && { marginTop: widthScale(0) },
          ]}
        >
          <Heading
            containerStyle={
              isHowItWorksSection ? { marginBottom: widthScale(0) } : {}
            }
            textStyle={
              isCarousel
                ? styles.textStyleCorousal
                : isHowItWorksSection
                ? styles.textStyleNew
                : isFAQSection
                ? styles.faqHeadingStyle
                : styles.textStyle
            }
            color={textColor}
            {...title}
          />
          {sectionId === 'cities-location' ? null : (
            <Paragraph
              containerStyle={
                isCarousel
                  ? styles.textStyleCorousal
                  : isHowItWorksSection
                  ? styles.newParaStyle
                  : isWhatMakeDiffSection
                  ? styles.makeDiffSection
                  : isFAQSection
                  ? styles.faqParaStyle
                  : styles.containerStyleParagraph
              }
              textStyle={
                isHowItWorksSection
                  ? styles.textParagraphNew
                  : isWhatMakeDiffSection
                  ? styles.makeDiffText
                  : isFAQSection
                  ? styles.faqParaText
                  : styles.textStyleParagraph
              }
              color={textColor}
              {...text}
            />
          )}
          <CmsCTA {...callToAction} />
        </View>
      ) : null}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { marginTop: widthScale(20) },
  extComponentFields: { marginTop: widthScale(20) },
  textStyleCorousal: { marginLeft: widthScale(10) },
  textStyle: { textAlign: 'center' },
  textStyleNew: {
    textAlign: 'left',
    paddingLeft: widthScale(10),
  },
  containerStyleParagraph: {
    alignItems: 'center',
  },
  textStyleParagraph: {
    textAlign: 'center',
  },
  imgStyle: { borderRadius: widthScale(10) },
  flexRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  newParaStyle: {
    alignItems: 'flex-start',
    width: '95%',
    marginBottom: widthScale(0),
  },
  textParagraphNew: {
    flexShrink: 1,
    textAlign: 'left',
    paddingLeft: widthScale(5),
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    color: colors.darkGrey,
  },
  makeDiffSection: {},
  makeDiffText: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
    textAlign: 'auto',
  },
  faqStyle: {
    marginTop: widthScale(0),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  faqHeadingStyle: {
    alignItems: 'flex-start',
  },
  faqParaStyle: {
    alignItems: 'flex-start',
    paddingLeft: widthScale(10),
  },
  faqParaText: {
    textAlign: 'left',
  },
});
