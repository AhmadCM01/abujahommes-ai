'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  HouseSimple,
  PlusCircle,
  CurrencyNgn,
  ChartBar,
  Eye,
  Heart,
  ChatCircle,
  Sparkle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react'
import { StatCard, Card, Button, Badge, Select, DistrictCombobox } from '@/components/ui'
import { PropertyListing, LGA } from '@/types'
import { ABUJA_LGAS, isValidLocationInLGA } from '@/lib/data/locations'
import { formatNGN } from '@/lib/utils'

export default function SellerHomePage() {
  const [sellerListings, setSellerListings] = useState<PropertyListing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [sellerStats, setSellerStats] = useState({
    activeCount: 0,
    pendingCount: 0,
    totalViews: 0,
    totalSaves: 0,
    totalEnquiries: 0,
  })

  React.useEffect(() => {
    async function loadSellerProperties() {
      try {
        setLoadingListings(true)
        const res = await fetch('/api/listings?owner=me&limit=3')
        if (res.ok) {
          const data = await res.json()
          setSellerListings(data.listings || [])
        }
      } catch (err) {
        console.error('[SELLER DASHBOARD] Failed to load listings:', err)
      } finally {
        setLoadingListings(false)
      }
    }

    async function loadStats() {
      try {
        const res = await fetch('/api/stats?scope=seller')
        if (res.ok) {
          const data = await res.json()
          setSellerStats({
            activeCount: data.activeCount || 0,
            pendingCount: data.pendingCount || 0,
            totalViews: data.totalViews || 0,
            totalSaves: data.totalSaves || 0,
            totalEnquiries: data.totalEnquiries || 0,
          })
        }
      } catch (err) {
        console.error('[SELLER DASHBOARD] Failed to load stats:', err)
      }
    }

    loadSellerProperties()
    loadStats()
  }, [])

  // Quick price estimator widget state
  const [estLGA, setEstLGA] = useState<LGA>('AMAC')
  const [estLocation, setEstLocation] = useState('Gwarinpa')
  const [estType, setEstType] = useState('flat')
  const [estBeds, setEstBeds] = useState(3)
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(2400000)

  const handleEstimate = () => {
    const base = estLGA === 'AMAC' ? 2400000 : 1300000
    setEstimatedPrice(base + (estBeds - 2) * 400000)
  }

  return (
    <div className="space-y-8 text-left animate-fadeIn">
      {/* Section 1: Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            Seller Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5C5C] mt-0.5">
            You have {sellerStats.activeCount} active {sellerStats.activeCount === 1 ? 'listing' : 'listings'} and {sellerStats.totalEnquiries} total prospective buyer {sellerStats.totalEnquiries === 1 ? 'enquiry' : 'enquiries'}
          </p>
        </div>

        <Link href="/dashboard/seller/new-listing">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<PlusCircle size={20} weight="fill" />}
            className="shadow-sm"
          >
            Add New Listing
          </Button>
        </Link>
      </div>

      {/* Section 2: 5-card Stats Row (Real SQL Counts) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Active Listings"
          value={sellerStats.activeCount}
          icon={<HouseSimple size={20} weight="fill" />}
          iconBg="olive"
        />
        <StatCard
          label="Total Views"
          value={sellerStats.totalViews}
          icon={<Eye size={20} weight="bold" />}
          iconBg="sand"
        />
        <StatCard
          label="Total Saves"
          value={sellerStats.totalSaves}
          icon={<Heart size={20} weight="fill" />}
          iconBg="amber"
        />
        <StatCard
          label="Enquiries"
          value={sellerStats.totalEnquiries}
          icon={<ChatCircle size={20} weight="fill" />}
          iconBg="olive"
        />
        <StatCard
          label="Pending Review"
          value={sellerStats.pendingCount}
          icon={<ShieldCheck size={20} weight="fill" />}
          iconBg="sand"
        />
      </div>

      {/* Main Grid: Listings Performance Table + AI Tool Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Section 3: Listings Performance Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1A1A1A]">
              My Properties Performance
            </h2>
            <Link
              href="/dashboard/seller/listings"
              className="text-xs font-bold text-[#2D5A3D] hover:underline"
            >
              View all listings →
            </Link>
          </div>

          <Card elevation="1" className="p-0 overflow-hidden bg-white border border-[#D6C9A8]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5EDD6] text-[#5C5C5C] font-bold uppercase tracking-wider border-b border-[#D6C9A8]">
                  <tr>
                    <th className="p-4">Property</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Views</th>
                    <th className="p-4">Saves</th>
                    <th className="p-4">Safety</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE0C4]">
                  {loadingListings ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-[#5C5C5C]">
                        Loading your listings from registry...
                      </td>
                    </tr>
                  ) : sellerListings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-[#5C5C5C]">
                        No properties listed yet. Create your first listing to start reaching buyers.
                      </td>
                    </tr>
                  ) : (
                    sellerListings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-[#FDFAF4] transition-colors">
                        <td className="p-4">
                          <div>
                            <span className="font-bold text-[#1A1A1A] block">
                              {listing.title}
                            </span>
                            <span className="text-[11px] text-[#5C5C5C]">
                              {listing.location}, {listing.lga}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-[#2D5A3D]">
                          {formatNGN(listing.asking_price, true)}
                        </td>
                        <td className="p-4">
                          <Badge variant={listing.status === 'active' ? 'success' : 'default'}>
                            {listing.status === 'active' ? 'Active' : listing.status}
                          </Badge>
                        </td>
                        <td className="p-4 font-semibold">{listing.views}</td>
                        <td className="p-4 font-semibold">{listing.saves}</td>
                        <td className="p-4">
                          <Badge risk={listing.fraud_risk_level} />
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/dashboard/buyer/property/${listing.id}`}>
                            <Button variant="secondary" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Link href="/dashboard/seller/new-listing" className="block">
              <Button variant="primary" size="md" className="w-full justify-start text-xs">
                <PlusCircle size={16} weight="fill" />
                <span>Publish New Listing</span>
              </Button>
            </Link>
            <Link href="/dashboard/seller/price-tool" className="block">
              <Button variant="secondary" size="md" className="w-full justify-start text-xs">
                <CurrencyNgn size={16} weight="bold" />
                <span>Price Estimation Tool</span>
              </Button>
            </Link>
            <Link href="/dashboard/seller/analytics" className="block">
              <Button variant="outline" size="md" className="w-full justify-start text-xs">
                <ChartBar size={16} />
                <span>Review Performance</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 5: AI Quick Price Estimator Panel */}
        <div className="lg:col-span-1">
          <Card elevation="2" className="p-6 bg-white border border-[#D6C9A8] space-y-4">
            <div className="flex items-center gap-2 text-[#2D5A3D]">
              <Sparkle size={20} weight="fill" />
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                AI Instant Price Estimator
              </h3>
            </div>
            <p className="text-xs text-[#5C5C5C] leading-relaxed">
              Benchmark your Abuja property asking price to maximize inquiries.
            </p>

            <div className="space-y-3">
              <Select
                label="Area Council (LGA)"
                value={estLGA}
                onChange={(e) => {
                  const newLGA = e.target.value as LGA
                  setEstLGA(newLGA)
                  if (!isValidLocationInLGA(estLocation, newLGA)) {
                    setEstLocation('')
                  }
                }}
              >
                {ABUJA_LGAS.map((l) => (
                  <option key={l} value={l}>
                    {l} Council
                  </option>
                ))}
              </Select>

              <DistrictCombobox
                lga={estLGA}
                value={estLocation}
                onChange={setEstLocation}
                label={`District / Location (${estLGA} Council)`}
                placeholder={`Search districts in ${estLGA}...`}
              />

              <div>
                <label className="text-[11px] font-bold text-[#5C5C5C] uppercase block mb-1">
                  Property Type
                </label>
                <select
                  value={estType}
                  onChange={(e) => setEstType(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-[#D6C9A8] focus:border-[#2D5A3D] outline-none bg-white"
                >
                  <option value="flat">Flat / Apartment</option>
                  <option value="semi-detached">Semi-Detached Terrace</option>
                  <option value="detached">Fully Detached Duplex</option>
                  <option value="land">Residential Land Plot</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#5C5C5C] uppercase block mb-1">
                  Bedrooms: {estBeds}
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={estBeds}
                  onChange={(e) => setEstBeds(Number(e.target.value))}
                  className="w-full accent-[#2D5A3D]"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full mt-2"
                onClick={handleEstimate}
              >
                Estimate Fair Market Price
              </Button>
            </div>

            {estimatedPrice && (
              <div className="p-4 bg-[#F0F4EC] rounded-xl border border-[#A8C192] text-center space-y-1 animate-fadeIn">
                <span className="text-[10px] font-bold text-[#5C5C5C] uppercase tracking-wider block">
                  Recommended Annual Rent
                </span>
                <span className="text-xl font-extrabold text-[#2D5A3D]">
                  {formatNGN(estimatedPrice)} / yr
                </span>
                <span className="text-[11px] text-[#2D6A4F] font-semibold block">
                  Range: {formatNGN(Math.round(estimatedPrice * 0.85), true)} – {formatNGN(Math.round(estimatedPrice * 1.15), true)}
                </span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
