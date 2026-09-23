'use client'

import React, { useState, useEffect } from 'react'
import { Select, Tabs } from '@/components/ui'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import { PropertyListing } from '@/types'
import { useToast } from '@/components/ui/Toast'

export default function FavouritesPage() {
  const { addToast } = useToast()
  const [favProperties, setFavProperties] = useState<PropertyListing[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const loadFavourites = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/favourites')
      if (res.ok) {
        const data = await res.json()
        setFavProperties(data.favourites || [])
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({ title: 'Could not load favourites', message: err.error || 'Server error', type: 'error' })
      }
    } catch {
      addToast({ title: 'Network Error', message: 'Failed to connect to server', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavourites()
  }, [])

  let sorted = [...favProperties]
  if (sortBy === 'price_asc') {
    sorted.sort((a, b) => a.asking_price - b.asking_price)
  } else if (sortBy === 'price_desc') {
    sorted.sort((a, b) => b.asking_price - a.asking_price)
  } else if (sortBy === 'newest') {
    sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  const filteredProperties = sorted.filter((p) => {
    if (activeTab === 'houses')
      return p.property_type === 'detached' || p.property_type === 'semi-detached'
    if (activeTab === 'flats') return p.property_type === 'flat'
    if (activeTab === 'land') return p.property_type === 'land'
    return true
  })

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
            My Saved Favourites
          </h1>
          <p className="text-xs text-[#5C5C5C] mt-0.5">
            {favProperties.length} saved properties across Abuja
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 text-xs"
          >
            <option value="newest">Recently Saved</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </Select>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs
        tabs={[
          { id: 'all', label: 'All Properties', count: favProperties.length },
          {
            id: 'houses',
            label: 'Houses & Duplexes',
            count: favProperties.filter(
              (p) => p.property_type === 'detached' || p.property_type === 'semi-detached'
            ).length,
          },
          {
            id: 'flats',
            label: 'Flats & Apartments',
            count: favProperties.filter((p) => p.property_type === 'flat').length,
          },
          {
            id: 'land',
            label: 'Land Plots',
            count: favProperties.filter((p) => p.property_type === 'land').length,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#5C5C5C] bg-white rounded-2xl border border-[#D6C9A8]">
          Loading your saved properties...
        </div>
      ) : (
        <PropertyGrid
          properties={filteredProperties}
          emptyTitle="No favourites in this category"
          emptyDescription="Explore active listings and tap the heart icon on any property to save it to your favourites."
        />
      )}
    </div>
  )
}
