import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlockBuilder } from '../BlockBuilder/BlockBuilder';
import { CmsCTA } from '../CmsCTA/CmsCTA';
import { Heading } from '../Heading/Heading';
import { Paragraph } from '../Paragraph/Paragraph';
import SectionContainer from '../SectionContainer/SectionContainer';
import { SectionColumnsProps } from '../../appTypes';
import OverLay from '../OverLay/OverLay';
import { widthScale } from '../../util';

export const SectionColumns = (props: SectionColumnsProps) => {
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
          <View>
            <Heading textStyle={styles.textStyle} {...title} />
            <Paragraph textStyle={styles.textStyle} {...description} />
            <CmsCTA {...callToAction} />
          </View>
        ) : null}

        {hasBlocks ? (
          <View>
            <BlockBuilder
              textColor={appearance?.textColor}
              blocks={blocks}
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
    padding: widthScale(20),
  },
  textStyle: { textAlign: 'center' },
});
