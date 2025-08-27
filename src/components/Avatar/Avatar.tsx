import React from 'react'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import { useColors } from '../../context'
import { colors, fontWeight } from '../../theme'
import { fontScale, widthScale } from '../../util'
import { AppImage } from '../AppImage/AppImage'
import {
  ensureCurrentUser,
  ensureUser,
  userAbbreviatedName,
} from '../../util/data'
import { cross } from '../../assets'
import { useSelector } from 'react-redux'

interface AvatarProps {
  style?: ViewStyle
  size?: number
  user?: {}
}

export const Avatar = (props: AvatarProps) => {
  const { style = {}, size = widthScale(100), user } = props
  const colors = useColors()
  // if you do not pass any user then by default it will be showing current user
  const author = user || useSelector(state => state.user.currentUser)
  const userIsCurrentUser = author && author.type === 'currentUser'
  const avatarUser = userIsCurrentUser
    ? ensureCurrentUser(author)
    : ensureUser(author)

  const isBannedUser = avatarUser?.attributes?.banned
  const isDeletedUser = avatarUser?.attributes?.deleted
  const defaultUserAbbreviatedName = ''
  const abbreviatedName = userAbbreviatedName(
    avatarUser,
    defaultUserAbbreviatedName,
  )
  const hasProfileImage = avatarUser.profileImage && avatarUser.profileImage.id

  const imageVariant =
    avatarUser?.profileImage?.attributes?.variants?.['square-small2x']?.url ||
    avatarUser?.profileImage?.attributes?.variants?.['listing-card']?.url ||
    ''

  return (
    <View
      style={[
        styles.avatarSection,
        { backgroundColor: colors.marketplaceColor, height: size, width: size },
        style,
      ]}>
      {isBannedUser || isDeletedUser ? (
        <AppImage source={cross} width={size} />
      ) : hasProfileImage ? (
        <AppImage source={{ uri: imageVariant }} width={size} />
      ) : (
        <Text style={styles.text}>{abbreviatedName} </Text>
      )}
    </View>
  )
}
const styles = StyleSheet.create({
  avatarSection: {
    borderRadius: widthScale(100),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontSize: fontScale(25),
    fontWeight: fontWeight.medium,
  },
})
