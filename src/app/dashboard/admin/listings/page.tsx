'use client'

import React, { useState } from 'react'
import {
  MagnifyingGlass,
  CheckCircle,
  X,
  Trash,
  SlidersHorizontal,
} from '@phosphor-icons/react'
import { Card, Button, Input, Select, Badge, Tabs } from '@/components/ui'
import { formatNGN } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { PropertyListing } from '@/types'

export default function AdminListingsPage() {
  const { addToast } = useToast()
  const [listings, setListings] = useState<PropertyListing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  React.useEffect(() => {
    async function loadAdminListings() {
      try {
        setLoading(true)
        const res = await fetch('/api/listings')
        if (res.ok) {
          const data = await res.json()
          setListings(data.listings || [])
        }
      } catch (err) {
        console.error('[ADMIN LISTINGS] Error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAdminListings()
  }, [])

  const handleBulkApprove = () => {
    setListings((prev) =>
      prev.map((item) => ({ ...item, status: 'active' }))
    )
    addToast({ title: 'All pending listings approved', type: 'success' })
  }

  const handleDelete = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id))
    addToast({ title: 'Listing removed from database', type: 'info' })
  }

  const filtered = listings.filter((item) => {
    if (activeTab === 'active' && item.status !== 'active') return false
    if (activeTab === 'pending' && item.status !== 'pending') return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      return (
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.lga.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
            Listings Management &amp; Moderation
          </h1>
          <p className="text-xs text-[#5C5C5C] mt-0.5">
            Full registry of active, pending, and flagged Abuja properties
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleBulkApprove}
          leftIcon={<CheckCircle size={16} weight="bold" />}
        >
          Bulk Approve Pending
        </Button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          tabs={[
            { id: 'all', label: 'All Listings', count: listings.length },
            { id: 'active', label: 'Active', count: listings.filter((l) => l.status === 'active').length },
            { id: 'pending', label: 'Pending', count: listings.filter((l) => l.status === 'pending').length },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by title or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<MagnifyingGlass size={16} />}
          />
        </div>
      </div>

      {/* Table */}
      <Card elevation="1" className="p-0 overflow-hidden bg-white border border-[#D6C9A8]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EDD6] text-[#5C5C5C] font-bold uppercase tracking-wider border-b border-[#D6C9A8]">
              <tr>
                <th className="p-4">Listing Title</th>
                <th className="p-4">Council</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Safety Score</th>
                <th className="p-4">Views</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE0C4]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#FDFAF4]">
                  <td className="p-4 font-bold text-[#1A1A1A] max-w-xs truncate">
                    {item.title}
                  </td>
                  <td className="p-4 text-[#5C5C5C]">{item.location}, {item.lga}</td>
                  <td className="p-4 font-bold text-[#2D5A3D]">
                    {formatNGN(item.asking_price, true)}
                  </td>
                  <td className="p-4">
                    <Badge variant={item.status === 'active' ? 'success' : 'warning'}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge risk={item.fraud_risk_level} />
                  </td>
                  <td className="p-4 font-semibold">{item.views}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-[#9A9A9A] hover:text-[#C1121F] hover:bg-[#FEE2E2]"
                      aria-label="Delete listing"
                    >
                      <Trash size={16} />
                    </button>
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
