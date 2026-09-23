'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HouseSimple,
  MagnifyingGlass,
  Heart,
  Bell,
  PlusCircle,
  SquaresFour,
  ChatCircleText,
  Gear,
} from '@phosphor-icons/react'
import { useNotificationStore } from '@/store/notifications'
import { useChatStore } from '@/store/chat'
import { UserRole } from '@/types'
import { cn } from '@/lib/utils'

export interface BottomNavProps {
  role?: UserRole
}

export const BottomNav: React.FC<BottomNavProps> = ({ role = 'buyer' }) => {
  const pathname = usePathname()
  const { unreadCount } = useNotificationStore()
  const unreadChatBuyer = useChatStore((s) => s.getUnreadCount('buyer'))
  const unreadChatSeller = useChatStore((s) => s.getUnreadCount('seller'))

  const buyerTabs = [
    { label: 'Home', href: '/dashboard/buyer', icon: HouseSimple },
    { label: 'Search', href: '/dashboard/buyer/search', icon: MagnifyingGlass },
    {
      label: 'Chat',
      href: '/dashboard/buyer/chat',
      icon: ChatCircleText,
      badge: unreadChatBuyer > 0 ? unreadChatBuyer : undefined,
    },
    { label: 'Saved', href: '/dashboard/buyer/favourites', icon: Heart },
    {
      label: 'Settings',
      href: '/dashboard/buyer/settings',
      icon: Gear,
    },
  ]

  const sellerTabs = [
    { label: 'Home', href: '/dashboard/seller', icon: HouseSimple },
    { label: 'New List', href: '/dashboard/seller/new-listing', icon: PlusCircle },
    {
      label: 'Messages',
      href: '/dashboard/seller/chat',
      icon: ChatCircleText,
      badge: unreadChatSeller > 0 ? unreadChatSeller : undefined,
    },
    { label: 'Listings', href: '/dashboard/seller/listings', icon: SquaresFour },
    {
      label: 'Settings',
      href: '/dashboard/seller/settings',
      icon: Gear,
    },
  ]

  const tabs = role === 'seller' ? sellerTabs : buyerTabs

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#D6C9A8] z-40 flex items-center justify-around px-2 shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive =
          pathname === tab.href ||
          (tab.href !== '/dashboard/buyer' &&
            tab.href !== '/dashboard/seller' &&
            pathname.startsWith(tab.href))

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 text-xs font-semibold relative transition-colors min-h-[44px]',
              isActive
                ? role === 'seller'
                  ? 'text-[#C9962A] font-bold'
                  : 'text-[#2D5A3D] font-bold'
                : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
            )}
          >
            <div className="relative">
              <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
              {tab.badge && (
                <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold bg-[#C1121F] text-white rounded-full min-w-[14px] h-[14px] flex items-center justify-center animate-pulse">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] leading-tight">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
