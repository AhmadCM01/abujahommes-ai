'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookmarkSimple,
  Play,
  Trash,
  Plus,
} from '@phosphor-icons/react'
import { Card, Button, Switch, EmptyState } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { SavedSearch } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

export default function SavedSearchesPage() {
  const { addToast } = useToast()
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)

  const loadSearches = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/saved-searches')
      if (res.ok) {
        const data = await res.json()
        setSearches(data.searches || [])
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({ title: 'Could not load searches', message: err.error || 'Server error', type: 'error' })
      }
    } catch {
      addToast({ title: 'Network error', message: 'Failed to connect to server', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSearches()
  }, [])

  const handleToggleAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/saved-searches?id=${id}`, {
        method: 'PATCH',
      })
      if (res.ok) {
        const data = await res.json()
        setSearches((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, alert_enabled: data.alertEnabled } : item
          )
        )
        addToast({
          title: 'Alert preferences updated',
          message: data.alertEnabled ? 'Email notifications enabled' : 'Email notifications paused',
          type: 'info',
        })
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({ title: 'Failed to update alert', message: err.error, type: 'error' })
      }
    } catch {
      addToast({ title: 'Error', message: 'Network error updating alert', type: 'error' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/saved-searches?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setSearches((prev) => prev.filter((item) => item.id !== id))
        addToast({ title: 'Saved search removed', type: 'info' })
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({ title: 'Failed to delete search', message: err.error, type: 'error' })
      }
    } catch {
      addToast({ title: 'Error', message: 'Network error deleting search', type: 'error' })
    }
  }

  const getQueryUrl = (search: SavedSearch) => {
    const params = new URLSearchParams()
    if (search.query_text) params.set('query', search.query_text)
    if (search.filters) {
      Object.entries(search.filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== 'any') {
          params.set(k, String(v))
        }
      })
    }
    const qs = params.toString()
    return `/dashboard/buyer/search${qs ? `?${qs}` : ''}`
  }

  const formatCriteria = (search: SavedSearch) => {
    const parts: string[] = []
    if (search.query_text) parts.push(`"${search.query_text}"`)
    if (search.filters) {
      if (search.filters.location) parts.push(String(search.filters.location))
      if (search.filters.propertyType && search.filters.propertyType !== 'any') parts.push(String(search.filters.propertyType))
      if (search.filters.transactionType && search.filters.transactionType !== 'any') parts.push(`For ${search.filters.transactionType}`)
      if (search.filters.bedrooms && search.filters.bedrooms !== 'any') parts.push(`${search.filters.bedrooms} bed`)
    }
    return parts.length > 0 ? parts.join(', ') : 'All Abuja properties'
  }

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
            Saved Searches &amp; Alerts
          </h1>
          <p className="text-xs text-[#5C5C5C] mt-0.5">
            Receive automated real-time alerts when properties matching your criteria are listed
          </p>
        </div>

        <Link href="/dashboard/buyer/search">
          <Button variant="primary" size="md" leftIcon={<Plus size={16} weight="bold" />}>
            New Search
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#5C5C5C] bg-white rounded-2xl border border-[#D6C9A8]">
          Loading your saved searches...
        </div>
      ) : searches.length === 0 ? (
        <EmptyState
          icon={<BookmarkSimple size={28} />}
          title="No saved searches yet"
          description="Save search criteria from the search page to receive automatic alerts whenever new matching Abuja properties become available."
        />
      ) : (
        <Card elevation="1" className="p-0 overflow-hidden bg-white border border-[#D6C9A8]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5EDD6] text-[#5C5C5C] font-bold uppercase tracking-wider border-b border-[#D6C9A8]">
                <tr>
                  <th className="p-4">Search Name</th>
                  <th className="p-4">Filter Criteria</th>
                  <th className="p-4">Matches</th>
                  <th className="p-4">Email Alerts</th>
                  <th className="p-4">Last Checked</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE0C4]">
                {searches.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FDFAF4] transition-colors">
                    <td className="p-4 font-bold text-[#1A1A1A]">
                      <div className="flex items-center gap-2">
                        <BookmarkSimple size={16} className="text-[#2D5A3D]" weight="fill" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[#5C5C5C] max-w-xs">{formatCriteria(item)}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-[#E8F5EF] text-[#2D6A4F]">
                        {item.result_count} active
                      </span>
                    </td>
                    <td className="p-4">
                      <Switch
                        checked={item.alert_enabled}
                        onChange={() => handleToggleAlert(item.id)}
                      />
                    </td>
                    <td className="p-4 text-[#9A9A9A] font-medium">
                      {item.last_run ? formatRelativeTime(item.last_run) : 'Recent'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={getQueryUrl(item)}>
                          <Button variant="secondary" size="sm" leftIcon={<Play size={12} weight="fill" />}>
                            Run
                          </Button>
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg text-[#9A9A9A] hover:text-[#C1121F] hover:bg-[#FEE2E2] transition-colors"
                          aria-label="Delete search"
                        >
                          <Trash size={16} />
                        </button>
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
  )
}
