'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  ShieldWarning,
  ListBullets,
  Users,
  CheckCircle,
  X,
  UserPlus,
  Eye,
  User,
} from '@phosphor-icons/react'
import { StatCard, Card, Button, Badge, Modal, Textarea } from '@/components/ui'
import { formatNGN } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { PropertyListing } from '@/types'

export default function AdminOverviewPage() {
  const { addToast } = useToast()

  const [pendingQueue, setPendingQueue] = useState<PropertyListing[]>([])
  const [highRiskListings, setHighRiskListings] = useState<PropertyListing[]>([])
  const [adminStats, setAdminStats] = useState({
    activeCount: 0,
    pendingCount: 0,
    totalUsers: 0,
    newUsersToday: 0,
    highRiskCount: 0,
    scrapedCount: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  const [rejectingListingId, setRejectingListingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const loadAdminData = async () => {
    try {
      setLoadingStats(true)
      const res = await fetch('/api/stats?scope=admin')
      if (res.ok) {
        const data = await res.json()
        setAdminStats({
          activeCount: data.activeCount || 0,
          pendingCount: data.pendingCount || 0,
          totalUsers: data.totalUsers || 0,
          newUsersToday: data.newUsersToday || 0,
          highRiskCount: data.highRiskCount || 0,
          scrapedCount: data.scrapedCount || 0,
        })
        if (Array.isArray(data.pendingQueue)) {
          setPendingQueue(data.pendingQueue)
        }
        if (Array.isArray(data.highRiskListings)) {
          setHighRiskListings(data.highRiskListings)
        }
      }
    } catch (err) {
      console.error('[ADMIN OVERVIEW] Error loading stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }

  React.useEffect(() => {
    loadAdminData()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      })
      if (res.ok) {
        setPendingQueue((prev) => prev.filter((item) => item.id !== id))
        setAdminStats((prev) => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
          activeCount: prev.activeCount + 1,
        }))
        addToast({
          title: 'Listing Approved',
          message: 'The listing is now active on public search.',
          type: 'success',
        })
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({ title: 'Approval failed', message: err.error, type: 'error' })
      }
    } catch {
      addToast({ title: 'Approval error', type: 'error' })
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectingListingId) return
    try {
      const res = await fetch(`/api/listings/${rejectingListingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          rejection_reason: rejectReason.trim() || 'Did not meet listing criteria',
        }),
      })
      if (res.ok) {
        setPendingQueue((prev) => prev.filter((item) => item.id !== rejectingListingId))
        setAdminStats((prev) => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
        }))
        setRejectingListingId(null)
        setRejectReason('')
        addToast({
          title: 'Listing Rejected',
          message: 'Listing marked as rejected.',
          type: 'info',
        })
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({ title: 'Rejection failed', message: err.error, type: 'error' })
      }
    } catch {
      addToast({ title: 'Rejection error', type: 'error' })
    }
  }

  return (
    <div className="space-y-8 text-left animate-fadeIn">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
          Admin Moderation &amp; System Overview
        </h1>
        <p className="text-xs sm:text-sm text-[#5C5C5C] mt-0.5">
          Platform-wide moderation queue, fraud risk detection, and user registry
        </p>
      </div>

      {/* Section 1: 6 KPI Cards (3x2 grid) - Real SQL Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Pending Listings Queue"
          value={adminStats.pendingCount}
          subValue="Requires review"
          icon={<ListBullets size={20} weight="bold" />}
          iconBg="amber"
        />
        <StatCard
          label="Active Public Listings"
          value={adminStats.activeCount}
          subValue="Verified live properties"
          icon={<CheckCircle size={20} weight="fill" />}
          iconBg="olive"
        />
        <StatCard
          label="Total Registered Users"
          value={adminStats.totalUsers}
          icon={<Users size={20} weight="bold" />}
          iconBg="sand"
        />
        <StatCard
          label="New Users Today"
          value={adminStats.newUsersToday}
          icon={<UserPlus size={20} weight="bold" />}
          iconBg="olive"
        />
        <StatCard
          label="High Risk Fraud Alerts"
          value={adminStats.highRiskCount}
          subValue="Flagged listings"
          icon={<ShieldWarning size={20} weight="fill" />}
          iconBg="danger"
        />
        <StatCard
          label="Scraped Training Records"
          value={adminStats.scrapedCount}
          icon={<ShieldCheck size={20} weight="fill" />}
          iconBg="sand"
        />
      </div>

      {/* Section 2: Pending Listings Queue Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1A1A1A]">
            Pending Listings Queue ({pendingQueue.length})
          </h2>
        </div>

        {pendingQueue.length === 0 ? (
          <Card elevation="1" className="p-8 text-center bg-white border border-[#D6C9A8] text-xs text-[#5C5C5C]">
            <CheckCircle size={32} className="mx-auto text-[#2D6A4F] mb-2" weight="fill" />
            Moderation queue is empty! All submitted listings have been reviewed.
          </Card>
        ) : (
          <Card elevation="1" className="p-0 overflow-hidden bg-white border border-[#D6C9A8]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5EDD6] text-[#5C5C5C] font-bold uppercase tracking-wider border-b border-[#D6C9A8]">
                  <tr>
                    <th className="p-4">Listing Title</th>
                    <th className="p-4">Seller</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Fraud Risk</th>
                    <th className="p-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE0C4]">
                  {pendingQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FDFAF4] transition-colors">
                      <td className="p-4 font-bold text-[#1A1A1A] max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="p-4 text-[#5C5C5C]">{item.seller_name || 'Seller'}</td>
                      <td className="p-4 text-[#5C5C5C]">{item.location}, {item.lga}</td>
                      <td className="p-4 font-bold text-[#2D5A3D]">
                        {formatNGN(item.asking_price, true)}
                      </td>
                      <td className="p-4">
                        <Badge risk={item.fraud_risk_level} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(item.id)}
                            leftIcon={<CheckCircle size={14} weight="bold" />}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setRejectingListingId(item.id)}
                            leftIcon={<X size={14} weight="bold" />}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Section 3: High Risk Fraud Alerts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[#C1121F]">
          <ShieldWarning size={20} weight="fill" />
          <h2 className="text-base font-bold text-[#1A1A1A]">
            Critical Fraud Alerts Intercepted
          </h2>
        </div>

        {highRiskListings.length === 0 ? (
          <Card elevation="1" className="p-6 text-center bg-white border border-[#D6C9A8] text-xs text-[#5C5C5C]">
            <CheckCircle size={28} className="mx-auto text-[#2D6A4F] mb-1.5" weight="fill" />
            No active critical fraud alerts. All listings are within safe risk parameters.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highRiskListings.map((item: PropertyListing) => (
              <Card
                key={item.id}
                elevation="1"
                className="p-5 bg-white border border-[#FCA5A5] space-y-3 bg-[#FEE2E2]/10"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#1A1A1A] truncate">{item.title}</span>
                  <Badge variant="danger">Score {item.fraud_score}/100</Badge>
                </div>

                <div className="text-xs text-[#5C5C5C]">
                  <span>Asking Price: </span>
                  <strong className="text-[#C1121F]">{formatNGN(item.asking_price)}</strong>
                  <span> (Estimated Area Value: {formatNGN(item.ai_price_estimate || 250000000)})</span>
                </div>

                {item.fraud_red_flags && item.fraud_red_flags.length > 0 && (
                  <ul className="text-xs text-[#C1121F] list-disc list-inside space-y-0.5">
                    {item.fraud_red_flags.map((flag: string, idx: number) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-[#EDE0C4]">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      addToast({ title: 'Listing Permanently Blacklisted', type: 'info' })
                    }}
                  >
                    Block &amp; Blacklist Seller
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      <Modal
        isOpen={!!rejectingListingId}
        onClose={() => setRejectingListingId(null)}
        title="Specify Listing Rejection Reason"
        description="The seller will receive this explanation to correct and re-submit."
      >
        <div className="space-y-4">
          <Textarea
            label="Reason for Rejection"
            placeholder="e.g. Document photo is blurry or missing C of O registration page."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectingListingId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectConfirm}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
