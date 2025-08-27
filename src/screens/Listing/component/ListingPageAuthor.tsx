import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { ListingAuthor } from '../../../appTypes'
import { Avatar, SelectionButton } from '../../../components'
import { AppColors, colors, fontWeight } from '../../../theme'
import { fontScale, widthScale } from '../../../util'
import { useColors } from '../../../context'

interface ListingPageAuthorProps {
  author: ListingAuthor
  setInquiryModalOpen?: () => void
  showContact: boolean
}

const ListingPageAuthor = (props: ListingPageAuthorProps) => {
  const { author, setInquiryModalOpen, showContact } = props
  const { t } = useTranslation()
  // const currentUserId = useSelector(currentUserIdSelector)
  // const isAuthor = currentUserId === author?.id.uuid
  const colors: AppColors = useColors()
  return (
    <View style={styles.container}>
      <View style={styles.innerCotainer}>
        <Avatar size={widthScale(60)} user={author} />
        <View style={styles.middleContainer}>
          <Text numberOfLines={1} style={styles.displayName}>
            {author?.attributes?.profile?.displayName}
          </Text>
          <Text style={styles.aboutProviderTitle}>
            {t('ListingPage.aboutProviderTitle')}
          </Text>
        </View>
        <View style={styles.rightBtnView}>
          <SelectionButton
            onPress={() => {}}
            title={t('UserCard.viewProfileLink')}
            isSelected={false}
            style={styles.rightbtn}
            textStyle={[styles.rightbtnTxt, { color: colors.marketplaceColor }]}
          />
          {showContact ? (
            <SelectionButton
              onPress={setInquiryModalOpen}
              title={t('UserCard.contactUser')}
              isSelected={false}
              style={styles.rightbtn}
              textStyle={[
                styles.rightbtnTxt,
                { color: colors.marketplaceColor },
              ]}
            />
          ) : null}
        </View>
      </View>
    </View>
  )
}

export default ListingPageAuthor

const styles = StyleSheet.create({
  container: {
    marginHorizontal: widthScale(20),
    paddingVertical: widthScale(10),
    borderBottomWidth: 1,
    borderColor: colors.frostedGrey,
  },
  innerCotainer: {
    flexDirection: 'row',
  },
  aboutProviderTitle: {
    fontSize: widthScale(12),
    fontWeight: fontWeight.normal,
    color: colors.grey,
  },
  displayName: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.semiBold,
    flexShrink: 1,
  },
  middleContainer: {
    marginLeft: widthScale(10),
    flex: 1,
    justifyContent: 'center',
    gap: widthScale(5),
  },
  rightBtnView: {
    justifyContent: 'center',
    gap: widthScale(5),
  },
  rightbtn: {
    paddingHorizontal: widthScale(8),
    paddingVertical: widthScale(4),
  },
  rightbtnTxt: {
    fontSize: fontScale(12),
    fontWeight: fontWeight.semiBold,
  },
})
