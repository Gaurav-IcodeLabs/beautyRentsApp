export enum EditListingTabs {
  DETAILS = 'details',
  PRICING = 'pricing',
  PRICING_AND_STOCK = 'pricing-and-stock',
  DELIVERY = 'delivery',
  LOCATION = 'location',
  AVAILABILITY = 'availability',
  PHOTOS = 'photos',
}

export enum ListingState {
  LISTING_STATE_DRAFT = 'draft',
  LISTING_STATE_PENDING_APPROVAL = 'pendingApproval',
  LISTING_STATE_PUBLISHED = 'published',
  LISTING_STATE_CLOSED = 'closed',
}

export enum ListingLayout {
  SQUARE = '1/1',
  LANDSCAPE = '16/9',
  PORTRAIT = '3/4',
}

export enum ListingSearchTypes {
  LOCATION = 'location',
  KEYWORDS = 'keyword',
}

export enum ListingDeliveryOptionsTypes {
  PICKUP = 'pickup',
  SHIPPING = 'shipping',
}
