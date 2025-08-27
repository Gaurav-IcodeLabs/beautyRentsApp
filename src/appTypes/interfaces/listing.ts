import { ImageAttributes, UUID } from './common'
import { CategoryLevels } from './types'

export interface Listing {
  id: UUID
  type: string
  attributes: ListingAttributes
  author: ListingAuthor
  currentStock: ListingCurrentStock
  images: ListingImage[]
}

export interface ListingAttributes {
  title: string
  description: string
  publicData: ListingPublicData
  deleted: boolean
  geolocation: Geolocation
  createdAt: string
  state: string
  availabilityPlan: any // You might want to define a more specific type here
  price: Money
  metadata: any // You might want to define a more specific type here
}
interface Categories extends Record<CategoryLevels, string> {}

export interface ListingPublicData extends Categories {
  location: Location
  attributes: any[] // You might want to define a more specific type here
  condition: string
  currentStock: number
  deliveryMethod: string
  hashTags: any[] // You might want to define a more specific type here
  isDeleted: boolean
  listingSubCategory: ListingSubCategory
  shippingFee: number
  subAttributes: any[] // You might want to define a more specific type here
  subCategoryKey: string
  unitType: string
  transactionProcessAlias: string
  video: any // You might want to define a more specific type here
}

export interface Location {
  address: string
  building: string
}

export interface ListingCategory {
  key: string
  label: string
  value: string
}

export interface ListingSubCategory {
  key: string
  label: string
  parentKey: string
}
export interface LatLngBounds {
  ne: Geolocation
  sw: Geolocation
  _sdkType: 'LatLngBounds'
}

export interface Geolocation {
  _sdkType: string
  lat: number
  lng: number
}

export interface Money {
  _sdkType: string
  amount: number
  currency: string
}

export interface ListingAuthor {
  id: UUID
  type: string
  attributes: ListingAuthorAttributes
  profileImage: ListingOwnerProfileImage
}

export interface ListingAuthorAttributes {
  profile: ListingOwnerProfile
  createdAt: string
}

interface ListingOwnerProfile {
  displayName: string
  bio: string | null
  abbreviatedName: string
  publicData: object
  metadata: object
}

export interface ListingOwnerProfileImage {
  id: UUID
  type: string
  attributes: ImageAttributes
}

export interface ListingCurrentStock {
  id: UUID
  type: string
  attributes: ListingStockAttributes
}

export interface ListingStockAttributes {
  quantity: number
}

export interface ListingImage {
  id: UUID
  type: string
  attributes: ImageAttributes
}
