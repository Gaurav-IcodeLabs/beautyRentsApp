import { View, Text, TextInput } from 'react-native'
import React from 'react'
import { Controller } from 'react-hook-form'

const UserFieldDisplayName = props => {
  const { userTypeConfig, styles, control, t, formName } = props
  const { displayInSignUp } = userTypeConfig?.displayNameSettings || {}
  const isDisabled = userTypeConfig?.defaultUserFields?.displayName === false
  const isAllowedInSignUp = displayInSignUp === true

  if (isDisabled || !isAllowedInSignUp) {
    return null
  }

  return (
    <View>
      <Controller
        control={control}
        name="displayName"
        render={({
          field: { value, onChange, onBlur },
          fieldState: { error },
        }) => (
          <>
            <Text style={styles.text}>{t(`${formName}.displayNameLabel`)}</Text>
            <TextInput
              placeholder={t(`${formName}.displayNamePlaceholder`)}
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
            {error && <Text style={styles.text}>{error.message}</Text>}
          </>
        )}
      />
    </View>
  )
}

export default UserFieldDisplayName
