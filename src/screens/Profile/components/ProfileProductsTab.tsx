import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ListingCardMain } from '../../../components'
import { useTypedSelector } from '../../../sharetribeSetup'
import {
  entitiesSelector,
  getOwnListingsById,
} from '../../../slices/marketplaceData.slice'
import { widthScale } from '../../../util'
import {
  ownListingsInProgressSelector,
  ownListingsResultIdsSelector,
} from '../Profile.slice'
import { useTranslation } from 'react-i18next'
import { fontWeight } from '../../../theme'

const ProfileProductsTab = () => {
  const { t } = useTranslation()
  const searchInProgress = useTypedSelector(ownListingsInProgressSelector)
  const entities = useTypedSelector(entitiesSelector)
  const currentPageResultIds = useTypedSelector(ownListingsResultIdsSelector)
  const listings =
    entities && getOwnListingsById(entities, currentPageResultIds)
  return searchInProgress && !listings.length ? (
    <Text style={styles.noResults}>
      {t('ManageListingsPage.loadingOwnListings')}
    </Text>
  ) : !listings.length ? (
    <Text style={styles.noResults}>{t('ManageListingsPage.noResults')}</Text>
  ) : (
    <View>
      {listings
        .filter(item => !item.attributes.deleted)
        .map(item => {
          return (
            <View key={item?.id?.uuid} style={{ marginBottom: widthScale(20) }}>
              <ListingCardMain fromProfile={true} listing={item} />
            </View>
          )
        })}
    </View>
  )
}

export default ProfileProductsTab

const styles = StyleSheet.create({
  noResults: {
    marginTop: widthScale(100),
    textAlign: 'center',
    fontSize: widthScale(16),
    fontWeight: fontWeight.semiBold,
  },
})
