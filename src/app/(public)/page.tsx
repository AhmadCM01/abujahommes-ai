'use client'

import React from 'react'
import Link from 'next/link'
import {
  Sparkle,
  ShieldCheck,
  TrendUp,
  HouseSimple,
  MagnifyingGlass,
  ArrowRight,
  CheckCircle,
  Coins,
  Buildings,
  Lock,
} from '@phosphor-icons/react'
import { Logo } from '@/components/logo/Logo'
import { NLPSearchBar } from '@/components/search/NLPSearchBar'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import { Button, Card } from '@/components/ui'
import { POPULAR_LOCATIONS } from '@/lib/data/locations'
import { PropertyListing } from '@/types'

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

          // Only prefer rows that have a real images[0] (Storage or valid URL)
          const withPhotos = allActive.filter(
            (p) =>
              Array.isArray(p.images) &&
              p.images.length > 0 &&
              typeof p.images[0] === 'string' &&
              p.images[0].trim().length > 0
          )

          // Show up to 3 listings with photos; do not pad with seed or random art
          setFeaturedProperties(withPhotos.slice(0, 3))
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
    <div className="min-h-screen bg-[#F5EDD6] text-[#1A1A1A] font-sans antialiased overflow-x-hidden">
      {/* Top Public Header */}
      <header className="sticky top-0 z-40 h-20 bg-white/90 backdrop-blur-md border-b border-[#D6C9A8] px-4 md:px-8 flex items-center justify-between shadow-xs">
        <Logo variant="full" href="/" />

        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="md" className="font-bold text-xs sm:text-sm">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="primary" size="md" className="font-bold text-xs sm:text-sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 md:px-8 pt-12 md:pt-20 pb-16 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F0F4EC] border border-[#A8C192] text-[#2D5A3D] rounded-full text-xs font-bold shadow-xs">
          <Sparkle size={14} weight="fill" />
          <span>Next-Gen Real Estate Intelligence for Abuja</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight max-w-4xl mx-auto">
          Search Abuja Properties in <span className="text-[#2D5A3D]">Pidgin</span> &amp; <span className="text-[#C9962A]">English</span> with Fair Price AI
        </h1>

        <p className="text-sm sm:text-lg text-[#5C5C5C] max-w-2xl mx-auto leading-relaxed">
          The only property platform built exclusively for Abuja. Accurate valuations, verified C of O titles, and algorithmic fraud detection.
        </p>

        {/* Hero Search Bar */}
        <div className="max-w-3xl mx-auto pt-4 text-left">
          <NLPSearchBar />
        </div>

        {/* Live Market Ticker */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-[#5C5C5C] font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-[#2D6A4F]" weight="fill" />
            <span>Abuja-only search</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#2D6A4F]" weight="fill" />
            <span>Listing risk score</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendUp size={18} className="text-[#2D6A4F]" weight="bold" />
            <span>Fair price range</span>
          </div>
        </div>
      </section>

      {/* Featured Properties Showcase (only displayed if loading or active photo listings exist) */}
      {(loading || featuredProperties.length > 0) && (
        <section className="px-4 md:px-8 py-12 max-w-7xl mx-auto space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-extrabold text-[#1A1A1A]">
                Featured Abuja Listings
              </h2>
              <p className="text-xs text-[#5C5C5C]">
                Active listings across Maitama, Wuse 2, Gwarinpa, and Guzape
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

          <PropertyGrid properties={featuredProperties} isLoading={loading} />
        </section>
      )}

      {/* 3 Core Value Propositions */}
      <section className="px-4 md:px-8 py-16 bg-white border-y border-[#D6C9A8]">
        <div className="max-w-6xl mx-auto space-y-12 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
              Why Abuja Real Estate Runs on AbujaHommes AI
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5C5C] max-w-xl mx-auto">
              Engineered from the ground up to solve pricing opacity and fraudulent listings in the Federal Capital Territory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <Card elevation="1" className="p-6 bg-[#FDFAF4] border border-[#EDE0C4] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F0F4EC] text-[#2D5A3D] flex items-center justify-center">
                <Sparkle size={26} weight="fill" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A]">
                Pidgin &amp; Natural Search
              </h3>
              <p className="text-xs text-[#5C5C5C] leading-relaxed">
                Describe exactly what you want: &quot;I wan rent flat for Wuse 2 no go pass 800k&quot; and our search assistant accurately extracts budget, beds, and district instantly.
              </p>
            </Card>

            <Card elevation="1" className="p-6 bg-[#FDFAF4] border border-[#EDE0C4] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FDF8EC] text-[#C9962A] flex items-center justify-center">
                <Coins size={26} weight="fill" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A]">
                AI Fair Price Prediction
              </h3>
              <p className="text-xs text-[#5C5C5C] leading-relaxed">
                Trained on real Abuja market transactions. Know the true fair value of any flat, terrace, or land plot before paying an agent.
              </p>
            </Card>

            <Card elevation="1" className="p-6 bg-[#FDFAF4] border border-[#EDE0C4] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] text-[#C1121F] flex items-center justify-center">
                <ShieldCheck size={26} weight="fill" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A]">
                Title &amp; Fraud Detection
              </h3>
              <p className="text-xs text-[#5C5C5C] leading-relaxed">
                Every listing is scored against 7 risk indicators. Fake distress sales, duplicate photos, and bogus titles are caught before you inspect.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Abuja Districts Explorer */}
      <section className="px-4 md:px-8 py-16 max-w-6xl mx-auto text-left space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A]">
            Explore Abuja by Popular Districts
          </h2>
          <p className="text-xs text-[#5C5C5C]">
            Fast search across all primary residential and investment corridors
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {POPULAR_LOCATIONS.map((loc) => (
            <Link
              key={loc}
              href={`/dashboard/buyer/search?location=${encodeURIComponent(loc)}`}
              className="px-4 py-2 bg-white hover:bg-[#F0F4EC] hover:border-[#2D5A3D] text-[#1A1A1A] hover:text-[#2D5A3D] font-bold text-xs rounded-xl border border-[#D6C9A8] transition-all shadow-xs"
            >
              {loc}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="px-4 md:px-8 py-16 bg-[#2D5A3D] text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to find your next home in Abuja?
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-lg mx-auto">
            Browse listings with transparent market valuation and fraud risk screening.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2 max-w-sm mx-auto">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button variant="amber" size="lg" className="w-full sm:w-auto font-bold">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white hover:bg-white/10 font-bold">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#122416] text-white/70 py-12 px-4 md:px-8 text-xs border-t border-[#1E3D29]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <Logo variant="white" width={180} height={42} href="/" />
            <p className="text-[11px] text-white/50">
              Property Intelligence for Abuja · Founded by Ahmad Umar
            </p>
          </div>

          <div className="flex items-center gap-6 font-semibold">
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
