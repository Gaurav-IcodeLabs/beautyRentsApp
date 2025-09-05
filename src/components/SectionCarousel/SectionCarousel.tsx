import { StyleSheet, View } from 'react-native';
import React from 'react';
import SectionContainer from '../SectionContainer/SectionContainer';
import { Heading } from '../Heading/Heading';
import { Paragraph } from '../Paragraph/Paragraph';
import { CmsCTA } from '../CmsCTA/CmsCTA';
import { BlockBuilder } from '../BlockBuilder/BlockBuilder';
import { SectionCarouselProps } from '../../appTypes';
import OverLay from '../OverLay/OverLay';
import { widthScale } from '../../util';

export const SectionCarousel = (props: SectionCarouselProps) => {
  const { title, description, callToAction, appearance, blocks, sectionId } =
    props;
  const hasHeaderFields =
    title.content || description.content || callToAction.content;
  const hasBlocks = blocks?.length > 0;
  const isOverlay =
    appearance.fieldType !== 'defaultAppearance' &&
    appearance?.backgroundImageOverlay?.preset !== 'none';

  return (
    <SectionContainer appearance={appearance}>
      {isOverlay ? (
        <OverLay
          color={appearance?.backgroundImageOverlay?.color}
          opacity={appearance?.backgroundImageOverlay?.opacity ?? 0}
        />
      ) : null}
      <View style={styles.section}>
        {hasHeaderFields ? (
          <View style={styles.sectionHeader}>
            <Heading textStyle={styles.textStyle} {...title} />
            <Paragraph textStyle={styles.textStyle2} {...description} />
            <CmsCTA {...callToAction} />
          </View>
        ) : null}

        {hasBlocks ? (
          <View>
            <BlockBuilder
              textColor={appearance?.textColor}
              blocks={blocks}
              isCarousel={true}
              sectionId={sectionId}
            />
          </View>
        ) : null}
      </View>
    </SectionContainer>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: widthScale(20),
  },
  sectionHeader: {
    paddingHorizontal: widthScale(20),
  },
  textStyle: { textAlign: 'center' },
  textStyle2: { justifyContent: 'center' },
});
