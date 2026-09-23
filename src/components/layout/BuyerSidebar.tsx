'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  HouseSimple,
  MagnifyingGlass,
  Sparkle,
  Calculator,
  ChatCircleText,
  Heart,
  BookmarkSimple,
  ChartBar,
  Bell,
  Gear,
  SignOut,
  X,
} from '@phosphor-icons/react'
import { Logo } from '@/components/logo/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth'
import { useNotificationStore } from '@/store/notifications'
import { useChatStore } from '@/store/chat'
import { cn } from '@/lib/utils'

export interface BuyerSidebarProps {
  onCloseMobile?: () => void
}

export const BuyerSidebar: React.FC<BuyerSidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const unreadChatCount = useChatStore((s) => s.getUnreadCount('buyer'))

  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const navItems = [
    { label: 'Home', href: '/dashboard/buyer', icon: HouseSimple },
    { label: 'Search Properties', href: '/dashboard/buyer/search', icon: MagnifyingGlass },
    { label: 'AI Recommendations', href: '/dashboard/buyer/recommendations', icon: Sparkle },
    { label: 'Price Calculator', href: '/dashboard/buyer/calculator', icon: Calculator },
    {
      label: 'Live Chat',
      href: '/dashboard/buyer/chat',
      icon: ChatCircleText,
      badge: unreadChatCount > 0 ? unreadChatCount : undefined,
    },
    { label: 'Favourites', href: '/dashboard/buyer/favourites', icon: Heart },
    {
      label: 'Saved Searches',
      href: '/dashboard/buyer/saved-searches',
      icon: BookmarkSimple,
    },
    { label: 'Market Analytics', href: '/dashboard/buyer/analytics', icon: ChartBar },
    {
      label: 'Notifications',
      href: '/dashboard/buyer/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ]

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <>
      <aside className="w-64 h-full bg-[#2D5A3D] text-white flex flex-col justify-between p-4 shrink-0 shadow-lg select-none">
        <div>
          {/* Top Logo & Close */}
          <div className="flex items-center justify-between px-2 pt-2 pb-5">
            <Logo variant="white" href="/dashboard/buyer" />
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-white/80 hover:bg-white/20"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <hr className="border-t border-[#7DA35B]/40 mb-4" />

          {/* Nav label */}
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
            Buyer Hub
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard/buyer' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-white text-[#2D5A3D] shadow-sm font-bold'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'px-1.5 py-0.2 text-[10px] font-bold rounded-full',
                        isActive
                          ? 'bg-[#2D5A3D] text-white'
                          : 'bg-white text-[#2D5A3D]'
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

        {/* Bottom User Profile card */}
        <div className="pt-4 border-t border-[#7DA35B]/40 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <Avatar
              src={user?.avatar_url}
              fallback={user?.full_name || 'User'}
              size="sm"
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate">
                {user?.full_name || 'User Profile'}
              </p>
              <span className="inline-block text-[10px] px-1.5 py-0.2 bg-white/20 text-white rounded font-medium">
                Buyer Account
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={() => router.push('/dashboard/buyer/settings')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white/80 hover:bg-white/15 rounded-lg transition-colors"
            >
              <Gear size={16} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#FCA5A5] hover:bg-[#C1121F]/30 rounded-lg transition-colors"
            >
              <SignOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign Out"
        description="Are you sure you want to sign out of your account?"
      >
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setShowLogoutModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleLogout}
          >
            Yes, Sign Out
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default BuyerSidebar
