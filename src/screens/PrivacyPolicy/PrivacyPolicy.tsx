import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup'
import {
  fetchPageAssets,
  pageAssetsInProgressSelector,
  pageAssetsSelector,
} from '../../slices/hostedAssets.slice'
import { AssetNames, CmsSectionTypes } from '../../appTypes'
import { camelize, screenHeight, widthScale } from '../../util'
import { FlashList } from '@shopify/flash-list'
import {
  SectionArticle,
  SectionCarousel,
  SectionColumns,
  SectionFeatures,
  SectionHero,
  ScreenHeader,
} from '../../components'
import { useTranslation } from 'react-i18next'

export const PrivacyPolicy = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const pageAssetsData = useTypedSelector(pageAssetsSelector)
  const inProgress = useTypedSelector(pageAssetsInProgressSelector)

  useEffect(() => {
    const pageAsset = {
      privacyPolicy: `content/pages/${AssetNames.PRIVACY_POLICY}.json`,
    }

    dispatch(fetchPageAssets(pageAsset))
  }, [dispatch])

  const keyExtractor = (item: Record<string, string>, index: number) =>
    (item.sectionType + index).toString()

  const renderItem = ({ item: elm }: { item: any }) => {
    // [SectionFeatures, SectionHero, SectionArticle, SectionColumns] These 4 can be used via 1 single component. On web-template, they have seperate components due to responsiveness and other things. Maybe in future we can eliminate all and use only 1.
    if (elm.sectionType === CmsSectionTypes.FEATURES) {
      return <SectionFeatures {...elm} />
    } else if (elm.sectionType === CmsSectionTypes.HERO) {
      return <SectionHero {...elm} />
    } else if (elm.sectionType === CmsSectionTypes.ARTICLE) {
      return <SectionArticle {...elm} />
    } else if (elm.sectionType === CmsSectionTypes.COLUMNS) {
      return <SectionColumns {...elm} />
    } else if (elm.sectionType === CmsSectionTypes.CAROUSEL) {
      return <SectionCarousel {...elm} />
    }
    return null
  }

  const ListEmpty = () => {
    return inProgress ? (
      <ActivityIndicator size={'large'} style={styles.loader} />
    ) : (
      <Text>{t('TermsOfService.error')}</Text>
    )
  }

  const sections =
    pageAssetsData?.[camelize(AssetNames.PRIVACY_POLICY)]?.data?.sections || []
  return (
    <View style={styles.container}>
      <ScreenHeader title={t('PrivacyPolicy.title')} />
      <FlashList
        nestedScrollEnabled={true}
        data={sections}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        estimatedItemSize={886}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmpty}
        getItemType={item => {
          return item.sectionType
        }}
        drawDistance={screenHeight * 2}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    marginTop: widthScale(300),
  },
})
