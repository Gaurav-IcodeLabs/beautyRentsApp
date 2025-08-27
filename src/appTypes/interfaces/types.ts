import { ImageVariantsMap } from './common'

export type ImageVariants =
  | 'default'
  | 'landscape-crop'
  | 'landscape-crop2x'
  | 'landscape-crop4x'
  | 'landscape-crop6x'
  | 'scaled-small'
  | 'scaled-medium'
  | 'scaled-large'
  | 'scaled800'
  | 'scaled-xlarge'
  | 'square-small'
  | 'square-small2x'
  | 'facebook'
  | 'twitter'
  | 'square1200'
  | 'landscape1200'
  | 'portrait1200'
  | 'original1200'

export type Colors =
  | 'marketplaceColor'
  | 'marketplaceColorLight'
  | 'marketplaceColorDark'
  | 'colorPrimaryButton'
  | 'colorPrimaryButtonLight'
  | 'colorPrimaryButtonDark'
  | 'lightGrey'
  | 'transparent'
  | 'error'
  | 'white'
  | 'black'
  | 'grey'
  | 'frostedGrey'
  | 'success'
  | 'itemBGGrey'
  | 'orange'
  | 'red'
  | 'listingBackground'
  | 'greyishWhite'
  | 'darkGrey'
  | 'lightestGrey'
  | 'lightRedColor'
  | 'savedCardBackground'

export type CategoryLevels =
  | 'categoryLevel1'
  | 'categoryLevel2'
  | 'categoryLevel3'
  | 'categoryLevel4'

export type Transitions =
  | 'CONFIRM_PAYMENT'
  | 'AUTO_CANCEL'
  | 'CANCEL'
  | 'MARK_DELIVERED'
  | 'OPERATOR_MARK_DELIVERED'
  | 'DISPUTE'
  | 'OPERATOR_DISPUTE'
  | 'AUTO_COMPLETE'
  | 'AUTO_CANCEL_FROM_DISPUTED'
  | 'CANCEL_FROM_DISPUTED'
  | 'REVIEW_1_BY_CUSTOMER'
  | 'REVIEW_1_BY_PROVIDER'
  | 'REVIEW_2_BY_CUSTOMER'
  | 'REVIEW_2_BY_PROVIDER'

export type EntityType =
  | 'user'
  | 'listing'
  | 'image'
  | 'marketplace'
  | 'stripeAccount'
  | 'stripePaymentMethod'
  | 'stripeCustomer'
  | 'currentUser'
  | 'stripeAccountLink'
  | 'stripePerson'
  | 'stripeSetupIntent'
  | 'stock'
  | 'ownListing'
  | 'availabilityException'
  | 'booking'
  | 'stockReservation'
  | 'review'
  | 'message'
  | 'transaction'
  | 'processTransition'
  | 'timeSlot'
  | 'stockAdjustment'
  | unknown

export type CurrentUserRelationships =
  | 'marketplace'
  | 'profileImage'
  | 'stripeAccount'
  | 'stripeCustomer'
  | 'stripeCustomer.defaultPaymentMethod'

export type alias = 'latest'

export type CurrentUserQueryParams = {
  expand?: boolean
  include?: CurrentUserRelationships[]
  'fields.image'?: ImageVariantsMap[]
}

export type MessageRelationships =
  | 'sender'
  | 'sender.profileImage'
  | 'transaction'

export type ReviewRelationships =
  | 'author'
  | 'author.profileImage'
  | 'listing'
  | 'subject'
  | 'subject.profileImage'

export type TransactionRelationships =
  | 'marketplace'
  | 'listing'
  | 'listing.images'
  | 'listing.currentStock'
  | 'provider'
  | 'provider.profileImage'
  | 'customer'
  | 'customer.profileImage'
  | 'booking'
  | 'stockReservation'
  | 'reviews'
  | 'reviews.author'
  | 'reviews.author.profileImage'
  | 'reviews.subject'
  | 'reviews.subject.profileImage'
  | 'messages'
  | 'messages.sender'
  | 'messages.sender.profileImage'

export type BookingRelationships =
  | 'transaction'
  | 'transaction.customer'
  | 'transaction.customer.profileImage'

export type ListingRelationships =
  | 'marketplace'
  | 'author'
  | 'author.profileImage'
  | 'images'
  | 'currentStock'

export type OwnListingRelationships =
  | 'marketplace'
  | 'author'
  | 'author.profileImage'
  | 'images'
  | 'currentStock'

export type StockAdjustmentRelationships =
  | 'ownListing'
  | 'ownListing.currentStock'
  | 'stockReservation'
  | 'stockReservation.transaction'
  | 'stockReservation.transaction.customer'
  | 'stockReservation.transaction.customer.profileImage'

export type RequestedCapabilities =
  | 'card_payments'
  | 'transfers'
  | 'legacy_payments'

export type AvailabilityExceptionRelationships = 'ownListing'

export type UserRelationships = 'marketplace' | 'profileImage'
