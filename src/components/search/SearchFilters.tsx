'use client'

import React, { useState } from 'react'
import {
  HouseSimple,
  Buildings,
  Door,
  Tree,
  Storefront,
  ArrowsCounterClockwise,
  CaretDown,
  CaretUp,
} from '@phosphor-icons/react'
import { Checkbox, Button, Slider, Input, Select, DistrictCombobox } from '@/components/ui'
import { useSearchStore } from '@/store/search'
import { ABUJA_LGAS, isValidLocationInLGA } from '@/lib/data/locations'
import { ALL_AMENITIES } from '@/lib/data/premiums'
import { formatNGN, cn } from '@/lib/utils'
import { LGA, PropertyType, TransactionType } from '@/types'

export interface SearchFiltersProps {
  className?: string
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ className }) => {
  const {
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
    titleType,
    setTitleType,
    amenities,
    toggleAmenity,
    riskLevel,
    setRiskLevel,
    resetFilters,
  } = useSearchStore()

  const [expandedAmenities, setExpandedAmenities] = useState(false)

  const propertyTypesList: { type: PropertyType; label: string; icon: React.ReactNode }[] = [
    { type: 'duplex', label: 'Duplex', icon: <HouseSimple size={16} /> },
    { type: 'flat', label: 'Flat / Apt', icon: <Door size={16} /> },
    { type: 'terrace', label: 'Terrace', icon: <Buildings size={16} /> },
    { type: 'bungalow', label: 'Bungalow', icon: <HouseSimple size={16} /> },
    { type: 'detached', label: 'Detached', icon: <HouseSimple size={16} /> },
    { type: 'semi-detached', label: 'Semi-Detached', icon: <Buildings size={16} /> },
    { type: 'land', label: 'Land Plot', icon: <Tree size={16} /> },
    { type: 'commercial', label: 'Commercial', icon: <Storefront size={16} /> },
  ]

  const titleTypesList = [
    'C of O',
    'Right of Occupancy',
    'Deed of Assignment',
    'Governors Consent',
    'FCDA Allocation',
    'FHA Allocation',
    'Survey',
  ]

  return (
    <div
      className={cn(
        'w-full bg-white rounded-2xl p-5 border border-[#D6C9A8] shadow-1 space-y-6 text-left',
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#EDE0C4]">
        <h3 className="text-sm font-bold text-[#1A1A1A]">Search Filters</h3>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-[#2D5A3D] hover:underline flex items-center gap-1"
        >
          <ArrowsCounterClockwise size={14} />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Transaction Type */}
      <div>
        <label className="text-xs font-bold text-[#1A1A1A] block mb-2">
          Transaction Type
        </label>
        <div className="grid grid-cols-3 gap-1.5 bg-[#F5EDD6] p-1 rounded-xl">
          {(['any', 'rent', 'sale'] as (TransactionType | 'any')[]).map((t) => (
            <button
              key={t}
              onClick={() => setTransactionType(t)}
              className={cn(
                'py-1.5 text-xs font-bold rounded-lg capitalize transition-all',
                transactionType === t
                  ? 'bg-[#2D5A3D] text-white shadow-xs'
                  : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
              )}
            >
              {t === 'any' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      {/* 2. LGA Area Council */}
      <div>
        <label className="text-xs font-bold text-[#1A1A1A] block mb-1.5">
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
          className="h-10 text-xs"
        >
          <option value="any">All 6 Area Councils</option>
          {ABUJA_LGAS.map((lgaItem) => (
            <option key={lgaItem} value={lgaItem}>
              {lgaItem} Council
            </option>
          ))}
        </Select>
      </div>

      {/* 3. District / Location Combobox */}
      <div>
        <label className="text-xs font-bold text-[#1A1A1A] block mb-1.5">
          {lga !== 'any' ? `District in ${lga}` : 'District / Area'}
        </label>
        <DistrictCombobox
          lga={lga}
          value={location}
          onChange={setLocation}
          placeholder={lga !== 'any' ? `Search ${lga} districts...` : 'Select LGA first to choose district'}
        />
      </div>

      {/* 4. Property Type Grid with Icons */}
      <div>
        <label className="text-xs font-bold text-[#1A1A1A] block mb-2">
          Property Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {propertyTypesList.map((pt) => {
            const isSelected = propertyType === pt.type
            return (
              <button
                key={pt.type}
                onClick={() => setPropertyType(isSelected ? 'any' : pt.type)}
                className={cn(
                  'p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all',
                  isSelected
                    ? 'border-[#2D5A3D] bg-[#F0F4EC] text-[#2D5A3D]'
                    : 'border-[#D6C9A8] bg-white text-[#5C5C5C] hover:border-[#2D5A3D]'
                )}
              >
                {pt.icon}
                <span className="truncate">{pt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. Bedrooms Stepper / Pills */}
      <div>
        <label className="text-xs font-bold text-[#1A1A1A] block mb-2">Bedrooms</label>
        <div className="flex items-center gap-1 bg-[#F5EDD6] p-1 rounded-xl">
          {(['any', 1, 2, 3, 4, 5] as (number | 'any')[]).map((bed) => (
            <button
              key={bed.toString()}
              onClick={() => setBedrooms(bed)}
              className={cn(
                'flex-1 py-1 rounded-lg text-xs font-bold transition-all',
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

      {/* 6. Budget Range */}
      <div>
        <label className="text-xs font-bold text-[#1A1A1A] block mb-1">
          Max Price: {formatNGN(maxPrice, true)}
        </label>
        <input
          type="range"
          min={500000}
          max={350000000}
          step={500000}
          value={maxPrice}
          onChange={(e) => setPriceRange(minPrice, Number(e.target.value))}
          className="w-full h-2 bg-[#EDE0C4] rounded-lg appearance-none cursor-pointer accent-[#2D5A3D] mt-2"
        />
        <div className="flex justify-between text-[10px] text-[#9A9A9A] mt-1 font-mono">
          <span>NGN 500k</span>
          <span>NGN 350M+</span>
        </div>
      </div>

      {/* 7. Title Type */}
      <div>
        <label className="text-xs font-bold text-[#1A1A1A] block mb-2">Title Type</label>
        <div className="space-y-2">
          {titleTypesList.map((t) => (
            <Checkbox
              key={t}
              checked={titleType === t}
              onChange={() => setTitleType(titleType === t ? 'any' : t)}
              label={t}
            />
          ))}
        </div>
      </div>

      {/* 8. Amenities Checklist */}
      <div>
        <label className="text-xs font-bold text-[#1A1A1A] block mb-2">Amenities</label>
        <div className="space-y-2">
          {(expandedAmenities ? ALL_AMENITIES : ALL_AMENITIES.slice(0, 5)).map(
            (amenity) => (
              <Checkbox
                key={amenity}
                checked={amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                label={amenity}
              />
            )
          )}
        </div>
        <button
          onClick={() => setExpandedAmenities(!expandedAmenities)}
          className="mt-2 text-xs font-semibold text-[#2D5A3D] hover:underline flex items-center gap-1"
        >
          {expandedAmenities ? (
            <>
              <CaretUp size={12} />
              <span>Show less</span>
            </>
          ) : (
            <>
              <CaretDown size={12} />
              <span>Show all {ALL_AMENITIES.length} amenities</span>
            </>
          )}
        </button>
      </div>

      {/* 9. Safety / Fraud Risk Level */}
      <div>
        <label className="text-xs font-bold text-[#1A1A1A] block mb-2">
          Verified Safety Level
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#2D6A4F] cursor-pointer">
            <input
              type="radio"
              name="risk-filter"
              checked={riskLevel === 'low'}
              onChange={() => setRiskLevel(riskLevel === 'low' ? 'any' : 'low')}
              className="accent-[#2D6A4F]"
            />
            <span>Low Risk Only (Verified C of O)</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] cursor-pointer">
            <input
              type="radio"
              name="risk-filter"
              checked={riskLevel === 'any'}
              onChange={() => setRiskLevel('any')}
              className="accent-[#2D5A3D]"
            />
            <span>Show All Risk Tiers</span>
          </label>
        </div>
      </div>

      <Button
        variant="ghost"
        size="md"
        onClick={resetFilters}
        className="w-full text-xs text-[#5C5C5C] hover:text-[#C1121F]"
      >
        Clear All Filters
      </Button>
    </div>
  )
}
