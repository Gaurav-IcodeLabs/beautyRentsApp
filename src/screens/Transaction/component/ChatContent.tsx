import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native'
import React from 'react'
import { useAppDispatch, useTypedSelector } from '../../../sharetribeSetup'
import { formatDateWithProximity } from '../../../util'
import OwnMessage from './OwnMessage'
import Message from './Message'
import { isMessage } from '../models/Chat.helper'
import { useTranslation } from 'react-i18next'
import { currentUserIdSelector } from '../../../slices/user.slice'
import {
  fetchMoreMessages,
  loadMoreMessageInProgressSelector,
  oldestMessagePageFetchedSelector,
  totalMessagePagesSelector,
} from '../Transaction.slice'
import { useConfiguration } from '../../../context'
import { FlashList } from '@shopify/flash-list'

const ChatContent = props => {
  const { t } = useTranslation()
  const { items, transactionId } = props
  const dispatch = useAppDispatch()
  const config = useConfiguration()
  const currentUserId = useTypedSelector(currentUserIdSelector)
  const totalMessagePages = useTypedSelector(totalMessagePagesSelector)
  const oldestMessagePageFetched = useTypedSelector(
    oldestMessagePageFetchedSelector,
  )
  const loadMoreMessageInProgress = useTypedSelector(
    loadMoreMessageInProgressSelector,
  )

  const todayString = t('TransactionPage.ActivityFeed.today')
  const messageComponent = ({ message }) => {
    const formattedDate = formatDateWithProximity(
      message.attributes.createdAt,
      todayString,
    )
    const isOwnMessage = message?.sender?.id?.uuid === currentUserId
    if (isOwnMessage) {
      return <OwnMessage message={message} formattedDate={formattedDate} />
    } else {
      return <Message message={message} formattedDate={formattedDate} />
    }
  }

  const MessageListItem = message => {
    return messageComponent(message)
  }

  const handleFetchMoreMessages = async () => {
    if (oldestMessagePageFetched === totalMessagePages) return
    await dispatch(fetchMoreMessages({ txId: transactionId, config }))
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        inverted
        estimatedItemSize={150}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          return <MessageListItem message={item} />
        }}
        refreshing={loadMoreMessageInProgress}
        refreshControl={
          <RefreshControl
            refreshing={loadMoreMessageInProgress}
            onRefresh={() => {
              handleFetchMoreMessages()
            }}
          />
        }
        onEndReached={handleFetchMoreMessages}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadMoreMessageInProgress ? <ActivityIndicator size="small" /> : null
        }
      />
    </View>
  )
}

export default ChatContent

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainerStye: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
})
