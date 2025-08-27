import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import React from 'react'
import { widthScale } from '../../../util'
import { cross } from '../../../assets'
import { useTypedSelector } from '../../../sharetribeSetup'
import {
  fetchMessagesInProgressSelector,
  messagesSelector,
} from '../Transaction.slice'
import ChatContent from '../component/ChatContent'
import ChatInput from '../component/ChatInput'
import { UserDisplayName } from '../../../components'
import { userDisplayNameAsString } from '../../../util/data'
import { currentUserIdSelector } from '../../../slices/user.slice'

const displayNames = (currentUserId, provider, customer) => {
  const authorDisplayName = <UserDisplayName user={provider} />
  const customerDisplayName = <UserDisplayName user={customer} />

  let otherUserDisplayName = ''
  let otherUserDisplayNameString = ''
  const currentUserIsCustomer = currentUserId === customer?.id?.uuid
  const currentUserIsProvider = currentUserId === provider?.id?.uuid

  if (currentUserIsCustomer) {
    otherUserDisplayName = authorDisplayName
    otherUserDisplayNameString = userDisplayNameAsString(provider, '')
  } else if (currentUserIsProvider) {
    otherUserDisplayName = customerDisplayName
    otherUserDisplayNameString = userDisplayNameAsString(customer, '')
  }

  return {
    authorDisplayName,
    customerDisplayName,
    otherUserDisplayName,
    otherUserDisplayNameString,
  }
}

const ChatModal = props => {
  const { isOpen, onCloseModal, transaction, stateData } = props
  const currentUserId = useTypedSelector(currentUserIdSelector)
  const messages = useTypedSelector(messagesSelector)
  const fetchMessagesInProgress = useTypedSelector(
    fetchMessagesInProgressSelector,
  )

  const processName = stateData.processName

  // If stateData doesn't have processName, full tx data has not been fetched.
  if (!processName) {
    return null
  }
  const { provider, customer } = transaction
  const { authorDisplayName, customerDisplayName, otherUserDisplayNameString } =
    displayNames(currentUserId, provider, customer)

  return (
    <Modal visible={isOpen} onRequestClose={onCloseModal} animationType="slide">
      <View style={styles.container}>
        {fetchMessagesInProgress ? <ActivityIndicator size={'small'} /> : null}
        <TouchableOpacity
          style={styles.closeContainerStyle}
          onPress={onCloseModal}>
          <Image source={cross} style={styles.crossImageStyle} />
        </TouchableOpacity>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : undefined}>
          <ChatContent items={messages} transactionId={transaction.id} />
          <ChatInput
            transactionId={transaction.id}
            otherUserDisplayNameString={otherUserDisplayNameString}
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

export default ChatModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: widthScale(22),
    padding: widthScale(20),
  },
  closeContainerStyle: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  crossImageStyle: {
    width: widthScale(20),
    height: widthScale(20),
  },
})
