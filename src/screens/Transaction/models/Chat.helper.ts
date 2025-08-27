import dropWhile from 'lodash/dropWhile'

export const isMessage = item => item && item.type === 'message'

// Compare function for sorting an array containing messages and transitions
const compareItems = (a, b) => {
  const itemDate = item =>
    isMessage(item) ? item.attributes.createdAt : item.createdAt
  return itemDate(a) - itemDate(b)
}

export const organizedItems = (messages, transitions, hideOldTransitions) => {
  const items = messages.concat(transitions).sort(compareItems)
  if (hideOldTransitions) {
    // Hide transitions that happened before the oldest message. Since
    // we have older items (messages) that we are not showing, seeing
    // old transitions would be confusing.
    return dropWhile(items, i => !isMessage(i))
  } else {
    return items
  }
}

export const reviewByAuthorId = (transaction, userId) => {
  return transaction.reviews.filter(
    r => !r.attributes.deleted && r.author.id.uuid === userId.uuid,
  )[0]
}
