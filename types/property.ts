export interface PropertyData {
  location: string;
  lga: string;
  tier: 'premium' | 'prime' | 'mid' | 'emerging' | 'outer' | 'rural';
  rent_selfcontain: string;
  rent_1bed: string;
  rent_2bed: string;
  rent_3bed: string;
  rent_4bed: string;
  rent_5bed: string;
  rent_6bed: string;
  rent_7bed: string;
  rent_8bed: string;
  rent_9bed: string;
  rent_10bed: string;
  land_100x100: string;
  house_1bed: string;
  house_2bed: string;
  house_3bed: string;
  house_4bed: string;
  house_5bed: string;
  house_6bed: string;
  house_7bed: string;
  house_8bed: string;
  house_9bed: string;
  house_10bed: string;
}

export interface PriceRange {
  min: number;
  max: number;
  average: number;
  formatted: string;
}

export interface PropertyPrice {
  location: string;
  lga: string;
  tier: string;
  propertyType: 'rent' | 'house' | 'land';
  bedrooms?: number;
  priceRange: PriceRange;
  lastUpdated: Date;
  aiAnalysis?: string;
}

export interface SearchFilters {
  propertyType: 'rent' | 'house' | 'land' | 'all';
  lga?: string;
  tier?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}

export interface RecommendationResult {
  property: PropertyPrice;
  score: number;
  reasons: string[];
  marketInsights: {
    trend: 'rising' | 'stable' | 'declining';
    appreciation: number;
    demand: 'high' | 'medium' | 'low';
  };
}

export interface MLModelMetrics {
  accuracy: number;
  mse: number;
  r2Score: number;
  lastTrained: Date;
}

export interface UserPreferences {
  budget: {
    min: number;
    max: number;
  };
  propertyType: 'rent' | 'house' | 'land';
  bedrooms?: number;
  preferredLGAs: string[];
  priorities: {
    location: number;
    price: number;
    amenities: number;
    investment: number;
  };
}

export interface MarketTrend {
  lga: string;
  propertyType: string;
  trend: number;
  prediction: number;
  confidence: number;
}

export interface PropertyRecommendation {
  location: string;
  lga: string;
  tier: string;
  propertyType: string;
  bedrooms?: number;
  estimatedPrice: PriceRange;
  recommendationScore: number;
  insights: string[];
  pros: string[];
  cons: string[];
}

export interface InvestmentAnalysis {
  location: string;
  currentValue: PriceRange;
  projectedValue: PriceRange;
  roi: number;
  appreciationRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeHorizon: number;
  marketFactors: {
    demand: number;
    supply: number;
    development: number;
    infrastructure: number;
  };
}
