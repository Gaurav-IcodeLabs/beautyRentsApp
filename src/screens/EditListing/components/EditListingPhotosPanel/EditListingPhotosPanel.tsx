import React from 'react'
import { Trans } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Headings, ListingState } from '../../../../appTypes'
import { Heading } from '../../../../components'
import { widthScale } from '../../../../util'
import EditListingPhotosForm from './EditListingPhotosForm'
import {
  publishDraftInProgressSelector,
  updateInProgressSelector,
} from '../../EditListing.slice'
import { useTypedSelector } from '../../../../sharetribeSetup'
import { colors } from '../../../../theme'

interface EditListingPhotosPanelProps {
  listingImageConfig: any
  listing: any
  tabSubmitButtonText: string
  onSubmit: (values: object) => void
}

export const EditListingPhotosPanel = (props: EditListingPhotosPanelProps) => {
  const updateInProgress = useTypedSelector(updateInProgressSelector)
  const publishDraftInProgress = useTypedSelector(
    publishDraftInProgressSelector,
  )
  const inProgress = updateInProgress || publishDraftInProgress
  const { listingImageConfig, listing, tabSubmitButtonText, onSubmit } = props

  const isPublished =
    listing?.id &&
    listing?.attributes.state !== ListingState.LISTING_STATE_DRAFT

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {isPublished ? (
          <Heading
            fieldType={Headings.HEADING1}
            content={
              <Trans
                i18nKey="EditListingPhotosPanel.title"
                values={{ listingTitle: listing.attributes.title }}
              />
            }
            containerStyle={styles.headingContainerStyle}
          />
        ) : (
          <Heading
            fieldType={Headings.HEADING1}
            content={
              <Trans i18nKey="EditListingPhotosPanel.createListingTitle" />
            }
            containerStyle={styles.headingContainerStyle}
          />
        )}
        <EditListingPhotosForm
          listingImageConfig={listingImageConfig}
          inProgress={inProgress}
          saveActionMsg={tabSubmitButtonText}
          onSubmit={(images: object[]) => onSubmit({ images })}
          listing={listing}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  headingContainerStyle: {
    marginHorizontal: widthScale(20),
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
})
