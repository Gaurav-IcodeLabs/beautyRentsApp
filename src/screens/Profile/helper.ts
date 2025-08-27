import { getFieldValue } from '../../util'

export const pickUserFields = (
  filteredConfigs,
  config,
  publicData,
  metadata,
  t,
) => {
  const {
    key,
    schemaType,
    enumOptions,
    userTypeConfig = {},
    showConfig = {},
  } = config
  const { limitToUserTypeIds, userTypeIds } = userTypeConfig
  const userType = publicData?.userType
  const isTargetUserType = !limitToUserTypeIds || userTypeIds.includes(userType)

  const { label, displayInProfile } = showConfig
  const publicDataValue = getFieldValue(publicData, key)
  const metadataValue = getFieldValue(metadata, key)
  const value = publicDataValue !== null ? publicDataValue : metadataValue

  if (displayInProfile && isTargetUserType && value !== null) {
    const findSelectedOption = enumValue =>
      enumOptions?.find(o => enumValue === `${o.option}`)
    const getBooleanMessage = value =>
      value ? t('ProfilePage.detailYes') : t('ProfilePage.detailNo')
    const optionConfig = findSelectedOption(value)

    return schemaType === 'enum'
      ? filteredConfigs.concat({ key, value: optionConfig?.label, label })
      : schemaType === 'boolean'
        ? filteredConfigs.concat({
            key,
            value: getBooleanMessage(value),
            label,
          })
        : schemaType === 'long'
          ? filteredConfigs.concat({ key, value, label })
          : filteredConfigs
  }
  return filteredConfigs
}
