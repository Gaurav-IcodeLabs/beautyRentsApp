import React from 'react'
import { StyleSheet, View } from 'react-native'
import { CmsCTA } from '../CmsCTA/CmsCTA'
import { Heading } from '../Heading/Heading'
import { Paragraph } from '../Paragraph/Paragraph'
import SectionContainer from '../SectionContainer/SectionContainer'
import { BlockBuilder } from '../BlockBuilder/BlockBuilder'
import { SectionFeaturesProps } from '../../appTypes'
import OverLay from '../OverLay/OverLay'
import { widthScale } from '../../util'

// Section component that shows features.
// Block content are shown in a row-like way:
// [image] text
// text [image]
// [image] text
export const SectionFeatures = (props: SectionFeaturesProps) => {
  const { title, description, callToAction, appearance, blocks } = props
  const hasHeaderFields =
    title.content || description.content || callToAction.content
  const hasBlocks = blocks?.length > 0
  const isOverlay =
    appearance.fieldType !== 'defaultAppearance' &&
    appearance?.backgroundImageOverlay?.preset !== 'none'
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
            <Heading {...title} />
            <Paragraph {...description} />
            <CmsCTA {...callToAction} />
          </View>
        ) : null}
        {hasBlocks ? (
          <BlockBuilder textColor={appearance?.textColor} blocks={blocks} />
        ) : null}
      </View>
    </SectionContainer>
  )
}
const styles = StyleSheet.create({
  section: {
    padding: widthScale(20),
    alignItems: 'center',
  },
})
