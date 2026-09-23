import { create } from 'zustand'
import { LGA, PropertyListing, PropertyType, TransactionType } from '@/types'
import { isValidLocationInLGA } from '@/lib/data/locations'

export interface SearchFiltersState {
  query: string
  transactionType: TransactionType | 'any'
  propertyType: PropertyType | 'any'
  lga: LGA | 'any'
  location: string
  bedrooms: number | 'any'
  minPrice: number
  maxPrice: number
  titleType: string | 'any'
  amenities: string[]
  riskLevel: string | 'any'
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'most_saved'
  viewMode: 'grid' | 'list'
  detectedLanguage?: 'english' | 'pidgin'
  aiInterpretation?: string
}

interface SearchStore extends SearchFiltersState {
  results: PropertyListing[]
  savedListings: string[]
  isSearching: boolean
  setQuery: (query: string) => void
  setTransactionType: (t: TransactionType | 'any') => void
  setPropertyType: (p: PropertyType | 'any') => void
  setLGA: (lga: LGA | 'any') => void
  setLocation: (loc: string) => void
  setBedrooms: (b: number | 'any') => void
  setPriceRange: (min: number, max: number) => void
  setTitleType: (t: string | 'any') => void
  toggleAmenity: (amenity: string) => void
  setRiskLevel: (risk: string | 'any') => void
  setSortBy: (sort: SearchFiltersState['sortBy']) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setDetectedLanguage: (lang?: 'english' | 'pidgin') => void
  setAiInterpretation: (interp?: string) => void
  toggleSaveListing: (listingId: string) => void
  resetFilters: () => void
  setResults: (results: PropertyListing[]) => void
  setIsSearching: (isSearching: boolean) => void
}

const DEFAULT_FILTERS: SearchFiltersState = {
  query: '',
  transactionType: 'any',
  propertyType: 'any',
  lga: 'any',
  location: '',
  bedrooms: 'any',
  minPrice: 0,
  maxPrice: 500000000,
  titleType: 'any',
  amenities: [],
  riskLevel: 'any',
  sortBy: 'relevance',
  viewMode: 'grid',
  detectedLanguage: undefined,
  aiInterpretation: undefined,
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  ...DEFAULT_FILTERS,
  results: [],
  savedListings: [],
  isSearching: false,

  setQuery: (query) => set({ query }),
  setTransactionType: (transactionType) => set({ transactionType }),
  setPropertyType: (propertyType) => set({ propertyType }),
  setLGA: (lga) =>
    set((state) => {
      if (lga !== 'any' && state.location) {
        const isValid = isValidLocationInLGA(state.location, lga)
        if (!isValid) {
          return { lga, location: '' }
        }
      }
      return { lga }
    }),
  setLocation: (location) => set({ location }),
  setBedrooms: (bedrooms) => set({ bedrooms }),
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
  setTitleType: (titleType) => set({ titleType }),
  toggleAmenity: (amenity) =>
    set((state) => ({
      amenities: state.amenities.includes(amenity)
        ? state.amenities.filter((a) => a !== amenity)
        : [...state.amenities, amenity],
    })),
  setRiskLevel: (riskLevel) => set({ riskLevel }),
  setSortBy: (sortBy) => set({ sortBy }),
  setViewMode: (viewMode) => set({ viewMode }),
  setDetectedLanguage: (detectedLanguage) => set({ detectedLanguage }),
  setAiInterpretation: (aiInterpretation) => set({ aiInterpretation }),
  toggleSaveListing: (listingId) =>
    set((state) => ({
      savedListings: state.savedListings.includes(listingId)
        ? state.savedListings.filter((id) => id !== listingId)
        : [...state.savedListings, listingId],
    })),
  resetFilters: () => set({ ...DEFAULT_FILTERS }),
  setResults: (results) => set({ results }),
  setIsSearching: (isSearching) => set({ isSearching }),
}))
