'use client'

import React from 'react'
import {
  SquaresFour,
  ListBullets,
  X,
  SlidersHorizontal,
  BookmarkSimple,
} from '@phosphor-icons/react'
import { NLPSearchBar } from '@/components/search/NLPSearchBar'
import { SearchFilters } from '@/components/search/SearchFilters'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import { Select, Button, Modal } from '@/components/ui'
import { useSearchStore } from '@/store/search'
import { PropertyListing } from '@/types'
import { formatNGN } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

export default function PropertySearchPage() {
  const {
    query,
    transactionType,
    propertyType,
    lga,
    location,
    bedrooms,
    minPrice,
    maxPrice,
    titleType,
    amenities,
    riskLevel,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    resetFilters,
    setTransactionType,
    setPropertyType,
    setLGA,
    setLocation,
    setBedrooms,
    setTitleType,
    toggleAmenity,
    setRiskLevel,
  } = useSearchStore()

  const { addToast } = useToast()
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false)
  const [listings, setListings] = React.useState<PropertyListing[]>([])
  const [totalCount, setTotalCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  // Real-time fetch against Postgres GET /api/listings
  React.useEffect(() => {
    let isCancelled = false

    async function fetchResults() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (query) params.set('query', query)
        if (transactionType && transactionType !== 'any') params.set('transactionType', transactionType)
        if (propertyType && propertyType !== 'any') params.set('propertyType', propertyType)
        if (lga && lga !== 'any') params.set('lga', lga)
        if (location && location.trim() !== '') params.set('location', location.trim())
        if (bedrooms && bedrooms !== 'any') params.set('bedrooms', String(bedrooms))
        if (minPrice && minPrice > 0) params.set('minPrice', String(minPrice))
        if (maxPrice && maxPrice < 500000000) params.set('maxPrice', String(maxPrice))
        if (sortBy) params.set('sort', sortBy)

        const res = await fetch(`/api/listings?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          if (!isCancelled) {
            let resListings: PropertyListing[] = data.listings || []

            // Client-side refinements for secondary attributes
            if (titleType && titleType !== 'any') {
              resListings = resListings.filter((p) => p.title_type === titleType)
            }
            if (riskLevel === 'low') {
              resListings = resListings.filter((p) => p.fraud_risk_level === 'low')
            }
            if (amenities && amenities.length > 0) {
              resListings = resListings.filter((p) =>
                amenities.every((a) => p.amenities && p.amenities.includes(a))
              )
            }

            setListings(resListings)
            setTotalCount(data.total !== undefined ? data.total : resListings.length)
          }
        } else if (res.status === 400) {
          // If geography mismatch occurred (e.g. location not in newly chosen LGA), clear conflicting location
          setLocation('')
        }
      } catch (err) {
        console.error('[BUYER SEARCH] Error fetching listings:', err)
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    const timer = setTimeout(fetchResults, 200)
    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [
    query,
    transactionType,
    propertyType,
    lga,
    location,
    bedrooms,
    minPrice,
    maxPrice,
    titleType,
    amenities,
    riskLevel,
    sortBy,
  ])

  // Active filter tags calculation
  const activeTags: { label: string; onRemove: () => void }[] = []
  if (transactionType !== 'any') {
    activeTags.push({
      label: `For ${transactionType}`,
      onRemove: () => setTransactionType('any'),
    })
  }
  if (propertyType !== 'any') {
    activeTags.push({
      label: propertyType,
      onRemove: () => setPropertyType('any'),
    })
  }
  if (lga !== 'any') {
    activeTags.push({
      label: `${lga} LGA`,
      onRemove: () => setLGA('any'),
    })
  }
  if (location) {
    activeTags.push({
      label: location,
      onRemove: () => setLocation(''),
    })
  }
  if (bedrooms !== 'any') {
    activeTags.push({
      label: `${bedrooms}+ Beds`,
      onRemove: () => setBedrooms('any'),
    })
  }
  if (maxPrice < 300000000) {
    activeTags.push({
      label: `Under ${formatNGN(maxPrice, true)}`,
      onRemove: () => useSearchStore.getState().setPriceRange(0, 500000000),
    })
  }
  if (titleType !== 'any') {
    activeTags.push({
      label: titleType,
      onRemove: () => setTitleType('any'),
    })
  }
  if (riskLevel === 'low') {
    activeTags.push({
      label: 'Low Risk Only',
      onRemove: () => setRiskLevel('any'),
    })
  }
  amenities.forEach((a) => {
    activeTags.push({
      label: a,
      onRemove: () => toggleAmenity(a),
    })
  })

  const handleSaveSearch = () => {
    addToast({
      title: 'Search Saved',
      message: 'You will receive notifications when new matching properties are listed.',
      type: 'success',
    })
  }

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Pinned Top NLP Search */}
      <div className="sticky top-16 z-20 bg-[#F5EDD6] pt-2 pb-4">
        <NLPSearchBar compact />
      </div>

      {/* Active Filter Badges Row & Count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#1A1A1A]">
            Showing {listings.length} {listings.length === 1 ? 'property' : 'properties'}
          </span>

          {activeTags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F0F4EC] text-[#2D5A3D] border border-[#A8C192]"
            >
              <span>{tag.label}</span>
              <button
                onClick={tag.onRemove}
                className="hover:text-[#C1121F] p-0.5"
                aria-label="Remove filter"
              >
                <X size={12} weight="bold" />
              </button>
            </span>
          ))}

          {activeTags.length > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-[#C1121F] hover:underline ml-1"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveSearch}
            leftIcon={<BookmarkSimple size={14} weight="bold" />}
            className="text-xs"
          >
            Save This Search
          </Button>

          {/* Mobile Filter Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMobileFiltersOpen(true)}
            leftIcon={<SlidersHorizontal size={14} />}
            className="lg:hidden text-xs"
          >
            Filters {activeTags.length > 0 && `(${activeTags.length})`}
          </Button>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Panel */}
        <div className="hidden lg:block lg:col-span-1 sticky top-36">
          <SearchFilters />
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Sorting and Grid/List Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-xl border border-[#D6C9A8] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#5C5C5C]">Sort by:</span>
              <Select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | 'relevance'
                      | 'price_asc'
                      | 'price_desc'
                      | 'newest'
                      | 'most_saved'
                  )
                }
                className="h-8 text-xs py-0 pr-8"
              >
                <option value="relevance">Relevance &amp; AI Match</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Listed</option>
                <option value="most_saved">Most Saved</option>
              </Select>
            </div>

            <div className="flex items-center gap-1 bg-[#F5EDD6] p-0.5 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#2D5A3D] shadow-xs'
                    : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
                }`}
                aria-label="Grid view"
              >
                <SquaresFour size={16} weight="bold" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-white text-[#2D5A3D] shadow-xs'
                    : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
                }`}
                aria-label="List view"
              >
                <ListBullets size={16} weight="bold" />
              </button>
            </div>
          </div>

          {/* Properties Grid */}
          <PropertyGrid
            properties={listings}
            isLoading={loading}
            viewMode={viewMode}
            onResetFilters={resetFilters}
          />
        </div>
      </div>

      {/* Mobile Filter Sheet Modal */}
      <Modal
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Refine Property Search"
      >
        <SearchFilters />
        <div className="pt-4 mt-4 border-t border-[#EDE0C4]">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => setMobileFiltersOpen(false)}
          >
            Show {listings.length} Results
          </Button>
        </div>
      </Modal>
    </div>
  )
}
