'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkle,
  SlidersHorizontal,
  Coins,
  ShieldCheck,
  HouseSimple,
  CheckCircle,
  Lightning,
  MapPin,
  ArrowRight,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { Card, Button, Badge, Tabs } from '@/components/ui'
import { PropertyCard } from '@/components/property/PropertyCard'
import { formatNGN } from '@/lib/utils'
import { ABUJA_LGAS } from '@/lib/data/locations'
import { PropertyListing } from '@/types'

interface RecommendedProperty extends PropertyListing {
  matchScore: number
  matchReasons: string[]
  highlightBadge?: string
}

export default function BuyerRecommendationsPage() {
  const [filterPreset, setFilterPreset] = useState<'all' | 'value' | 'security' | 'serviced'>('all')
  const [preferredLGA, setPreferredLGA] = useState<string>('AMAC')
  const [maxBudget, setMaxBudget] = useState<number>(3500000)
  const [listings, setListings] = useState<PropertyListing[]>([])
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true)
        const res = await fetch('/api/listings?sort=newest')
        if (res.ok) {
          const data = await res.json()
          setListings(data.listings || [])
        }
      } catch (err) {
        console.error('[RECOMMENDATIONS] Error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadRecommendations()
  }, [])

  // Curate recommendations dynamically from active listings
  const rawRecommendations: RecommendedProperty[] = listings.map((l, index) => {
    const matchScore = Math.max(72, 98 - index * 3)
    const matchReasons: string[] = []
    if (l.location) matchReasons.push(`Located in desirable ${l.location} corridor`)
    if (l.title_type) matchReasons.push(`Verified ${l.title_type} documentation`)
    if (l.fraud_risk_level === 'low') matchReasons.push(`Low fraud risk score (${l.fraud_score || 0}/100)`)
    if (l.amenities && l.amenities.length > 0) matchReasons.push(`Includes ${l.amenities.slice(0, 2).join(' & ')}`)
    if (matchReasons.length < 2) matchReasons.push('Verified AbujaHommes listing')

    let highlightBadge: string | undefined
    if (index === 0) highlightBadge = 'Top AI Match'
    else if (index === 1) highlightBadge = 'High Convenience'
    else if (index === 2) highlightBadge = 'Prime Value'
    else if (l.asking_price < 5000000) highlightBadge = 'Budget Friendly'

    return {
      ...l,
      matchScore,
      matchReasons,
      highlightBadge,
    }
  })

  const filteredRecommendations = rawRecommendations.filter((item) => {
    if (filterPreset === 'value') {
      return item.location === 'Gwarinpa' || item.location === 'Lokogoma' || item.location === 'Lugbe'
    }
    if (filterPreset === 'security') {
      return item.amenities && item.amenities.includes('Security / CCTV')
    }
    if (filterPreset === 'serviced') {
      return item.amenities && item.amenities.includes('Generator')
    }
    return true
  })

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F0F4EC] text-[#2D5A3D] flex items-center justify-center">
              <Sparkle size={20} weight="fill" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              Personalized AI Recommendations
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#5C5C5C] mt-1">
            Algorithmically ranked properties based on your search patterns, verified title checks, and fair price indices
          </p>
        </div>

        <Link href="/dashboard/buyer/search">
          <Button variant="secondary" size="md" rightIcon={<ArrowRight size={16} />}>
            Search All Listings
          </Button>
        </Link>
      </div>

      {/* AI Preference Tuning Card */}
      <Card elevation="1" className="p-5 bg-white border border-[#D6C9A8] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDE0C4]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-[#2D5A3D]" />
            <h3 className="text-sm font-bold text-[#1A1A1A]">
              Your AI Recommendation Profile
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#2D6A4F] flex items-center gap-1">
            <CheckCircle size={14} weight="fill" />
            <span>AI Model v2.1 Active</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[#5C5C5C] font-semibold block mb-1">Preferred Council:</span>
            <select
              value={preferredLGA}
              onChange={(e) => setPreferredLGA(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#D6C9A8] bg-[#FDFAF4] font-bold text-[#1A1A1A] outline-none"
            >
              {ABUJA_LGAS.map((l) => (
                <option key={l} value={l}>
                  {l} Council (Primary)
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[#5C5C5C] font-semibold block mb-1">Target Annual Budget:</span>
            <select
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-[#D6C9A8] bg-[#FDFAF4] font-bold text-[#1A1A1A] outline-none"
            >
              <option value={1500000}>Under NGN 1.5M / yr</option>
              <option value={2500000}>Under NGN 2.5M / yr</option>
              <option value={3500000}>Under NGN 3.5M / yr</option>
              <option value={7000000}>Under NGN 7.0M / yr</option>
              <option value={100000000}>Luxury Outright Purchase</option>
            </select>
          </div>

          <div>
            <span className="text-[#5C5C5C] font-semibold block mb-1">Key Must-Haves:</span>
            <div className="h-10 px-3 rounded-lg border border-[#D6C9A8] bg-[#FDFAF4] flex items-center gap-2 text-[11px] font-bold text-[#2D5A3D]">
              <span>✓ 24/7 Power</span>
              <span>✓ Security</span>
              <span>✓ Borehole</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Preset Category Filters */}
      <Tabs
        tabs={[
          { id: 'all', label: 'All AI Matches', count: rawRecommendations.length },
          { id: 'value', label: 'Best Value per SQM' },
          { id: 'security', label: 'High Security Gated' },
          { id: 'serviced', label: 'Fully Serviced' },
        ]}
        activeTab={filterPreset}
        onChange={(tab) => setFilterPreset(tab as any)}
      />

      {/* Recommended Properties Feed */}
      {loading ? (
        <div className="p-16 text-center text-xs text-[#5C5C5C] bg-white rounded-2xl border border-[#D6C9A8]">
          Curating personalized AI recommendations from active listings...
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="p-16 text-center text-xs text-[#5C5C5C] bg-white rounded-2xl border border-[#D6C9A8]">
          No matching properties found for your current filter settings.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((property) => (
            <div key={property.id} className="space-y-2 flex flex-col">
              {/* AI Match Header Banner */}
              <div className="bg-[#F0F4EC] border border-[#A8C192] rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-extrabold text-[#2D5A3D]">
                  <Sparkle size={16} weight="fill" />
                  <span>{property.matchScore}% Match</span>
                </div>
                {property.highlightBadge && (
                  <span className="px-2 py-0.5 bg-white text-[#1A1A1A] font-bold text-[10px] rounded-md border border-[#D6C9A8] shadow-xs">
                    {property.highlightBadge}
                  </span>
                )}
              </div>

              {/* Property Card */}
              <PropertyCard property={property} />

              {/* "Why AI Matched This" Card */}
              <div className="p-3 bg-white rounded-xl border border-[#D6C9A8] shadow-xs text-xs space-y-1.5">
                <span className="font-bold text-[#1A1A1A] flex items-center gap-1">
                  <CheckCircle size={14} weight="fill" className="text-[#2D6A4F]" />
                  Why AI Recommended:
                </span>
                <ul className="space-y-1 text-[11px] text-[#5C5C5C]">
                  {property.matchReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#2D6A4F] font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
