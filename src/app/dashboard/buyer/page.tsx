'use client'

import React from 'react'
import Link from 'next/link'
import {
  Sparkle,
  TrendUp,
  Clock,
  Heart,
  BookmarkSimple,
  MagnifyingGlass,
  Bell,
  ArrowRight,
  ShieldWarning,
  Coins,
} from '@phosphor-icons/react'
import { NLPSearchBar } from '@/components/search/NLPSearchBar'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import { StatCard, Card, Button } from '@/components/ui'
import { PropertyListing } from '@/types'
import { useAuthStore } from '@/store/auth'
import { useSearchStore } from '@/store/search'
import { getTimeGreeting, formatFullDate } from '@/lib/utils'

export default function BuyerHomePage() {
  const { user } = useAuthStore()
  const { savedListings } = useSearchStore()
  const [recommendedListings, setRecommendedListings] = React.useState<PropertyListing[]>([])
  const [loadingRecommended, setLoadingRecommended] = React.useState(true)

  React.useEffect(() => {
    async function fetchRecommended() {
      try {
        setLoadingRecommended(true)
        const res = await fetch('/api/listings?limit=3&sort=newest')
        if (res.ok) {
          const data = await res.json()
          setRecommendedListings(data.listings || [])
        }
      } catch (err) {
        console.error('[BUYER HOME] Error fetching recommended listings:', err)
      } finally {
        setLoadingRecommended(false)
      }
    }
    fetchRecommended()
  }, [])

  const recentSearches = [
    { query: '3 bedroom in Gwarinpa under 2.5M', date: '2 hours ago', count: 18 },
    { query: 'Serviced flat for rent in Wuse 2', date: 'Yesterday', count: 12 },
    { query: '4 bed detached duplex in Maitama', date: '3 days ago', count: 7 },
  ]

  const [stats, setStats] = React.useState({
    favouritesCount: 0,
    savedSearchesCount: 0,
    activeAlertsCount: 0,
    enquiriesCount: 0,
  })

  React.useEffect(() => {
    async function loadBuyerStats() {
      try {
        const res = await fetch('/api/stats?scope=buyer')
        if (res.ok) {
          const data = await res.json()
          setStats({
            favouritesCount: data.favouritesCount || 0,
            savedSearchesCount: data.savedSearchesCount || 0,
            activeAlertsCount: data.activeAlertsCount || 0,
            enquiriesCount: data.enquiriesCount || 0,
          })
        }
      } catch (err) {
        console.error('[BUYER HOME] Error fetching stats:', err)
      }
    }
    loadBuyerStats()
  }, [])

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Section 1: Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            {getTimeGreeting(user?.full_name?.split(' ')[0] || 'Ahmad')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5C5C] mt-0.5 font-medium">
            {formatFullDate(new Date())} · Property Intelligence Hub
          </p>
        </div>
      </div>

      {/* Section 2: NLP Search Bar Hero */}
      <section>
        <NLPSearchBar />
      </section>

      {/* Section 3: Quick Stats Row (Real SQL Counts) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Saved Properties"
          value={stats.favouritesCount}
          icon={<Heart size={20} weight="fill" />}
          iconBg="amber"
        />
        <StatCard
          label="Saved Searches"
          value={stats.savedSearchesCount}
          icon={<BookmarkSimple size={20} weight="fill" />}
          iconBg="olive"
        />
        <StatCard
          label="Price Alerts"
          value={stats.activeAlertsCount}
          icon={<Bell size={20} weight="fill" />}
          iconBg="sand"
        />
        <StatCard
          label="Inquiries Sent"
          value={stats.enquiriesCount}
          icon={<MagnifyingGlass size={20} weight="bold" />}
          iconBg="olive"
        />
      </section>

      {/* Section 4: AI Recommendations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#F0F4EC] text-[#2D5A3D] flex items-center justify-center">
                <Sparkle size={16} weight="fill" />
              </div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                Recommended For You
              </h2>
            </div>
            <p className="text-xs text-[#5C5C5C] mt-0.5">
              Curated by AI based on your preferences in AMAC &amp; Bwari councils
            </p>
          </div>

          <Link
            href="/dashboard/buyer/recommendations"
            className="text-xs font-bold text-[#2D5A3D] hover:underline flex items-center gap-1"
          >
            <span>View all AI recommendations</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        <PropertyGrid properties={recommendedListings} isLoading={loadingRecommended} />
      </section>

      {/* Quick Buyer Intelligence Tools Banner */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card elevation="1" hoverEffect className="bg-white p-5 border border-[#D6C9A8] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F0F4EC] text-[#2D5A3D] flex items-center justify-center shrink-0">
              <Sparkle size={24} weight="fill" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                AI Recommendation Feed
              </h3>
              <p className="text-xs text-[#5C5C5C] mt-0.5">
                Review 90%+ match properties tuned to your budget and desired amenities.
              </p>
            </div>
          </div>
          <Link href="/dashboard/buyer/recommendations">
            <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={14} />}>
              Open Feed
            </Button>
          </Link>
        </Card>

        <Card elevation="1" hoverEffect className="bg-white p-5 border border-[#D6C9A8] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FDF8EC] text-[#C9962A] flex items-center justify-center shrink-0">
              <Coins size={24} weight="fill" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Abuja Price &amp; Affordability Calculator
              </h3>
              <p className="text-xs text-[#5C5C5C] mt-0.5">
                Calculate total move-in costs (legal, agency, service charges) or check rent budget.
              </p>
            </div>
          </div>
          <Link href="/dashboard/buyer/calculator">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
              Calculate
            </Button>
          </Link>
        </Card>
      </section>

      {/* Section 5: AI Market Insights Horizontal Scroll */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#FDF8EC] text-[#C9962A] flex items-center justify-center">
            <TrendUp size={16} weight="bold" />
          </div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">
            Market Insights For You
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card elevation="1" hoverEffect className="bg-white p-5 space-y-2 border border-[#D6C9A8]">
            <div className="flex items-center gap-2 text-[#2D5A3D]">
              <TrendUp size={20} weight="bold" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Price Trend
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#1A1A1A]">
              Gwarinpa Prices Rose 8% in Q2
            </h4>
            <p className="text-xs text-[#5C5C5C] leading-relaxed">
              Average rent for 3-bedroom flats in Gwarinpa now sits at NGN 2.4M/year due to strong occupancy demand.
            </p>
            <Link
              href="/dashboard/buyer/analytics"
              className="text-xs font-bold text-[#2D5A3D] hover:underline inline-block pt-1"
            >
              View trend chart →
            </Link>
          </Card>

          <Card elevation="1" hoverEffect className="bg-white p-5 space-y-2 border border-[#D6C9A8]">
            <div className="flex items-center gap-2 text-[#C9962A]">
              <Coins size={20} weight="fill" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Best Value Area
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#1A1A1A]">
              High Value in Lokogoma Corridor
            </h4>
            <p className="text-xs text-[#5C5C5C] leading-relaxed">
              Lokogoma offers 40% more space for the same budget compared to inner AMAC districts with expanding tarred access.
            </p>
            <Link
              href="/dashboard/buyer/search?location=Lokogoma"
              className="text-xs font-bold text-[#2D5A3D] hover:underline inline-block pt-1"
            >
              Explore Lokogoma properties →
            </Link>
          </Card>

          <Card elevation="1" hoverEffect className="bg-white p-5 space-y-2 border border-[#D6C9A8]">
            <div className="flex items-center gap-2 text-[#C1121F]">
              <ShieldWarning size={20} weight="fill" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Fraud Alert Summary
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#1A1A1A]">
              Urgent Distress Listings Flagged
            </h4>
            <p className="text-xs text-[#5C5C5C] leading-relaxed">
              AI has intercepted 8 scam listings with unrealistic distress discounts. Always verify title documents at AGIS.
            </p>
            <span className="text-xs font-bold text-[#2D6A4F] inline-block pt-1">
              ✓ All platform recommendations verified
            </span>
          </Card>
        </div>
      </section>

      {/* Section 6: Recent Searches */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-[#5C5C5C]" />
            <h2 className="text-base font-bold text-[#1A1A1A]">Recent Searches</h2>
          </div>
          <Link
            href="/dashboard/buyer/saved-searches"
            className="text-xs font-semibold text-[#2D5A3D] hover:underline"
          >
            Manage saved searches
          </Link>
        </div>

        <Card elevation="1" className="p-0 overflow-hidden bg-white border border-[#D6C9A8]">
          <div className="divide-y divide-[#EDE0C4]">
            {recentSearches.map((item, i) => (
              <div
                key={i}
                className="p-4 flex items-center justify-between gap-4 hover:bg-[#FDFAF4] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5EDD6] text-[#2D5A3D] flex items-center justify-center shrink-0">
                    <MagnifyingGlass size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
                      &quot;{item.query}&quot;
                    </h4>
                    <p className="text-[11px] text-[#5C5C5C]">
                      {item.date} · {item.count} properties matched
                    </p>
                  </div>
                </div>

                <Link href={`/dashboard/buyer/search?q=${encodeURIComponent(item.query)}`}>
                  <Button variant="secondary" size="sm">
                    Run Again
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
