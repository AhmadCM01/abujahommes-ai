'use client'

import React from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  TrendUp,
  MapPin,
  MagnifyingGlass,
  ArrowRight,
  CheckCircle,
  Buildings,
  Check,
  Coins,
} from '@phosphor-icons/react'
import { Logo } from '@/components/logo/Logo'
import { NLPSearchBar } from '@/components/search/NLPSearchBar'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import { Button, Card } from '@/components/ui'
import { PropertyListing } from '@/types'

const DISTRICT_ZONES = [
  {
    name: 'Prime & Diplomatic (Phase 1)',
    districts: ['Maitama', 'Asokoro', 'Guzape', 'Wuse 2', 'Garki 2', 'Central Area'],
  },
  {
    name: 'Phase 2 & Lifestyle Enclaves',
    districts: ['Jabi', 'Utako', 'Mabushi', 'Katampe Extension', 'Life Camp', 'Wuye'],
  },
  {
    name: 'Phase 3 & Key Corridors',
    districts: ['Gwarinpa', 'Lokogoma', 'Lugbe', 'Kubwa', 'Dawaki', 'Apo'],
  },
]

export default function LandingPage() {
  const [featuredProperties, setFeaturedProperties] = React.useState<PropertyListing[]>([])
  const [loading, setLoading] = React.useState(true)
  const [totalListings, setTotalListings] = React.useState(0)

  React.useEffect(() => {
    async function loadFeatured() {
      try {
        setLoading(true)
        const res = await fetch('/api/listings?limit=10&sort=newest')
        if (res.ok) {
          const data = await res.json()
          const allActive: PropertyListing[] = data.listings || []
          setTotalListings(data.total || allActive.length)

          // Only prefer rows that have genuine image photos
          const withPhotos = allActive.filter(
            (p) =>
              Array.isArray(p.images) &&
              p.images.length > 0 &&
              typeof p.images[0] === 'string' &&
              p.images[0].trim().length > 0
          )

          // Prefer low-risk listings; do not promote critical-risk listings in showcase if avoidable
          const riskRank: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 }
          const nonCritical = withPhotos.filter((p) => p.fraud_risk_level !== 'critical')
          const candidates = nonCritical.length > 0 ? nonCritical : withPhotos

          const sorted = [...candidates].sort((a, b) => {
            const rankA = riskRank[a.fraud_risk_level] ?? 1
            const rankB = riskRank[b.fraud_risk_level] ?? 1
            return rankA - rankB
          })

          // Show up to 3 listings with photos; do not pad with seed or random art
          setFeaturedProperties(sorted.slice(0, 3))
        }
      } catch (err) {
        console.error('[LANDING PAGE] Failed to load featured listings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadFeatured()
  }, [])

  return (
    <div className="min-h-screen bg-[#F5EDD6] text-[#1A1A1A] font-sans antialiased overflow-x-hidden selection:bg-[#2D5A3D] selection:text-white">
      {/* Top Public Header */}
      <header className="sticky top-0 z-40 h-14 sm:h-20 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#D6C9A8]/80 px-3 sm:px-6 md:px-8 flex items-center justify-between shadow-xs transition-all">
        <Logo variant="full" href="/" className="shrink-0" />

        {/* Desktop Header Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#5C5C5C]">
          <Link href="/dashboard/buyer/search" className="hover:text-[#2D5A3D] transition-colors">
            Search Directory
          </Link>
          <a href="#preview" className="hover:text-[#2D5A3D] transition-colors">
            Appraisal Engine
          </a>
          <a href="#benefits" className="hover:text-[#2D5A3D] transition-colors">
            Risk Scoring
          </a>
          <a href="#districts" className="hover:text-[#2D5A3D] transition-colors">
            Abuja Districts
          </a>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="font-bold text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="primary" size="sm" className="font-bold text-xs sm:text-sm px-2.5 sm:px-4 h-8 sm:h-9 shadow-xs">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-3 sm:px-6 md:px-8 pt-6 sm:pt-10 md:pt-14 pb-8 md:pb-12 max-w-6xl mx-auto text-center space-y-3.5 sm:space-y-4 md:space-y-5">
        {/* Subtle Ambient Radial Glow for Desktop Depth */}
        <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(45,90,61,0.08),transparent_70%)]" />

        {/* Top Location Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F4EC] border border-[#A8C192] text-[#2D5A3D] rounded-full text-[11px] sm:text-xs font-bold shadow-xs">
          <MapPin size={13} weight="fill" className="text-[#2D5A3D]" />
          <span>Built for Abuja · FCT only</span>
        </div>

        {/* Main H1 Headline */}
        <h1 className="text-[26px] xs:text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-[#1A1A1A] tracking-tight leading-[1.18] sm:leading-tight max-w-4xl mx-auto">
          Search Abuja Property with{' '}
          <span className="text-[#2D5A3D]">Fair Price Context</span> &amp;{' '}
          <span className="text-[#C9962A]">Less Fraud Risk</span>
        </h1>

        {/* Subhead */}
        <p className="text-xs sm:text-sm md:text-base text-[#5C5C5C] max-w-xl mx-auto leading-relaxed px-2">
          Built exclusively for Abuja. Check fair price ranges and listing risk scores across FCT districts before you inspect or pay.
        </p>

        {/* Hero Search Bar */}
        <div className="max-w-3xl mx-auto pt-1 sm:pt-2 text-left w-full">
          <NLPSearchBar initialExpanded={false} />
        </div>

        {/* Quick District Shortcuts (Tap/Click to Search) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 text-xs">
          <span className="text-[11px] font-bold text-[#8F8165] hidden sm:inline mr-1">
            Popular:
          </span>
          {['Maitama', 'Wuse 2', 'Gwarinpa', 'Guzape', 'Katampe Extension'].map((dist) => (
            <Link
              key={dist}
              href={`/dashboard/buyer/search?location=${encodeURIComponent(dist)}`}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/80 hover:bg-[#F0F4EC] text-[#5C5C5C] hover:text-[#2D5A3D] border border-[#D6C9A8]/70 transition-all shadow-2xs"
            >
              {dist}
            </Link>
          ))}
        </div>

        {/* Live Market Trust Ticks */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-8 gap-y-2 pt-1 text-xs text-[#5C5C5C] font-semibold">
          <div className="flex items-center gap-1.5">
            <CheckCircle size={16} className="text-[#2D6A4F]" weight="fill" />
            <span>Abuja-only search</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-[#2D6A4F]" weight="fill" />
            <span>Listing risk score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendUp size={16} className="text-[#2D6A4F]" weight="bold" />
            <span>Fair price range</span>
          </div>
        </div>

        {/* Desktop Product Preview: Real Appraisal & Risk Screening (No US Stock Houses) */}
        <div id="preview" className="hidden lg:block pt-8 text-left max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#D6C9A8] shadow-md overflow-hidden">
            {/* Mock App Window Header */}
            <div className="bg-[#FAF7EE] border-b border-[#D6C9A8] px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E57373]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFB74D]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#81C784]" />
                <span className="text-[11px] font-mono text-[#8F8165] ml-2">
                  abujahommes-ai.vercel.app/listing/wuse2-amac-492
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#2D5A3D] bg-[#F0F4EC] px-2.5 py-0.5 rounded-full border border-[#A8C192]">
                Live Appraisal Preview
              </span>
            </div>

            {/* Appraisal Content */}
            <div className="p-6 grid grid-cols-12 gap-6 bg-[#FDFAF4]">
              {/* Left Column: Property & Price Context (7 cols) */}
              <div className="col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2D5A3D] text-white">
                    AMAC · Wuse 2
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#1A1A1A] border border-[#D6C9A8]">
                    For Rent
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5EDD6] text-[#6B5E43]">
                    Aminu Kano Corridor
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-[#1A1A1A]">
                    3 Bedroom Serviced Apartment with BQ
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-[#2D5A3D]">
                      ₦8,500,000
                    </span>
                    <span className="text-xs text-[#5C5C5C] font-semibold">/ year</span>
                  </div>
                </div>

                {/* Fair Price Range Meter */}
                <div className="p-3.5 bg-white rounded-xl border border-[#EDE0C4] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#5C5C5C]">Estimated Fair Price Range</span>
                    <span className="text-[#2D5A3D] bg-[#F0F4EC] px-2 py-0.5 rounded-md font-semibold text-[11px]">
                      Fair Market Range
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#1A1A1A]">
                    <span>₦7,800,000</span>
                    <span className="text-[11px] text-[#2D5A3D] font-bold">Asking: ₦8.5M</span>
                    <span>₦9,200,000</span>
                  </div>
                  {/* Visual Range Bar */}
                  <div className="relative h-2.5 bg-[#EDE0C4] rounded-full overflow-hidden">
                    <div className="absolute left-[15%] right-[15%] h-full bg-[#A8C192] rounded-full" />
                    <div className="absolute left-[50%] -translate-x-1/2 top-0 bottom-0 w-2.5 bg-[#2D5A3D] rounded-full border border-white" />
                  </div>
                  <p className="text-[11px] text-[#7A7A7A] leading-tight">
                    Benchmark calibrated from recent 3-bedroom serviced rentals in Wuse 2.
                  </p>
                </div>

                {/* Features & Title */}
                <div className="flex items-center gap-3 text-xs text-[#5C5C5C] font-medium pt-1">
                  <span>3 Beds</span>
                  <span>·</span>
                  <span>3 Baths</span>
                  <span>·</span>
                  <span>Flat</span>
                  <span>·</span>
                  <span className="font-bold text-[#C9962A]">C of O</span>
                  <span>·</span>
                  <span>Standby Gen &amp; Security</span>
                </div>
              </div>

              {/* Right Column: Listing Risk Screening (5 cols) */}
              <div className="col-span-5 flex flex-col justify-between p-4 bg-white rounded-xl border border-[#EDE0C4] space-y-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Risk Screening
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-extrabold bg-[#F0F4EC] text-[#2D5A3D] border border-[#A8C192]">
                      <ShieldCheck size={14} weight="fill" />
                      <span>Low Risk · 12/100</span>
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-start gap-2 text-[#2D5A3D]">
                      <CheckCircle size={14} weight="fill" className="shrink-0 mt-0.5" />
                      <span className="text-[#1A1A1A] text-[11px] leading-snug">
                        Documented title type matches verified FCDA allocation format
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-[#2D5A3D]">
                      <CheckCircle size={14} weight="fill" className="shrink-0 mt-0.5" />
                      <span className="text-[#1A1A1A] text-[11px] leading-snug">
                        Asking price within historical Wuse 2 district bounds
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-[#2D5A3D]">
                      <CheckCircle size={14} weight="fill" className="shrink-0 mt-0.5" />
                      <span className="text-[#1A1A1A] text-[11px] leading-snug">
                        Zero duplicate image matches found across external portals
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-[#2D5A3D]">
                      <CheckCircle size={14} weight="fill" className="shrink-0 mt-0.5" />
                      <span className="text-[#1A1A1A] text-[11px] leading-snug">
                        Agent identity and contact history cross-checked
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EDE0C4]">
                  <p className="text-[10px] text-[#7A7A7A] leading-tight mb-2">
                    Screened before buyer inspection. Reduces unvetted distress-sale traps.
                  </p>
                  <Link href="/dashboard/buyer/search" className="block">
                    <Button variant="primary" size="sm" className="w-full text-xs font-bold py-1.5">
                      Explore All Screened Listings
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Pillar Market Intelligence Ribbon */}
      <section className="border-y border-[#D6C9A8]/70 bg-white/60 py-6 px-4 md:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-left">
          <div className="p-3 rounded-xl bg-white border border-[#EDE0C4] space-y-1">
            <div className="flex items-center gap-1.5 text-[#2D5A3D] font-bold text-xs">
              <Buildings size={16} weight="bold" />
              <span>6 Area Councils</span>
            </div>
            <p className="text-[11px] text-[#5C5C5C] leading-snug">
              Complete coverage across AMAC, Bwari, Gwagwalada, Kuje, Kwali &amp; Abaji.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#EDE0C4] space-y-1">
            <div className="flex items-center gap-1.5 text-[#2D5A3D] font-bold text-xs">
              <ShieldCheck size={16} weight="bold" />
              <span>7 Screening Rules</span>
            </div>
            <p className="text-[11px] text-[#5C5C5C] leading-snug">
              Detects photo reuse, bogus titles, and distress-sale pricing anomalies.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#EDE0C4] space-y-1">
            <div className="flex items-center gap-1.5 text-[#C9962A] font-bold text-xs">
              <Coins size={16} weight="bold" />
              <span>District Fair Ranges</span>
            </div>
            <p className="text-[11px] text-[#5C5C5C] leading-snug">
              Know typical rent and sale values in each neighborhood before negotiating.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#EDE0C4] space-y-1">
            <div className="flex items-center gap-1.5 text-[#2D5A3D] font-bold text-xs">
              <CheckCircle size={16} weight="bold" />
              <span>English &amp; Pidgin NLP</span>
            </div>
            <p className="text-[11px] text-[#5C5C5C] leading-snug">
              Search naturally: &quot;3-bed for Wuse 2&quot; or formal property specs.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Properties Showcase */}
      <section className="px-4 md:px-8 py-10 md:py-14 max-w-7xl mx-auto space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A]">
              Featured Abuja Listings
            </h2>
            <p className="text-xs text-[#5C5C5C]">
              Screened properties across Maitama, Wuse 2, Gwarinpa, and Guzape
            </p>
          </div>
          <Link
            href="/dashboard/buyer/search"
            className="text-xs font-bold text-[#2D5A3D] hover:underline flex items-center gap-1"
          >
            <span>Explore All {totalListings > 0 ? `${totalListings} ` : ''}Listings</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        <PropertyGrid
          properties={featuredProperties}
          isLoading={loading}
          emptyTitle="No featured listings with verified photos yet"
          emptyDescription="Browse the search directory to view all available Abuja properties across the 6 area councils."
        />
      </section>

      {/* 3 Concrete Product Benefits */}
      <section id="benefits" className="px-4 md:px-8 py-12 md:py-16 bg-white border-y border-[#D6C9A8]">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 text-center">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1A1A1A]">
              Three Tools for Safer Abuja Property Decisions
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5C5C] max-w-xl mx-auto">
              Structured price benchmarks, automated risk indicators, and search that understands local phrasing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left">
            <Card elevation="1" className="p-6 bg-[#FDFAF4] border border-[#EDE0C4] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F0F4EC] text-[#2D5A3D] flex items-center justify-center">
                <MagnifyingGlass size={26} weight="bold" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A]">
                Natural Language &amp; Pidgin Search
              </h3>
              <p className="text-xs text-[#5C5C5C] leading-relaxed">
                Type queries naturally in plain English or Nigerian Pidgin (e.g. &quot;3 bedroom flat for Wuse 2 under 5m&quot;). The search automatically parses your target district, bedroom count, and budget into active filters.
              </p>
            </Card>

            <Card elevation="1" className="p-6 bg-[#FDFAF4] border border-[#EDE0C4] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FDF8EC] text-[#C9962A] flex items-center justify-center">
                <TrendUp size={26} weight="bold" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A]">
                District Fair Price Ranges
              </h3>
              <p className="text-xs text-[#5C5C5C] leading-relaxed">
                Every listing is compared against historical transaction data for its specific Abuja district. See whether the asking price is within expected market bounds before negotiating.
              </p>
            </Card>

            <Card elevation="1" className="p-6 bg-[#FDFAF4] border border-[#EDE0C4] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F0F4EC] text-[#2D5A3D] flex items-center justify-center">
                <ShieldCheck size={26} weight="fill" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A]">
                Multi-Point Listing Risk Screening
              </h3>
              <p className="text-xs text-[#5C5C5C] leading-relaxed">
                Listings are screened against 7 common fraud indicators—flagging duplicate photos, unrealistic pricing, and title discrepancies before you schedule an inspection.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Abuja Districts Explorer */}
      <section id="districts" className="px-4 md:px-8 py-12 md:py-16 max-w-6xl mx-auto text-left space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A]">
            Explore Abuja by Districts &amp; Corridors
          </h2>
          <p className="text-xs text-[#5C5C5C]">
            Fast search across primary residential and investment locations in the FCT
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DISTRICT_ZONES.map((zone) => (
            <div key={zone.name} className="p-5 bg-white rounded-2xl border border-[#D6C9A8]/80 space-y-3 shadow-xs">
              <span className="text-xs font-bold text-[#2D5A3D] uppercase tracking-wider block">
                {zone.name}
              </span>
              <div className="flex flex-wrap gap-2">
                {zone.districts.map((dist) => (
                  <Link
                    key={dist}
                    href={`/dashboard/buyer/search?location=${encodeURIComponent(dist)}`}
                    className="px-3 py-1.5 bg-[#FDFAF4] hover:bg-[#F0F4EC] hover:border-[#2D5A3D] text-[#1A1A1A] hover:text-[#2D5A3D] font-bold text-xs rounded-xl border border-[#EDE0C4] transition-all"
                  >
                    {dist}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Honest Footer CTA */}
      <section className="px-4 md:px-8 py-12 md:py-16 bg-[#2D5A3D] text-white text-center">
        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Search Available Properties or List With AbujaHommes
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-lg mx-auto leading-relaxed">
            Whether you are searching for a rental or listing a property in Abuja, start with clear pricing context and structured listing details.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2 max-w-md mx-auto">
            <Link href="/dashboard/buyer/search" className="w-full sm:w-auto">
              <Button variant="amber" size="lg" className="w-full sm:w-auto font-bold shadow-md">
                Search Abuja Properties
              </Button>
            </Link>
            <Link href="/dashboard/seller/new-listing" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white hover:bg-white/10 font-bold">
                List a Property
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#122416] text-white/70 py-10 md:py-12 px-4 md:px-8 text-xs border-t border-[#1E3D29]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <Logo variant="white" width={180} height={42} href="/" />
            <p className="text-[11px] text-white/50">
              Property Intelligence for Abuja · Founded by Ahmad Umar
            </p>
          </div>

          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-4 sm:gap-6 font-semibold">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">
              Portal Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
