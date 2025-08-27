import React from 'react'
import { StyleSheet, View } from 'react-native'
import { SectionArticleProps } from '../../appTypes'
import { widthScale } from '../../util'
import { BlockBuilder } from '../BlockBuilder/BlockBuilder'
import { CmsCTA } from '../CmsCTA/CmsCTA'
import { Heading } from '../Heading/Heading'
import OverLay from '../OverLay/OverLay'
import { Paragraph } from '../Paragraph/Paragraph'
import SectionContainer from '../SectionContainer/SectionContainer'

// Section component that's able to show article content
// The article content is mainly supposed to be inside a block
export const SectionArticle = (props: SectionArticleProps) => {
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
            <Heading color={appearance?.textColor} {...title} />
            <Paragraph color={appearance?.textColor} {...description} />
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
