import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import React, { useState } from 'react'
import { useColors, useConfiguration } from '../../../context'
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup'
import {
  sendMessage,
  sendMessageInProgressSelector,
} from '../Transaction.slice'
import { colors } from '../../../theme'
import { widthScale } from '../../../util'
import { send } from '../../../assets'
import { useTranslation } from 'react-i18next'

const ChatInput = props => {
  const { t } = useTranslation()
  const config = useConfiguration()
  const dispatch = useAppDispatch()
  const colorsData = useColors()
  const [msgValue, setMsgValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { transactionId, otherUserDisplayNameString } = props
  const sendMessageInProgress = useTypedSelector(sendMessageInProgressSelector)

  const onMessageSubmit = async () => {
    if (msgValue === '' || sendMessageInProgress) return
    const message = msgValue.trim()
    if (!message) {
      return
    }
    dispatch(sendMessage({ txId: transactionId, message, config }))
    setMsgValue('')
  }

  return (
    <View style={styles.container}>
      <TextInput
        multiline
        style={[
          styles.input,
          isFocused && {
            borderColor: colorsData.marketplaceColor,
          },
        ]}
        placeholder={t('TransactionPanel.sendMessagePlaceholder', {
          name: otherUserDisplayNameString,
        })}
        placeholderTextColor={colors.grey}
        value={msgValue}
        onChangeText={v => {
          setMsgValue(v)
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <TouchableOpacity
        onPress={() => onMessageSubmit()}
        style={[
          styles.buttonContainer,
          { backgroundColor: colorsData.marketplaceColor },
        ]}>
        {sendMessageInProgress ? (
          <ActivityIndicator size={'small'} />
        ) : (
          <Image source={send} style={styles.iconStyle} />
        )}
      </TouchableOpacity>
    </View>
  )
}

export default ChatInput

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    // alignItems: 'center',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.grey,
    flex: 1,
    borderRadius: widthScale(10),
    paddingHorizontal: widthScale(10),
    color: colors.black,
    paddingVertical: widthScale(20),
    maxHeight: widthScale(100),
  },
  buttonContainer: {
    padding: widthScale(10),
    height: widthScale(45),
    borderRadius: widthScale(8),
    justifyContent: 'center',
  },
  iconStyle: {
    width: widthScale(20),
    height: widthScale(20),
  },
})
