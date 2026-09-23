'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { MapPin, CaretUpDown, Check, X } from '@phosphor-icons/react'
import { LGA } from '@/types'
import { getLocationNamesByLGA } from '@/lib/data/locations'
import { cn } from '@/lib/utils'

export interface DistrictComboboxProps {
  lga?: LGA | 'any' | ''
  value: string
  onChange: (district: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  id?: string
  name?: string
  error?: string
}

export const DistrictCombobox: React.FC<DistrictComboboxProps> = ({
  lga,
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
  required = false,
  className,
  id,
  name,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isLgaSelected = Boolean(lga && lga !== 'any')

  // Strictly only locations belonging to the chosen LGA, sorted alphabetically
  const availableDistricts = useMemo(() => {
    if (!isLgaSelected) return []
    return getLocationNamesByLGA(lga as LGA).slice().sort((a, b) => a.localeCompare(b))
  }, [lga, isLgaSelected])

  // Filter districts based on user search query
  const filteredDistricts = useMemo(() => {
    if (!searchTerm.trim()) return availableDistricts
    const term = searchTerm.toLowerCase().trim()
    return availableDistricts.filter((d) => d.toLowerCase().includes(term))
  }, [availableDistricts, searchTerm])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const defaultPlaceholder = !isLgaSelected
    ? 'Select Area Council (LGA) first...'
    : `Choose district in ${lga}...`

  const handleSelect = (district: string) => {
    onChange(district)
    setSearchTerm('')
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearchTerm('')
    if (inputRef.current) inputRef.current.focus()
  }

  const isComboboxDisabled = disabled || !isLgaSelected

  return (
    <div className={cn('relative w-full text-left', className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold text-[#1A1A1A] mb-1.5"
        >
          {label}
          {required && <span className="text-[#C1121F] ml-0.5">*</span>}
        </label>
      )}

      <div
        onClick={() => {
          if (!isComboboxDisabled) {
            setIsOpen((prev) => !prev)
            if (!isOpen && inputRef.current) {
              inputRef.current.focus()
            }
          }
        }}
        className={cn(
          'relative w-full h-12 px-3 pl-9 pr-8 bg-white rounded-xl border flex items-center justify-between text-sm transition-all shadow-xs cursor-pointer select-none',
          error
            ? 'border-[#C1121F] hover:border-[#C1121F] focus-within:ring-2 focus-within:ring-[#C1121F]/20'
            : 'border-[#D6C9A8] hover:border-[#2D5A3D] focus-within:border-[#2D5A3D] focus-within:ring-2 focus-within:ring-[#2D5A3D]/20',
          isComboboxDisabled && 'bg-[#F9F6EE] text-[#9A9A9A] border-[#E6E1D3] cursor-not-allowed opacity-80 hover:border-[#E6E1D3]'
        )}
      >
        <MapPin
          size={16}
          weight="fill"
          className={cn(
            'absolute left-3 shrink-0',
            isComboboxDisabled ? 'text-[#9A9A9A]' : 'text-[#2D5A3D]'
          )}
        />

        <div className="flex-1 truncate mr-2">
          {value ? (
            <span className="font-semibold text-[#1A1A1A]">{value}</span>
          ) : (
            <span className="text-[#9A9A9A]">{placeholder || defaultPlaceholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !isComboboxDisabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-[#F0F4EC] rounded-full text-[#5C5C5C] hover:text-[#1A1A1A]"
              title="Clear selection"
            >
              <X size={12} weight="bold" />
            </button>
          )}
          <CaretUpDown size={14} className="text-[#5C5C5C]" />
        </div>
      </div>

      {error && <p className="text-[11px] text-[#C1121F] mt-1 font-medium">{error}</p>}

      {/* Dropdown Combobox Menu */}
      {isOpen && !isComboboxDisabled && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-[#D6C9A8] rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col animate-fadeIn">
          {/* Search filter input inside popover */}
          <div className="p-2 border-b border-[#EDE0C4] bg-[#FDFAF4]">
            <input
              ref={inputRef}
              type="text"
              id={id}
              name={name}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${availableDistricts.length} ${lga} districts...`}
              className="w-full h-8 px-2.5 text-xs rounded-lg border border-[#D6C9A8] focus:border-[#2D5A3D] focus:ring-1 focus:ring-[#2D5A3D] outline-none bg-white text-[#1A1A1A]"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* District list */}
          <div className="flex-1 overflow-y-auto max-h-48 divide-y divide-[#F5EDD6]">
            {filteredDistricts.length > 0 ? (
              filteredDistricts.map((district) => {
                const isSelected = value === district
                return (
                  <button
                    key={district}
                    type="button"
                    onClick={() => handleSelect(district)}
                    className={cn(
                      'w-full px-3 py-2 text-xs flex items-center justify-between text-left transition-colors min-h-[36px]',
                      isSelected
                        ? 'bg-[#F0F4EC] text-[#2D5A3D] font-bold'
                        : 'text-[#1A1A1A] hover:bg-[#FDFAF4]'
                    )}
                  >
                    <span>{district}</span>
                    {isSelected && <Check size={14} weight="bold" className="text-[#2D5A3D]" />}
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-4 text-center text-xs text-[#9A9A9A]">
                No districts matching &quot;{searchTerm}&quot; in {lga}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
