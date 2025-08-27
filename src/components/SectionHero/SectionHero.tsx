import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CmsCTA } from '../CmsCTA/CmsCTA';
import { Heading } from '../Heading/Heading';
import { Paragraph } from '../Paragraph/Paragraph';
import SectionContainer from '../SectionContainer/SectionContainer';
import OverLay from '../OverLay/OverLay';
import { widthScale } from '../../util';
import { SectionHeroProps } from '../../appTypes';

// Section component for a website's hero section
// The Section Hero doesn't have any Blocks by default, all the configurations are made in the Section Hero settings
export const SectionHero = (props: SectionHeroProps) => {
  const { appearance, title, description, callToAction } = props;
  const hasHeaderFields =
    title.content || description.content || callToAction.content;
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
      {hasHeaderFields ? (
        <View style={styles.section}>
          <Heading
            textStyle={styles.textStyle}
            color={appearance?.textColor}
            {...title}
          />
          <Paragraph
            textStyle={styles.textStyle}
            color={appearance?.textColor}
            {...description}
          />
          <CmsCTA {...callToAction} />
        </View>
      ) : null}
    </SectionContainer>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: widthScale(20),
  },
  textStyle: { textAlign: 'center' },
});
