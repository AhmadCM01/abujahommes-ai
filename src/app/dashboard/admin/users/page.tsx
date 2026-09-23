'use client'

import React, { useState } from 'react'
import {
  Users,
  MagnifyingGlass,
  CheckCircle,
  Prohibit,
  ShieldCheck,
} from '@phosphor-icons/react'
import { Card, Button, Input, Badge, Tabs } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

interface UserItem {
  id: string
  name: string
  email: string
  role: 'buyer' | 'seller' | 'admin'
  listingsCount: number
  isSuspended: boolean
  joined: string
}

const INITIAL_USERS: UserItem[] = [
  { id: 'u-1', name: 'Ahmad Umar', email: 'ahmad@abujahommes.ai', role: 'admin', listingsCount: 4, isSuspended: false, joined: '01 Jul 2025' },
  { id: 'u-2', name: 'FCT Realty Partners', email: 'fct.realty@example.com', role: 'seller', listingsCount: 8, isSuspended: false, joined: '04 Jul 2025' },
  { id: 'u-3', name: 'Emeka Okafor', email: 'emeka.o@example.com', role: 'buyer', listingsCount: 0, isSuspended: false, joined: '08 Jul 2025' },
  { id: 'u-4', name: 'Suspicious Urgent Seller', email: 'urgent.landlord@example.com', role: 'seller', listingsCount: 1, isSuspended: true, joined: '14 Jul 2025' },
]

export default function AdminUsersPage() {
  const { addToast } = useToast()
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const handleToggleSuspend = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, isSuspended: !u.isSuspended } : u
      )
    )
    addToast({ title: 'User account status updated', type: 'info' })
  }

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
          User Directory &amp; Role Access
        </h1>
        <p className="text-xs text-[#5C5C5C] mt-0.5">
          Manage buyers, verified sellers, permissions, and account suspensions
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          tabs={[
            { id: 'all', label: 'All Users', count: users.length },
            { id: 'buyer', label: 'Buyers', count: users.filter((u) => u.role === 'buyer').length },
            { id: 'seller', label: 'Sellers', count: users.filter((u) => u.role === 'seller').length },
            { id: 'admin', label: 'Admins', count: users.filter((u) => u.role === 'admin').length },
          ]}
          activeTab={roleFilter}
          onChange={setRoleFilter}
        />

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<MagnifyingGlass size={16} />}
          />
        </div>
      </div>

      <Card elevation="1" className="p-0 overflow-hidden bg-white border border-[#D6C9A8]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5EDD6] text-[#5C5C5C] font-bold uppercase tracking-wider border-b border-[#D6C9A8]">
              <tr>
                <th className="p-4">User Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Listings</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE0C4]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#FDFAF4]">
                  <td className="p-4 font-bold text-[#1A1A1A]">{user.name}</td>
                  <td className="p-4 text-[#5C5C5C]">{user.email}</td>
                  <td className="p-4">
                    <span className="capitalize font-bold text-[#2D5A3D]">{user.role}</span>
                  </td>
                  <td className="p-4 font-semibold">{user.listingsCount}</td>
                  <td className="p-4">
                    {user.isSuspended ? (
                      <Badge variant="danger">Suspended</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </td>
                  <td className="p-4 text-[#9A9A9A]">{user.joined}</td>
                  <td className="p-4 text-right">
                    <Button
                      variant={user.isSuspended ? 'outline' : 'danger'}
                      size="sm"
                      onClick={() => handleToggleSuspend(user.id)}
                    >
                      {user.isSuspended ? 'Reinstate' : 'Suspend'}
                    </Button>
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
