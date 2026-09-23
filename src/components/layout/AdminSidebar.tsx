'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  SquaresFour,
  ListBullets,
  Users,
  ShieldWarning,
  Database,
  ChartBar,
  Bell,
  Gear,
  SignOut,
  X,
  ShieldCheck,
} from '@phosphor-icons/react'
import { Logo } from '@/components/logo/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

export interface AdminSidebarProps {
  onCloseMobile?: () => void
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const navItems = [
    { label: 'Overview', href: '/dashboard/admin', icon: SquaresFour },
    { label: 'Listings', href: '/dashboard/admin/listings', icon: ListBullets },
    { label: 'Users', href: '/dashboard/admin/users', icon: Users },
    { label: 'Fraud Alerts', href: '/dashboard/admin/fraud', icon: ShieldWarning, badge: 2 },
    { label: 'Data Management', href: '/dashboard/admin/data', icon: Database },
    { label: 'Analytics', href: '/dashboard/admin/analytics', icon: ChartBar },
  ]

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <>
      <aside className="w-64 h-full bg-white text-[#1A1A1A] border-r-2 border-[#2D5A3D] flex flex-col justify-between p-4 shrink-0 shadow-sm select-none">
        <div>
          {/* Top Logo */}
          <div className="flex items-center justify-between px-2 pt-2 pb-5">
            <Logo variant="full" width={160} height={38} href="/dashboard/admin" />
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-[#5C5C5C] hover:bg-[#F0F4EC]"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Admin badge */}
          <div className="px-3 py-1.5 mb-4 bg-[#F0F4EC] border border-[#A8C192] rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D5A3D]">
              <ShieldCheck size={16} weight="fill" />
              <span>Admin Portal</span>
            </div>
            <span className="text-[10px] bg-[#2D5A3D] text-white px-1.5 py-0.2 rounded font-mono font-bold">
              SUPER
            </span>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard/admin' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-[#2D5A3D] text-white shadow-sm'
                      : 'text-[#5C5C5C] hover:bg-[#F0F4EC] hover:text-[#2D5A3D]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'px-1.5 py-0.2 text-[10px] font-bold rounded-full',
                        isActive
                          ? 'bg-[#C1121F] text-white'
                          : 'bg-[#FEE2E2] text-[#C1121F]'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom User Profile */}
        <div className="pt-4 border-t border-[#EDE0C4] space-y-3">
          <div className="flex items-center gap-3 px-2">
            <Avatar
              src={user?.avatar_url}
              fallback="Admin"
              size="sm"
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-[#1A1A1A] truncate">
                {user?.full_name || 'System Admin'}
              </p>
              <span className="text-[10px] text-[#2D5A3D] font-bold">
                Platform Moderator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={() => router.push('/dashboard/admin/settings')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#5C5C5C] hover:bg-[#F0F4EC] rounded-lg transition-colors"
            >
              <Gear size={16} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#C1121F] hover:bg-[#FEE2E2] rounded-lg transition-colors"
            >
              <SignOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Admin Sign Out"
        description="Are you sure you want to end your administrative session?"
      >
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Confirm Sign Out
          </Button>
        </div>
      </Modal>
    </>
  )
}
