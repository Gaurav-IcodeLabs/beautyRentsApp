import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useConfiguration } from '../../../context'
import { useTypedSelector } from '../../../sharetribeSetup'
import {
  currentUserMetadataSelector,
  currentUserPublicDataSelector,
} from '../../../slices/user.slice'
import { colors, fontWeight } from '../../../theme'
import {
  fontScale,
  pickCustomFieldProps,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
  widthScale,
} from '../../../util'
import { pickUserFields } from '../helper'
import DetailsBottomSheet from './DetailsBottomSheet'
import SectionDetailsMaybe from './SectionDetailsMaybe'
import SectionMultiEnumMaybe from './SectionMultiEnumMaybe'
import SectionTextMaybe from './SectionTextMaybe'

const ProfileDetails = () => {
  const publicData = useTypedSelector(currentUserPublicDataSelector)
  const metadata = useTypedSelector(currentUserMetadataSelector)
  const sheetRef = React.useRef(null)
  const { t } = useTranslation()
  const userFieldConfig = useConfiguration()?.user?.userFields
  const shouldPickUserField = fieldConfig =>
    fieldConfig?.showConfig?.displayInProfile !== false
  const propsForCustomFields =
    pickCustomFieldProps(
      publicData,
      metadata,
      userFieldConfig,
      'userType',
      shouldPickUserField,
    ) || []

  const existingUserFields = userFieldConfig.reduce(
    (filteredConfigs, config) =>
      pickUserFields(filteredConfigs, config, publicData, metadata, t),
    [],
  )
  if (!existingUserFields?.length && !propsForCustomFields?.length) return null
  const showSeeMore =
    existingUserFields?.length + propsForCustomFields?.length - 1 > 2
  const showPropsForCustomFieldsCount = Math.max(0, 2 - existingUserFields)

  return (
    <View style={styles.container}>
      <Text style={styles.textName}>{t('ProfilePage.detailsTitle')}</Text>
      <SectionDetailsMaybe
        existingUserFields={existingUserFields.slice(0, 2)}
      />
      {propsForCustomFields
        ?.slice?.(0, showPropsForCustomFieldsCount)
        ?.map?.(customFieldProps => {
          const { schemaType, ...fieldProps } = customFieldProps
          return schemaType === SCHEMA_TYPE_TEXT ? (
            <SectionTextMaybe {...fieldProps} />
          ) : schemaType === SCHEMA_TYPE_MULTI_ENUM ? (
            <SectionMultiEnumMaybe {...fieldProps} />
          ) : null
        })}
      {showSeeMore && (
        <TouchableOpacity onPress={() => sheetRef.current?.present()}>
          <Text style={styles.seeMore}>Show more</Text>
        </TouchableOpacity>
      )}
      <DetailsBottomSheet
        propsForCustomFields={propsForCustomFields}
        existingUserFields={existingUserFields}
        sheetRef={sheetRef}
      />
    </View>
  )
}

export default ProfileDetails

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.itemBGGrey,
    padding: widthScale(16),
    borderRadius: widthScale(12),
  },
  seeMore: {
    color: colors.black,
    textAlign: 'right',
    marginVertical: widthScale(10),
    fontWeight: fontWeight.semiBold,
  },
  textName: {
    fontSize: fontScale(18),
    color: colors.black,
    fontWeight: fontWeight.bold,
    marginBottom: widthScale(10),
  },
})
