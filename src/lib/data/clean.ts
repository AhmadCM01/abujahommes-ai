import {
  normalizeLocation as canonicalNormalize,
  getLocationLGA,
  locationTierMap,
} from './locations'
import { LGA, MarketTier } from '@/types'

export function normalizeLocation(rawLocation: string): string {
  if (!rawLocation) return 'Central Business District'
  return canonicalNormalize(rawLocation) || rawLocation.trim()
}

export function inferLGA(location: string): LGA {
  return getLocationLGA(location) || 'AMAC'
}

export function inferMarketTier(location: string): MarketTier {
  const normalized = normalizeLocation(location)
  return locationTierMap[normalized] || 'Mid'
}

export function sanitizeText(text: string): string {
  if (!text) return ''
  return text
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/\s+/g, ' ')
    .trim()
}
