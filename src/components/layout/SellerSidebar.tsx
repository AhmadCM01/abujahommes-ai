'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  HouseSimple,
  ListBullets,
  PlusCircle,
  CurrencyNgn,
  ChatCircleText,
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

export interface SellerSidebarProps {
  onCloseMobile?: () => void
}

export const SellerSidebar: React.FC<SellerSidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const unreadChatCount = useChatStore((s) => s.getUnreadCount('seller'))

  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const navItems = [
    { label: 'Overview', href: '/dashboard/seller', icon: HouseSimple },
    { label: 'My Listings', href: '/dashboard/seller/listings', icon: ListBullets },
    { label: 'New Listing', href: '/dashboard/seller/new-listing', icon: PlusCircle },
    { label: 'Price Tool', href: '/dashboard/seller/price-tool', icon: CurrencyNgn },
    {
      label: 'Buyer Messages',
      href: '/dashboard/seller/chat',
      icon: ChatCircleText,
      badge: unreadChatCount > 0 ? unreadChatCount : undefined,
    },
    { label: 'Analytics', href: '/dashboard/seller/analytics', icon: ChartBar },
    {
      label: 'Notifications',
      href: '/dashboard/seller/notifications',
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
      <aside className="w-64 h-full bg-[#1E3D29] text-white flex flex-col justify-between p-4 shrink-0 shadow-lg select-none">
        <div>
          {/* Top Logo & Close */}
          <div className="flex items-center justify-between px-2 pt-2 pb-5">
            <Logo variant="white" href="/dashboard/seller" />
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
            Seller Portal
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard/seller' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-[#C9962A] text-white shadow-sm font-bold'
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
                          ? 'bg-white text-[#1E3D29]'
                          : 'bg-[#C9962A] text-white'
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
              fallback={user?.full_name || 'Seller'}
              size="sm"
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate">
                {user?.full_name || 'Seller Profile'}
              </p>
              <span className="inline-block text-[10px] px-1.5 py-0.2 bg-[#C9962A]/40 text-white rounded font-medium">
                Seller Account
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={() => router.push('/dashboard/seller/settings')}
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

export default SellerSidebar
