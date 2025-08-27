import { View, Text, TextInput } from 'react-native'
import React from 'react'
import { Controller } from 'react-hook-form'

const UserFieldPhoneNumber = props => {
  const { userTypeConfig, styles, control, t, formName } = props
  const { displayInSignUp } = userTypeConfig?.phoneNumberSettings || {}
  const isDisabled = userTypeConfig?.defaultUserFields?.phoneNumber === false
  const isAllowedInSignUp = displayInSignUp === true

  if (isDisabled || !isAllowedInSignUp) {
    return null
  }

  return (
    <View>
      <Controller
        control={control}
        name="phoneNumber"
        render={({
          field: { value, onChange, onBlur },
          fieldState: { error },
        }) => (
          <>
            <Text style={styles.text}>{t(`${formName}.phoneNumberLabel`)}</Text>
            <TextInput
              placeholder={t(`${formName}.phoneNumberPlaceholder`)}
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

export default UserFieldPhoneNumber
