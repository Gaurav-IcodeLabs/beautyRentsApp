import isEqual from 'lodash/isEqual'
import React from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { Button } from '../../../components'
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup'
import { pickUserFieldsData } from '../../../util'
import {
  saveProfileData,
  saveProfileDataInProgressSelector,
} from '../ProfileSettings.slice'

interface ProfileSettingSubmitButtonProps {
  control: any
  initialValues: any
  userFields: any
  userType: any
  handleSubmit: (values: any) => void
  isValid: boolean
}

const ProfileSettingSubmitButton = (props: ProfileSettingSubmitButtonProps) => {
  const {
    control,
    initialValues,
    userFields,
    userType,
    handleSubmit,
    isValid,
    getValues,
  } = props
  const values = useWatch({ control })
  const isEquals = isEqual(initialValues, values)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const saveProfileDataInProgress = useTypedSelector(
    saveProfileDataInProgressSelector,
  )

  const handleSaveChanges = async values => {
    const {
      firstName,
      lastName,
      displayName,
      bio: rawBio,
      ...rest
    } = getValues()
    const displayNameMaybe = displayName
      ? { displayName: displayName.trim() }
      : { displayName: null }

    // Ensure that the optional bio is a string
    const bio = rawBio || ''

    const profile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ...displayNameMaybe,
      bio,
      publicData: {
        ...pickUserFieldsData(rest, 'public', userType, userFields),
      },
      protectedData: {
        ...pickUserFieldsData(rest, 'protected', userType, userFields),
      },
      privateData: {
        ...pickUserFieldsData(rest, 'private', userType, userFields),
      },
    }
    const uploadedImage = getValues().image

    const updatedValues =
      uploadedImage && uploadedImage?.id
        ? { ...profile, profileImageId: uploadedImage?.id }
        : profile
    await dispatch(saveProfileData(updatedValues))
  }

  return (
    <Button
      text={t('ProfileSettingsForm.saveChanges')}
      onPress={handleSubmit(handleSaveChanges)}
      disabled={!isValid || isEquals}
      loading={saveProfileDataInProgress}
    />
  )
}

export default ProfileSettingSubmitButton

const styles = StyleSheet.create({})
