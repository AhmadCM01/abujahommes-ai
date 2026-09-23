export type PropertyType =
  | 'detached'
  | 'semi-detached'
  | 'flat'
  | 'terrace'
  | 'bungalow'
  | 'duplex'
  | 'land'
  | 'commercial'

export type TransactionType = 'rent' | 'sale'

export type LGA = 'AMAC' | 'Bwari' | 'Gwagwalada' | 'Kuje' | 'Kwali' | 'Abaji'

export type MarketTier = 'Premium' | 'Prime' | 'Mid' | 'Emerging' | 'Outer' | 'Rural'

export type TitleType =
  | 'C of O'
  | 'Right of Occupancy'
  | 'Deed of Assignment'
  | 'Governors Consent'
  | 'FCDA Allocation'
  | 'FHA Allocation'
  | 'Survey'
  | 'Other'

export type PriceConfidence = 'high' | 'medium' | 'low'

export type FraudRiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type ListingStatus = 'pending' | 'active' | 'rejected' | 'paused' | 'sold'

export interface PropertyListing {
  id: string
  owner_id?: string
  seller_id: string
  seller_name?: string
  seller_phone?: string
  seller_verified?: boolean
  seller_avatar?: string | null
  title: string
  property_type: PropertyType
  transaction_type: TransactionType
  lga: LGA
  location: string
  address?: string
  market_tier?: MarketTier
  bedrooms: number
  bathrooms: number
  land_size_sqm?: number | null
  asking_price: number
  ai_price_estimate?: number
  ai_price_min?: number
  ai_price_max?: number
  price_confidence?: PriceConfidence
  predicted_price_min?: number | null
  predicted_price_max?: number | null
  predicted_confidence?: PriceConfidence | null
  description: string
  title_type: TitleType
  amenities: string[]
  images: string[]
  status: ListingStatus
  fraud_score: number
  fraud_risk_level: FraudRiskLevel
  fraud_red_flags?: string[]
  fraud_recommendation?: string
  last_valued_at?: string | null
  last_scored_at?: string | null
  views: number
  saves: number
  enquiries: number
  data_source?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface NLPSearchResult {
  propertyType?: PropertyType | 'any'
  transactionType?: TransactionType | 'any'
  lga?: LGA | 'any'
  location?: string | null
  bedrooms?: number | null
  minPrice?: number | null
  maxPrice?: number | null
  titleType?: TitleType | 'any'
  amenities?: string[]
  detectedLanguage?: 'english' | 'pidgin'
  confidence?: 'high' | 'medium' | 'low'
  interpretation?: string
  cached?: boolean
}

export interface PricePredictionResult {
  predictedPrice: number
  minPrice: number
  maxPrice: number
  confidence: PriceConfidence
  modelVersion: string
  trainingRecords: number
  dataFreshness: string
  comparableListings?: Partial<PropertyListing>[]
  cached?: boolean
}

export interface FraudAnalysisResult {
  fraudScore: number
  riskLevel: FraudRiskLevel
  redFlags: string[]
  recommendation: string
  analysis: string
  cached?: boolean
}

export interface AIInsightItem {
  icon: string
  headline: string
  detail: string
  type?: 'trend' | 'value' | 'fraud' | 'recommendation' | 'alert'
  linkText?: string
  linkHref?: string
}
