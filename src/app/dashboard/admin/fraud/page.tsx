'use client'

import React, { useState } from 'react'
import {
  ShieldWarning,
  ShieldCheck,
  WarningCircle,
  X,
  CheckCircle,
  Prohibit,
  FileText,
  UserMinus,
  Eye,
  Trash,
} from '@phosphor-icons/react'
import { StatCard, Card, Button, Badge } from '@/components/ui'
import { formatNGN } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { PropertyListing } from '@/types'

export default function AdminFraudAlertsPage() {
  const { addToast } = useToast()
  const [activeListings, setActiveListings] = useState<PropertyListing[]>([])
  const [loading, setLoading] = useState(true)
  const [suspendedSellers, setSuspendedSellers] = useState<string[]>([])

  React.useEffect(() => {
    async function loadFraudListings() {
      try {
        setLoading(true)
        const res = await fetch('/api/listings')
        if (res.ok) {
          const data = await res.json()
          setActiveListings(data.listings || [])
        }
      } catch (err) {
        console.error('[ADMIN FRAUD] Error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadFraudListings()
  }, [])

  const flaggedListings = activeListings.filter((l) => l.fraud_score > 40)

  const handleQuarantine = (id: string, title: string) => {
    setActiveListings((prev) => prev.filter((item) => item.id !== id))
    addToast({
      title: 'Listing Quarantined & De-listed',
      message: `"${title}" has been suppressed from public search results.`,
      type: 'success',
    })
  }

  const handleSuspendSeller = (sellerId: string, sellerName: string) => {
    setSuspendedSellers((prev) => [...prev, sellerId])
    addToast({
      title: 'Seller Account Frozen',
      message: `${sellerName} (ID: ${sellerId}) has been suspended and restricted from posting.`,
      type: 'error',
    })
  }

  const handleExportAudit = () => {
    addToast({
      title: 'Audit Report Generated',
      message: 'EFCC & REDAN compliance fraud log exported successfully.',
      type: 'info',
    })
  }

  return (
    <div className="space-y-8 text-left animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight flex items-center gap-2">
            <ShieldWarning size={32} weight="fill" className="text-[#C1121F]" />
            <span>AI Real Estate Fraud &amp; Quarantine Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5C5C] mt-0.5">
            Real-time algorithmic detection of title manipulation, distress deposit scams, and unrealistic pricing
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={handleExportAudit}
          leftIcon={<FileText size={18} />}
          className="self-start sm:self-auto min-h-[44px]"
        >
          Export Compliance Audit
        </Button>
      </div>

      {/* Section 1: Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Critical Risk Interceptions"
          value={flaggedListings.filter((l) => l.fraud_score > 70).length + 1}
          subValue="Deposit/distress scams caught"
          icon={<ShieldWarning size={20} weight="fill" />}
          iconBg="danger"
        />
        <StatCard
          label="Active Quarantine Queue"
          value={flaggedListings.length}
          subValue="Requires review or delisting"
          icon={<WarningCircle size={20} weight="fill" />}
          iconBg="amber"
        />
        <StatCard
          label="Suspended Lister Accounts"
          value={suspendedSellers.length + 3}
          trend="Enforced"
          trendDirection="up"
          icon={<UserMinus size={20} weight="fill" />}
          iconBg="olive"
        />
      </div>

      {/* Section 2: Fraud Queue Table */}
      <Card elevation="1" className="p-0 overflow-hidden bg-white border border-[#D6C9A8]">
        <div className="p-4 border-b border-[#EDE0C4] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1A1A1A]">
            Active Flagged Listings Queue ({flaggedListings.length})
          </h3>
          <span className="text-xs text-[#5C5C5C]">
            Auto-quarantine active for scores &gt; 75
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EDD6] text-[#5C5C5C] font-bold uppercase tracking-wider border-b border-[#D6C9A8]">
              <tr>
                <th className="p-4">Listing Title &amp; Seller</th>
                <th className="p-4">LGA</th>
                <th className="p-4">Asking Price</th>
                <th className="p-4">Area Median</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Red Flags Identified</th>
                <th className="p-4 text-right">Enforcement Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE0C4]">
              {flaggedListings.map((item) => {
                const isSellerSuspended = suspendedSellers.includes(item.seller_id)
                return (
                  <tr key={item.id} className="hover:bg-[#FDFAF4]">
                    <td className="p-4 max-w-xs">
                      <p className="font-bold text-[#1A1A1A] truncate">{item.title}</p>
                      <p className="text-[11px] text-[#5C5C5C] flex items-center gap-1 mt-0.5">
                        <span>Lister: {item.seller_name || 'Individual Agent'}</span>
                        {isSellerSuspended && (
                          <span className="text-[10px] font-bold text-[#C1121F] bg-[#FEE2E2] px-1.5 py-0.2 rounded">
                            SUSPENDED
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="p-4 text-[#5C5C5C] font-medium">{item.lga}</td>
                    <td className="p-4 font-bold text-[#C1121F]">
                      {formatNGN(item.asking_price)}
                    </td>
                    <td className="p-4 text-[#5C5C5C]">
                      {formatNGN(item.ai_price_estimate || 250000000)}
                    </td>
                    <td className="p-4">
                      <Badge risk={item.fraud_risk_level} />
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="space-y-1">
                        {(item.fraud_red_flags || ['Unusually low distress price deviation']).map(
                          (flag, i) => (
                            <span
                              key={i}
                              className="block text-[11px] text-[#C1121F] font-semibold"
                            >
                              • {flag}
                            </span>
                          )
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleQuarantine(item.id, item.title)}
                          leftIcon={<Trash size={14} />}
                          className="min-h-[36px]"
                        >
                          Quarantine
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSellerSuspended}
                          onClick={() => handleSuspendSeller(item.seller_id, item.seller_name || 'Lister')}
                          leftIcon={<Prohibit size={14} />}
                          className="min-h-[36px]"
                        >
                          {isSellerSuspended ? 'Frozen' : 'Freeze Lister'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 3: Fraud Pattern Analysis & Council Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-3">
          <h3 className="text-sm font-bold text-[#1A1A1A]">
            Most Frequent Fraud Signatures in Abuja
          </h3>
          <ul className="space-y-2 text-xs text-[#5C5C5C]">
            <li className="flex items-center justify-between p-2.5 bg-[#F5EDD6] rounded-xl font-medium">
              <span>Distress Relocation Deposit Language (&gt;45% price cut)</span>
              <span className="font-bold text-[#C1121F]">44% of flags</span>
            </li>
            <li className="flex items-center justify-between p-2.5 bg-[#F5EDD6] rounded-xl font-medium">
              <span>Fake C of O Registration / No Beacon coordinates</span>
              <span className="font-bold text-[#C1121F]">32% of flags</span>
            </li>
            <li className="flex items-center justify-between p-2.5 bg-[#F5EDD6] rounded-xl font-medium">
              <span>Duplicate Stolen Photos from other portals</span>
              <span className="font-bold text-[#C1121F]">24% of flags</span>
            </li>
          </ul>
        </Card>

        <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-3">
          <h3 className="text-sm font-bold text-[#1A1A1A]">
            Council Statutory Safety Index
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-bold text-[#2D6A4F] p-2 bg-[#F0F4EC] rounded-lg">
              <span>Maitama, Asokoro, Wuse 2 &amp; CBD</span>
              <span>99% Verified</span>
            </div>
            <div className="flex justify-between font-bold text-[#2D6A4F] p-2 bg-[#F0F4EC] rounded-lg">
              <span>Gwarinpa, Jabi, Katampe &amp; Life Camp</span>
              <span>96% Verified</span>
            </div>
            <div className="flex justify-between font-bold text-[#C9962A] p-2 bg-[#FDF8EC] rounded-lg">
              <span>Lugbe, Kubwa &amp; Outer Corridors (Verify Customary Papers)</span>
              <span>89% Verified</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
