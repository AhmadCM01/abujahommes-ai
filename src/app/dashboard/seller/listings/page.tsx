'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  PlusCircle,
  Eye,
  Heart,
  ChatCircle,
  Pencil,
  Pause,
  Play,
  Trash,
  DotsThreeVertical,
  HouseSimple,
} from '@phosphor-icons/react'
import { Tabs, Button, Card, Badge, Modal } from '@/components/ui'
import { formatNGN } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { PropertyListing } from '@/types'

export default function MyListingsPage() {
  const { addToast } = useToast()
  const [listings, setListings] = useState<PropertyListing[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [deleteListingId, setDeleteListingId] = useState<string | null>(null)

  const loadListings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/listings?owner=me')
      if (res.ok) {
        const data = await res.json()
        setListings(data.listings || [])
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({ title: 'Could not load listings', message: err.error || 'Server error', type: 'error' })
      }
    } catch {
      addToast({ title: 'Network error', message: 'Failed to connect to server', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadListings()
  }, [])

  const handleTogglePause = async (id: string) => {
    const current = listings.find((l) => l.id === id)
    if (!current) return
    const nextStatus = current.status === 'active' ? 'paused' : 'active'

    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (res.ok) {
        setListings((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: nextStatus } : item
          )
        )
        addToast({ title: 'Listing status updated', message: `Status changed to ${nextStatus}`, type: 'info' })
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({ title: 'Failed to update status', message: err.error, type: 'error' })
      }
    } catch {
      addToast({ title: 'Error', message: 'Failed to update listing', type: 'error' })
    }
  }

  const handleToggleSold = async (id: string) => {
    const current = listings.find((l) => l.id === id)
    if (!current) return
    const nextStatus = current.status === 'sold' ? 'active' : 'sold'

    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (res.ok) {
        setListings((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: nextStatus } : item
          )
        )
        addToast({
          title: 'Listing status updated',
          message: nextStatus === 'sold' ? 'Property marked as SOLD' : 'Property marked as Active',
          type: 'success',
        })
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({ title: 'Failed to update status', message: err.error, type: 'error' })
      }
    } catch {
      addToast({ title: 'Error', message: 'Failed to update listing', type: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!deleteListingId) return
    try {
      const res = await fetch(`/api/listings/${deleteListingId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== deleteListingId))
        setDeleteListingId(null)
        addToast({ title: 'Listing deleted', type: 'info' })
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({ title: 'Failed to delete listing', message: err.error, type: 'error' })
      }
    } catch {
      addToast({ title: 'Error', message: 'Failed to delete listing', type: 'error' })
    }
  }

  const filtered = listings.filter((l) => {
    if (activeTab === 'active') return l.status === 'active'
    if (activeTab === 'paused') return l.status === 'paused'
    if (activeTab === 'sold') return l.status === 'sold'
    if (activeTab === 'pending') return l.status === 'pending'
    return true
  })

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
            My Property Listings
          </h1>
          <p className="text-xs text-[#5C5C5C] mt-0.5">
            Manage your properties, pause or activate listings, and track engagement
          </p>
        </div>

        <Link href="/dashboard/seller/new-listing">
          <Button variant="primary" size="md" leftIcon={<PlusCircle size={18} weight="fill" />}>
            New Listing
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'all', label: 'All Listings', count: listings.length },
          { id: 'active', label: 'Active', count: listings.filter((l) => l.status === 'active').length },
          { id: 'paused', label: 'Paused', count: listings.filter((l) => l.status === 'paused').length },
          { id: 'sold', label: 'Sold', count: listings.filter((l) => l.status === 'sold').length },
          { id: 'pending', label: 'Pending Review', count: listings.filter((l) => l.status === 'pending').length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Listings Cards List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#5C5C5C] bg-white rounded-2xl border border-[#D6C9A8]">
          Loading your listings from the registry...
        </div>
      ) : filtered.length === 0 ? (
        <Card elevation="1" className="p-12 bg-white border border-[#D6C9A8] text-center space-y-3">
          <p className="text-sm font-bold text-[#1A1A1A]">No {activeTab !== 'all' ? activeTab : ''} listings found</p>
          <p className="text-xs text-[#5C5C5C]">
            {activeTab === 'all'
              ? 'You have not submitted any property listings yet.'
              : `You have no properties currently marked as ${activeTab}.`}
          </p>
          <Link href="/dashboard/seller/new-listing" className="inline-block pt-2">
            <Button variant="primary" size="sm">
              Add Your First Listing
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
          <Card
            key={item.id}
            elevation="1"
            className="p-4 sm:p-5 bg-white border border-[#D6C9A8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-2 transition-all"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#EDE0C4] shrink-0 border border-[#D6C9A8] flex items-center justify-center">
                {item.images && item.images.length > 0 && item.images[0] && typeof item.images[0] === 'string' && item.images[0].trim() !== '' ? (
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                ) : (
                  <HouseSimple size={32} weight="light" className="text-[#8F8165]" />
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={item.status === 'active' ? 'success' : item.status === 'sold' ? 'danger' : 'default'}>
                    {item.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-[#5C5C5C] font-semibold">
                    {item.location}, {item.lga}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#1A1A1A] truncate">{item.title}</h3>
                <span className="text-sm font-extrabold text-[#2D5A3D] block">
                  {formatNGN(item.asking_price, true)}{' '}
                  <span className="text-[10px] text-[#5C5C5C] font-normal">
                    {item.transaction_type === 'rent' ? '/ yr' : 'outright'}
                  </span>
                </span>
              </div>
            </div>

            {/* Metrics & Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EDE0C4]">
              <div className="flex items-center gap-4 text-xs text-[#5C5C5C]">
                <div className="flex items-center gap-1">
                  <Eye size={16} className="text-[#2D5A3D]" />
                  <span className="font-bold text-[#1A1A1A]">{item.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart size={16} className="text-[#C9962A]" weight="fill" />
                  <span className="font-bold text-[#1A1A1A]">{item.saves}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChatCircle size={16} className="text-[#2D5A3D]" weight="fill" />
                  <span className="font-bold text-[#1A1A1A]">{item.enquiries}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.status !== 'sold' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePause(item.id)}
                    leftIcon={item.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                  >
                    {item.status === 'active' ? 'Pause' : 'Activate'}
                  </Button>
                )}
                <Button
                  variant={item.status === 'sold' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => handleToggleSold(item.id)}
                  className={item.status === 'sold' ? 'text-[#2D5A3D]' : 'text-[#C1121F] hover:bg-[#FEE2E2]'}
                >
                  {item.status === 'sold' ? 'Mark Available' : 'Mark Sold'}
                </Button>
                <Link href={`/dashboard/buyer/property/${item.id}`}>
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                </Link>
                <button
                  onClick={() => setDeleteListingId(item.id)}
                  className="p-2 rounded-lg text-[#9A9A9A] hover:text-[#C1121F] hover:bg-[#FEE2E2]"
                  aria-label="Delete listing"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteListingId}
        onClose={() => setDeleteListingId(null)}
        title="Delete Property Listing"
        description="Are you sure you want to delete this listing? This action cannot be undone."
      >
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setDeleteListingId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Yes, Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
