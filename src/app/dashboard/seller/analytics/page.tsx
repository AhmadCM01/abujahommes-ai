'use client'

import React from 'react'
import {
  ChartBar,
  Eye,
  Heart,
  ChatCircle,
  TrendUp,
  Percent,
} from '@phosphor-icons/react'
import { StatCard, Card } from '@/components/ui'
import { ListingPerformanceChart } from '@/components/charts/ListingPerformanceChart'
import { LGAComparisonChart } from '@/components/charts/LGAComparisonChart'
import { formatNGN } from '@/lib/utils'

export default function SellerAnalyticsPage() {
  const performanceRows = [
    { title: 'Luxury 4-Bed Detached Duplex', location: 'Maitama', views: 840, saves: 94, enquiries: 18, conversion: '11.2%' },
    { title: 'Serviced 3-Bed Apartment', location: 'Wuse 2', views: 1250, saves: 142, enquiries: 31, conversion: '11.4%' },
    { title: 'Terrace Duplex 3-Bedroom', location: 'Gwarinpa', views: 2100, saves: 218, enquiries: 46, conversion: '10.4%' },
  ]

  const [sellerStats, setSellerStats] = React.useState({
    activeCount: 0,
    pendingCount: 0,
    totalViews: 0,
    totalSaves: 0,
    totalEnquiries: 0,
  })

  React.useEffect(() => {
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
        console.error('[SELLER ANALYTICS] Failed to load stats:', err)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="space-y-8 text-left animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
          Listing Performance &amp; Analytics
        </h1>
        <p className="text-xs sm:text-sm text-[#5C5C5C] mt-0.5">
          Detailed metrics, view progression, and buyer inquiry conversion rates
        </p>
      </div>

      {/* Section 1: 5 Stats (Real SQL Counts) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
          label="Inquiries Received"
          value={sellerStats.totalEnquiries}
          icon={<ChatCircle size={20} weight="fill" />}
          iconBg="olive"
        />
        <StatCard
          label="Active Properties"
          value={sellerStats.activeCount}
          icon={<TrendUp size={20} weight="bold" />}
          iconBg="sand"
        />
        <StatCard
          label="Pending Review"
          value={sellerStats.pendingCount}
          icon={<Percent size={20} weight="bold" />}
          iconBg="olive"
        />
      </div>

      {/* Section 2 & 4: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ListingPerformanceChart />
        <LGAComparisonChart userBudget={3000000} />
      </div>

      {/* Section 3: Listing Conversion Table */}
      <Card elevation="1" className="p-0 overflow-hidden bg-white border border-[#D6C9A8]">
        <div className="p-4 border-b border-[#EDE0C4]">
          <h3 className="text-sm font-bold text-[#1A1A1A]">
            Conversion Breakdown by Property
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EDD6] text-[#5C5C5C] font-bold uppercase tracking-wider border-b border-[#D6C9A8]">
              <tr>
                <th className="p-4">Listing</th>
                <th className="p-4">District</th>
                <th className="p-4">Views</th>
                <th className="p-4">Saves</th>
                <th className="p-4">Direct Inquiries</th>
                <th className="p-4">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE0C4]">
              {performanceRows.map((row, i) => (
                <tr key={i} className="hover:bg-[#FDFAF4]">
                  <td className="p-4 font-bold text-[#1A1A1A]">{row.title}</td>
                  <td className="p-4 text-[#5C5C5C]">{row.location}</td>
                  <td className="p-4 font-semibold">{row.views}</td>
                  <td className="p-4 font-semibold">{row.saves}</td>
                  <td className="p-4 font-bold text-[#2D5A3D]">{row.enquiries}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-[#E8F5EF] text-[#2D6A4F]">
                      {row.conversion}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
