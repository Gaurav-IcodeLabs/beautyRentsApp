import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const UserDisplayName = props => {
  const { t } = useTranslation()
  const { user, deletedUserDisplayName, bannedUserDisplayName } = props
  const hasAttributes = (user && user?.attributes) || {}
  const userIsDeleted = hasAttributes && user?.attributes?.deleted
  const userIsBanned = hasAttributes && user?.attributes?.banned
  const userHasProfile = hasAttributes && user?.attributes?.profile
  const userDisplayName =
    userHasProfile && user?.attributes?.profile.displayName

  const deletedUserDisplayNameInUse = deletedUserDisplayName
    ? deletedUserDisplayName
    : t('UserDisplayName.deleted')

  const bannedUserDisplayNameInUse = bannedUserDisplayName
    ? bannedUserDisplayName
    : t('UserDisplayName.banned')

  const displayName = userDisplayName
    ? userDisplayName
    : userIsDeleted
      ? deletedUserDisplayNameInUse
      : userIsBanned
        ? bannedUserDisplayNameInUse
        : null

  return (
    <>
      <Text>{displayName}</Text>
    </>
  )
}
