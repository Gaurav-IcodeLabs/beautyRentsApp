import { types } from '../../util'

const { LatLng: SDKLatLng } = types
interface Prediction {
  predictionPlace: {
    address: any
  }
  place_name: string
  context: any
  center: [string, string]
}
/**
 * Get the address text of the given prediction.
 */
const getPredictionAddress = (prediction: Prediction) => {
  if (prediction.predictionPlace) {
    // default prediction defined above
    return prediction.predictionPlace.address
  }
  // prediction from Mapbox geocoding API
  return prediction.place_name
}

const placeOrigin = (prediction: Prediction) => {
  if (
    prediction &&
    Array.isArray(prediction.center) &&
    prediction.center.length === 2
  ) {
    // Coordinates in Mapbox features are represented as [longitude, latitude].
    return new SDKLatLng(prediction?.center[1], prediction?.center[0])
  }
  return null
}

const getPlaceDetails = (prediction: Prediction) => {
  const city = prediction?.context?.find(currentPlace =>
    currentPlace?.id?.includes('place.'),
  )?.text

  return {
    city: city,
    address: getPredictionAddress(prediction),
    origin: placeOrigin(prediction),
  }
}

const getLocationSchema = (z:any) => {
  const formSchema = z.object({
    address: z.string().min(1),
    building: z.string().optional(),
    geolocation: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  })

  return formSchema
}

export { getPlaceDetails ,getLocationSchema }
