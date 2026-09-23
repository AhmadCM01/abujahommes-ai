'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MagnifyingGlass,
  MapPin,
  Sparkle,
  SlidersHorizontal,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { Card, Button, Input, Select, Slider, DistrictCombobox } from '@/components/ui'
import { LanguageChip } from './LanguageChip'
import { useSearchStore } from '@/store/search'
import {
  ABUJA_LGAS,
  POPULAR_LOCATIONS,
  ABUJA_LOCATIONS,
  getLocationLGA,
  normalizeLocation,
  isValidLocationInLGA,
} from '@/lib/data/locations'
import { formatNGN, cn } from '@/lib/utils'
import { LGA, TransactionType } from '@/types'

const PLACEHOLDER_EXAMPLES = [
  '3 bedroom in Gwarinpa under 2 million',
  'I wan rent flat for Wuse 2, no go pass 800k',
  'Quiet house near school in Maitama',
  '5-bed mansion in Guzape for sale with swimming pool',
  'Land for sale in Katampe Extension with C of O',
  'Affordable 2 bedroom apartment in Lokogoma',
]

export interface NLPSearchBarProps {
  compact?: boolean
  autoFocus?: boolean
  className?: string
}

export const NLPSearchBar: React.FC<NLPSearchBarProps> = ({
  compact = false,
  autoFocus = false,
  className,
}) => {
  const router = useRouter()
  const {
    query,
    setQuery,
    transactionType,
    setTransactionType,
    propertyType,
    setPropertyType,
    lga,
    setLGA,
    location,
    setLocation,
    bedrooms,
    setBedrooms,
    minPrice,
    maxPrice,
    setPriceRange,
    detectedLanguage,
    setDetectedLanguage,
    aiInterpretation,
    setAiInterpretation,
    isSearching,
    setIsSearching,
  } = useSearchStore()

  const [currentPlaceholderIdx, setCurrentPlaceholderIdx] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(!compact)

  // Cycle placeholder every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Local NLP Intent Parser simulation + Gemini API trigger
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSearching(true)

    try {
      const res = await fetch('/api/nlp-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.detectedLanguage) setDetectedLanguage(data.detectedLanguage)
        if (data.interpretation) setAiInterpretation(data.interpretation)
        if (data.transactionType && data.transactionType !== 'any') {
          setTransactionType(data.transactionType)
        }
        if (data.propertyType && data.propertyType !== 'any') {
          setPropertyType(data.propertyType)
        }
        if (data.lga && data.lga !== 'any') setLGA(data.lga)
        if (data.location) setLocation(data.location)
        if (data.bedrooms) setBedrooms(data.bedrooms)
        if (data.maxPrice) setPriceRange(0, data.maxPrice)
      }
    } catch {
      // Fallback local regex parsing for Pidgin / English shorthand
      const text = query.toLowerCase()
      const isPidgin =
        text.includes('i wan') ||
        text.includes('make i') ||
        text.includes('no go pass') ||
        text.includes('e dey')

      setDetectedLanguage(isPidgin ? 'pidgin' : 'english')

      let matchedLoc: string | null = null
      if (text.includes('wuse 2') || text.includes('wuse ii') || text.includes('wuse')) matchedLoc = 'Wuse 2'
      else if (text.includes('gwarinpa')) matchedLoc = 'Gwarinpa'
      else if (text.includes('maitama')) matchedLoc = 'Maitama'
      else if (text.includes('guzape')) matchedLoc = 'Guzape'
      else if (text.includes('lokogoma')) matchedLoc = 'Lokogoma'
      else if (text.includes('lugbe')) matchedLoc = 'Lugbe'
      else if (text.includes('kubwa')) matchedLoc = 'Kubwa'
      else if (text.includes('dawaki')) matchedLoc = 'Dawaki'
      else if (text.includes('mpape')) matchedLoc = 'Mpape'
      else if (text.includes('katampe')) matchedLoc = 'Katampe Extension'

      if (matchedLoc) {
        setLocation(matchedLoc)
        const matchedLGA = getLocationLGA(matchedLoc)
        if (matchedLGA) setLGA(matchedLGA)
      }

      if (text.includes('rent')) setTransactionType('rent')
      else if (text.includes('sale') || text.includes('buy')) setTransactionType('sale')

      if (text.includes('flat') || text.includes('apartment')) setPropertyType('flat')
      else if (text.includes('duplex')) setPropertyType('duplex')
      else if (text.includes('terrace')) setPropertyType('terrace')
      else if (text.includes('bungalow')) setPropertyType('bungalow')
      else if (text.includes('detached') || text.includes('mansion')) {
        setPropertyType(text.includes('semi') ? 'semi-detached' : 'detached')
      } else if (text.includes('land') || text.includes('plot')) setPropertyType('land')
      else if (text.includes('commercial') || text.includes('office') || text.includes('shop')) {
        setPropertyType('commercial')
      }

      if (text.includes('3 bed') || text.includes('3-bed') || text.includes('3 bedroom')) {
        setBedrooms(3)
      } else if (text.includes('2 bed') || text.includes('2-bed') || text.includes('2 bedroom')) {
        setBedrooms(2)
      } else if (text.includes('4 bed') || text.includes('4-bed') || text.includes('4 bedroom')) {
        setBedrooms(4)
      }
    } finally {
      setIsSearching(false)
      if (window.location.pathname !== '/dashboard/buyer/search') {
        router.push('/dashboard/buyer/search')
      }
    }
  }

  return (
    <Card
      elevation="2"
      className={cn('w-full bg-white rounded-2xl p-5 md:p-6 border border-[#D6C9A8]', className)}
    >
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Main Search Input Row */}
        <div className="relative flex items-center">
          <div className="absolute left-4 text-[#2D5A3D] pointer-events-none">
            <MagnifyingGlass size={24} weight="bold" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`e.g. "${PLACEHOLDER_EXAMPLES[currentPlaceholderIdx]}"`}
            autoFocus={autoFocus}
            className="w-full h-14 pl-12 pr-28 md:pr-32 text-sm md:text-base font-medium rounded-xl bg-white border-2 border-[#D6C9A8] focus:border-[#2D5A3D] focus:ring-2 focus:ring-[#2D5A3D]/20 outline-none text-[#1A1A1A] placeholder-[#9A9A9A] transition-all shadow-xs"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSearching}
              className="h-10 px-4 md:px-5 font-bold shadow-sm"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Transaction Type Pills & Language Detector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 bg-[#F5EDD6] p-1 rounded-xl">
            {(['any', 'rent', 'sale'] as (TransactionType | 'any')[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTransactionType(type)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all select-none',
                  transactionType === type
                    ? 'bg-[#2D5A3D] text-white shadow-xs'
                    : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
                )}
              >
                {type === 'any' ? 'All Types' : `For ${type}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LanguageChip
              language={detectedLanguage}
              interpretation={aiInterpretation}
            />
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs font-semibold text-[#2D5A3D] hover:underline px-2 py-1"
            >
              <SlidersHorizontal size={14} />
              <span>{showAdvanced ? 'Hide filters' : 'More filters'}</span>
            </button>
          </div>
        </div>

        {/* Extended Filter Options Drawer / Row */}
        {showAdvanced && (
          <div className="pt-3 border-t border-[#EDE0C4] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            {/* LGA Dropdown */}
            <div>
              <label className="text-[11px] font-bold text-[#5C5C5C] uppercase tracking-wider block mb-1.5">
                Abuja Area Council (LGA)
              </label>
              <Select
                value={lga}
                onChange={(e) => {
                  const newLGA = e.target.value as LGA | 'any'
                  setLGA(newLGA)
                  if (newLGA === 'any' || (location && !isValidLocationInLGA(location, newLGA))) {
                    setLocation('')
                  }
                }}
                className="h-11 text-xs"
              >
                <option value="any">All 6 Area Councils</option>
                {ABUJA_LGAS.map((lgaItem) => (
                  <option key={lgaItem} value={lgaItem}>
                    {lgaItem} Council
                  </option>
                ))}
              </Select>
            </div>

            {/* Area District Combobox */}
            <div>
              <label className="text-[11px] font-bold text-[#5C5C5C] uppercase tracking-wider block mb-1.5">
                {lga !== 'any' ? `District in ${lga}` : 'District / Area'}
              </label>
              <DistrictCombobox
                lga={lga}
                value={location}
                onChange={setLocation}
                placeholder={lga !== 'any' ? `Search ${lga} districts...` : 'Select LGA first to choose district'}
              />
            </div>

            {/* Bedrooms Pill Selector */}
            <div>
              <label className="text-[11px] font-bold text-[#5C5C5C] uppercase tracking-wider block mb-1.5">
                Bedrooms
              </label>
              <div className="flex items-center gap-1 bg-[#F5EDD6] p-1 rounded-lg">
                {(['any', 1, 2, 3, 4, 5] as (number | 'any')[]).map((bed) => (
                  <button
                    key={bed.toString()}
                    type="button"
                    onClick={() => setBedrooms(bed)}
                    className={cn(
                      'flex-1 py-1 rounded text-xs font-bold transition-all text-center',
                      bedrooms === bed
                        ? 'bg-[#2D5A3D] text-white'
                        : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
                    )}
                  >
                    {bed === 'any' ? 'Any' : bed === 5 ? '5+' : bed}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Budget Slider */}
            <div>
              <label className="text-[11px] font-bold text-[#5C5C5C] uppercase tracking-wider block mb-1.5">
                Max Budget: {formatNGN(maxPrice, true)}
              </label>
              <input
                type="range"
                min={500000}
                max={300000000}
                step={500000}
                value={maxPrice}
                onChange={(e) => setPriceRange(minPrice, Number(e.target.value))}
                className="w-full h-2 bg-[#EDE0C4] rounded-lg appearance-none cursor-pointer accent-[#2D5A3D] mt-2.5"
              />
            </div>
          </div>
        )}
      </form>
    </Card>
  )
}
