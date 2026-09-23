import { titlePremium, amenityScores } from './premiums'
import { inferMarketTier, normalizeLocation, inferLGA } from './clean'
import { TitleType, PropertyType, TransactionType } from '@/types'

export interface EnrichedListingData {
  normalizedLocation: string
  lga: string
  marketTier: string
  titleMultiplier: number
  totalAmenityScore: number
}

export function enrichListing(data: {
  location: string
  titleType?: string
  amenities?: string[]
}): EnrichedListingData {
  const normalizedLocation = normalizeLocation(data.location)
  const lga = inferLGA(normalizedLocation)
  const marketTier = inferMarketTier(normalizedLocation)

  const titleTypeVal = (data.titleType as TitleType) || 'Other'
  const titleMultiplier = titlePremium[titleTypeVal] || 1.0

  const totalAmenityScore = (data.amenities || []).reduce((sum, item) => {
    return sum + (amenityScores[item] || 0)
  }, 0)

  return {
    normalizedLocation,
    lga,
    marketTier,
    titleMultiplier,
    totalAmenityScore,
  }
}

export function calculateBasePrice(
  marketTier: string,
  transactionType: TransactionType,
  propertyType: PropertyType,
  bedrooms: number = 3,
  amenitiesScore: number = 0,
  titleMultiplier: number = 1.0
): { estimate: number; min: number; max: number } {
  const rentBaseByTier: Record<string, number> = {
    Premium: 6500000,
    Prime: 4000000,
    Mid: 2200000,
    Emerging: 1000000,
    Outer: 600000,
    Rural: 250000,
  }

  let base = rentBaseByTier[marketTier] || 2000000

  // Property type scaling
  const typeMultiplier: Record<PropertyType, number> = {
    detached: 1.4,
    'semi-detached': 1.15,
    flat: 1.0,
    terrace: 1.25,
    bungalow: 0.95,
    duplex: 1.25,
    land: 0.8,
    commercial: 1.6,
  }
  base *= typeMultiplier[propertyType] || 1.0

  // Bedroom scaling
  const bedCount = Math.max(1, bedrooms)
  const bedMultiplier = 1 + (bedCount - 2) * 0.2
  base *= bedMultiplier

  // Transaction type scaling (Sale vs Rent)
  if (transactionType === 'sale') {
    // Abuja sale multiples range between 35x to 60x annual rent
    base *= 45
  }

  // Title premium and amenity score adjustments
  const finalPrice = Math.round(
    base * titleMultiplier * (1 + Math.min(amenitiesScore, 80) / 180)
  )

  return {
    estimate: finalPrice,
    min: Math.round(finalPrice * 0.85),
    max: Math.round(finalPrice * 1.15),
  }
}
