'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MagnifyingGlass,
  List,
  SignOut,
  User,
  Gear,
  ShieldCheck,
  HouseSimple,
  Storefront,
} from '@phosphor-icons/react'
import { Logo } from '@/components/logo/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown } from '@/components/ui/Dropdown'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { useAuthStore } from '@/store/auth'
import { UserRole } from '@/types'

export interface TopBarProps {
  title?: string
  role?: UserRole
  onMenuClick?: () => void
}

export const TopBar: React.FC<TopBarProps> = ({
  title = 'Dashboard',
  role = 'buyer',
  onMenuClick,
}) => {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleSignOut = () => {
    logout()
    router.push('/auth/login')
  }

  const roleLabelMap: Record<UserRole, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    buyer: {
      label: 'Buyer Account',
      bg: 'bg-[#F0F4EC] border-[#A8C192]',
      text: 'text-[#2D5A3D]',
      icon: <HouseSimple size={14} weight="bold" />,
    },
    seller: {
      label: 'Seller Account',
      bg: 'bg-[#FDF8EC] border-[#F0CC77]',
      text: 'text-[#C9962A]',
      icon: <Storefront size={14} weight="bold" />,
    },
    agent: {
      label: 'Licensed Agent',
      bg: 'bg-[#EBF5FB] border-[#AED6F1]',
      text: 'text-[#2471A3]',
      icon: <ShieldCheck size={14} weight="bold" />,
    },
    admin: {
      label: 'System Admin',
      bg: 'bg-[#EDE0C4] border-[#D6C9A8]',
      text: 'text-[#1A1A1A]',
      icon: <ShieldCheck size={14} weight="fill" className="text-[#2D5A3D]" />,
    },
  }

  const currentBadge = roleLabelMap[role] || roleLabelMap.buyer

  // Server-verified profile menu items (no client role tampering)
  const profileDropdownItems = [
    {
      id: 'user-header',
      label: `${user?.full_name || 'User Account'}`,
      icon: <User size={16} />,
      disabled: true,
    },
    {
      id: 'settings',
      label: 'Account Settings',
      icon: <Gear size={16} />,
      onClick: () =>
        router.push(
          role === 'admin'
            ? '/dashboard/admin'
            : role === 'agent'
            ? '/dashboard/seller/settings'
            : `/dashboard/${role}/settings`
        ),
    },
    { id: 'div-logout', label: '', divider: true },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <SignOut size={16} className="text-[#C1121F]" />,
      onClick: handleSignOut,
    },
  ]

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#D6C9A8] px-4 md:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-[#1A1A1A] hover:bg-[#F0F4EC]"
          aria-label="Open menu"
        >
          <List size={22} weight="bold" />
        </button>

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center">
          <Logo variant="icon" width={32} height={32} />
        </div>

        {/* Desktop Page Title */}
        <h1 className="hidden md:block text-lg font-bold text-[#1A1A1A] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Role Badge Indicator */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${currentBadge.bg} ${currentBadge.text}`}
        >
          {currentBadge.icon}
          <span>{currentBadge.label}</span>
        </div>

        {/* Search button (mobile only) */}
        {role === 'buyer' && (
          <Link
            href="/dashboard/buyer/search"
            className="md:hidden p-2 text-[#5C5C5C] hover:text-[#2D5A3D] rounded-lg hover:bg-[#F0F4EC]"
          >
            <MagnifyingGlass size={20} />
          </Link>
        )}

        {/* Notification Bell Dropdown */}
        <NotificationBell />

        {/* User Profile Avatar Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center gap-2 pl-2 cursor-pointer group">
              <Avatar
                src={user?.avatar_url}
                fallback={user?.full_name || 'Ahmad Umar'}
                size="sm"
              />
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#2D5A3D]">
                  {user?.full_name || 'Ahmad Umar'}
                </span>
                <span className="text-[10px] text-[#5C5C5C] capitalize">
                  {role} Account
                </span>
              </div>
            </div>
          }
          items={profileDropdownItems}
        />
      </div>
    </header>
  )
}

export default TopBar
