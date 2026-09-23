'use client'

import React from 'react'
import {
  ChartBar,
  Eye,
  MagnifyingGlass,
  Coins,
  Sparkle,
  TrendUp,
  Clock,
} from '@phosphor-icons/react'
import { StatCard, Card } from '@/components/ui'
import { PriceTrendChart } from '@/components/charts/PriceTrendChart'
import { LGAComparisonChart } from '@/components/charts/LGAComparisonChart'
import { formatNGN } from '@/lib/utils'

export default function BuyerAnalyticsPage() {
  const searchHistory = [
    { query: '3 bedroom terrace in Gwarinpa', date: '15 Jul 2025', count: 18 },
    { query: 'Flat in Wuse 2 serviced with generator', date: '14 Jul 2025', count: 12 },
    { query: 'Maitama 4 bedroom detached duplex', date: '12 Jul 2025', count: 7 },
    { query: 'Affordable 2 bed in Lokogoma', date: '10 Jul 2025', count: 24 },
  ]

  return (
    <div className="space-y-8 text-left animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
          Buyer Intelligence &amp; Market Analytics
        </h1>
        <p className="text-xs sm:text-sm text-[#5C5C5C] mt-0.5">
          Real-time price trend indices, budget alignment analysis, and search analytics across Abuja
        </p>
      </div>

      {/* Section 1: Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Searches Run"
          value={38}
          trend="+22%"
          trendDirection="up"
          icon={<MagnifyingGlass size={20} weight="bold" />}
          iconBg="olive"
        />
        <StatCard
          label="Properties Inspected"
          value={19}
          subValue="Across 5 districts"
          icon={<Eye size={20} weight="bold" />}
          iconBg="sand"
        />
        <StatCard
          label="Fair Price Checks"
          value={14}
          subValue="AI valuations"
          icon={<Coins size={20} weight="fill" />}
          iconBg="amber"
        />
        <StatCard
          label="Avg Price in AMAC"
          value={formatNGN(3600000, true)}
          subValue="Rent index Q3"
          icon={<TrendUp size={20} weight="bold" />}
          iconBg="olive"
        />
      </div>

      {/* Section 2 & 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceTrendChart />
        <LGAComparisonChart userBudget={2500000} />
      </div>

      {/* Section 4: AI Insights Panel */}
      <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-4">
        <div className="flex items-center gap-2 text-[#2D5A3D]">
          <Sparkle size={20} weight="fill" />
          <h3 className="text-base font-bold text-[#1A1A1A]">
            AI Behavioural Market Insights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F5EDD6] border border-[#D6C9A8] space-y-1">
            <h4 className="font-bold text-[#2D5A3D]">Preferred District Activity</h4>
            <p className="text-[#5C5C5C] leading-relaxed">
              You search mostly in Gwarinpa. Prices there have stabilized this quarter at NGN 2.4M median for 3-beds.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F5EDD6] border border-[#D6C9A8] space-y-1">
            <h4 className="font-bold text-[#C9962A]">Budget Buying Power</h4>
            <p className="text-[#5C5C5C] leading-relaxed">
              Your budget of NGN 2.5M easily secures a luxury 3-bed in Lokogoma or a quality 2-bed in Gwarinpa.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F5EDD6] border border-[#D6C9A8] space-y-1">
            <h4 className="font-bold text-[#2D6A4F]">Title Distribution</h4>
            <p className="text-[#5C5C5C] leading-relaxed">
              92% of your viewed properties carry verified Certificate of Occupancy or Right of Occupancy documentation.
            </p>
          </div>
        </div>
      </Card>

      {/* Section 5: Search History */}
      <Card elevation="1" className="p-0 overflow-hidden bg-white border border-[#D6C9A8]">
        <div className="p-4 border-b border-[#EDE0C4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#5C5C5C]" />
            <h3 className="text-sm font-bold text-[#1A1A1A]">Search History (Last 30 Days)</h3>
          </div>
        </div>
        <div className="divide-y divide-[#EDE0C4]">
          {searchHistory.map((item, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4 text-xs">
              <span className="font-bold text-[#1A1A1A]">&quot;{item.query}&quot;</span>
              <div className="flex items-center gap-4 text-[#5C5C5C]">
                <span>{item.date}</span>
                <span className="font-semibold text-[#2D6A4F]">{item.count} matches</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
